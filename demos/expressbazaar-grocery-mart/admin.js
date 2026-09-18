(function () {
  "use strict";

  const config = window.EXPRESS_BAZAAR_CONFIG || {};
  const seed = window.EXPRESS_BAZAAR_SEED || { categories: [], products: [] };
  const state = {
    pin: sessionStorage.getItem("expressbazaar-admin-pin") || "",
    categories: [],
    products: [],
    settings: {},
    search: "",
    category: "all",
    stock: "all"
  };
  const el = {};
  let toastTimer;

  document.addEventListener("DOMContentLoaded", init);

  function init() {
    cacheElements();
    bindEvents();
    if (!apiUrl()) {
      el.apiMissingAlert.hidden = false;
      el.loginButton.disabled = true;
      return;
    }
    if (state.pin) authenticate(state.pin, true);
  }

  function cacheElements() {
    [
      "loginView", "dashboardView", "apiMissingAlert", "loginForm", "adminPin", "loginButton",
      "logoutButton", "productStat", "stockStat", "outStockStat", "categoryStat", "productsPanel",
      "categoriesPanel", "settingsPanel", "importCatalogButton", "addProductButton", "adminProductSearch",
      "adminCategoryFilter", "adminStockFilter", "adminProductList", "adminProductsEmpty",
      "addCategoryButton", "categoryAdminGrid", "settingsForm", "saveSettingsButton", "productDialog",
      "productForm", "productDialogTitle", "saveProductButton", "categoryDialog", "categoryForm",
      "categoryDialogTitle", "saveCategoryButton", "toast"
    ].forEach((id) => { el[id] = document.getElementById(id); });
  }

  function bindEvents() {
    el.loginForm.addEventListener("submit", (event) => {
      event.preventDefault();
      authenticate(el.adminPin.value.trim(), false);
    });
    el.logoutButton.addEventListener("click", logout);
    document.querySelector(".admin-tabs").addEventListener("click", (event) => {
      const button = event.target.closest("[data-tab]");
      if (button) switchTab(button.dataset.tab);
    });
    el.adminProductSearch.addEventListener("input", () => { state.search = el.adminProductSearch.value.trim(); renderProducts(); });
    el.adminCategoryFilter.addEventListener("change", () => { state.category = el.adminCategoryFilter.value; renderProducts(); });
    el.adminStockFilter.addEventListener("change", () => { state.stock = el.adminStockFilter.value; renderProducts(); });
    el.addProductButton.addEventListener("click", () => openProductDialog());
    el.addCategoryButton.addEventListener("click", () => openCategoryDialog());
    el.importCatalogButton.addEventListener("click", importStarterCatalog);
    el.adminProductList.addEventListener("click", handleProductListAction);
    el.categoryAdminGrid.addEventListener("click", handleCategoryListAction);
    el.productForm.addEventListener("submit", saveProduct);
    el.categoryForm.addEventListener("submit", saveCategory);
    el.settingsForm.addEventListener("submit", saveSettings);
    document.querySelectorAll(".dialog-close").forEach((button) => {
      button.addEventListener("click", () => button.closest("dialog").close());
    });
  }

  function apiUrl() {
    return String(config.API_URL || "").trim();
  }

  async function authenticate(pin, silent) {
    if (!/^.{4,}$/.test(pin)) {
      if (!silent) showToast("Enter the admin PIN created during setup.");
      return;
    }
    setButtonBusy(el.loginButton, true, "Checking…");
    try {
      await apiPost("authenticate", {}, pin);
      state.pin = pin;
      sessionStorage.setItem("expressbazaar-admin-pin", pin);
      el.loginView.hidden = true;
      el.dashboardView.hidden = false;
      await loadCatalog();
    } catch (error) {
      sessionStorage.removeItem("expressbazaar-admin-pin");
      state.pin = "";
      if (!silent) showToast(error.message || "Incorrect PIN.");
    } finally {
      setButtonBusy(el.loginButton, false, "Open admin panel");
    }
  }

  function logout() {
    state.pin = "";
    sessionStorage.removeItem("expressbazaar-admin-pin");
    el.dashboardView.hidden = true;
    el.loginView.hidden = false;
    el.adminPin.value = "";
    el.adminPin.focus();
  }

  async function loadCatalog() {
    try {
      const url = new URL(apiUrl());
      url.searchParams.set("action", "catalog");
      url.searchParams.set("_", Date.now());
      const response = await fetch(url.toString(), { cache: "no-store", redirect: "follow" });
      if (!response.ok) throw new Error("Could not load the catalogue.");
      const result = await response.json();
      if (!result.ok) throw new Error(result.error || "Could not load the catalogue.");
      state.categories = (result.categories || []).map(normalizeCategory);
      state.products = (result.products || []).map(normalizeProduct);
      state.settings = result.settings || {};
      renderDashboard();
    } catch (error) {
      showToast(error.message);
    }
  }

  function normalizeCategory(category) {
    return {
      ...category,
      sortOrder: Number(category.sortOrder || 0),
      active: category.active === true || String(category.active).toLowerCase() === "true"
    };
  }

  function normalizeProduct(product) {
    return {
      ...product,
      price: Number(product.price || 0),
      sortOrder: Number(product.sortOrder || 0),
      featured: product.featured === true || String(product.featured).toLowerCase() === "true",
      stockStatus: String(product.stockStatus).toLowerCase() === "out" ? "out" : "in"
    };
  }

  function renderDashboard() {
    el.productStat.textContent = state.products.length;
    el.stockStat.textContent = state.products.filter((product) => product.stockStatus === "in").length;
    el.outStockStat.textContent = state.products.filter((product) => product.stockStatus === "out").length;
    el.categoryStat.textContent = state.categories.length;
    renderCategoryOptions();
    renderProducts();
    renderCategories();
    populateSettings();
  }

  function renderCategoryOptions() {
    const sorted = [...state.categories].sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));
    el.adminCategoryFilter.innerHTML = `<option value="all">All categories</option>` + sorted.map((category) =>
      `<option value="${escapeAttribute(category.id)}">${escapeHtml(category.name)}</option>`
    ).join("");
    el.productForm.elements.categoryId.innerHTML = sorted.map((category) =>
      `<option value="${escapeAttribute(category.id)}">${escapeHtml(category.name)}</option>`
    ).join("");
    el.adminCategoryFilter.value = state.categories.some((category) => category.id === state.category) ? state.category : "all";
  }

  function renderProducts() {
    const categoryMap = Object.fromEntries(state.categories.map((category) => [category.id, category]));
    const query = state.search.toLowerCase();
    const products = [...state.products]
      .filter((product) => {
        const matchesQuery = !query || product.name.toLowerCase().includes(query);
        const matchesCategory = state.category === "all" || product.categoryId === state.category;
        const matchesStock = state.stock === "all" || product.stockStatus === state.stock;
        return matchesQuery && matchesCategory && matchesStock;
      })
      .sort((a, b) => a.name.localeCompare(b.name));

    el.adminProductsEmpty.hidden = products.length !== 0;
    el.adminProductList.hidden = products.length === 0;
    el.adminProductList.innerHTML = products.map((product) => {
      const category = categoryMap[product.categoryId];
      return `<article class="admin-product-row">
        <div class="admin-product-thumb">${productImage(product)}</div>
        <div class="admin-product-main"><strong>${escapeHtml(product.name)}</strong><small>${escapeHtml(product.unit)}</small></div>
        <div class="admin-product-category">${escapeHtml(category ? category.name : "Uncategorised")}</div>
        <div class="admin-product-price">${formatCurrency(product.price)}</div>
        <div class="admin-stock ${product.stockStatus === "out" ? "out" : ""}">${product.stockStatus === "out" ? "Out" : "In stock"}</div>
        <div class="row-actions">
          <button type="button" data-product-action="edit" data-id="${escapeAttribute(product.id)}">Edit</button>
          <button type="button" class="delete-button" data-product-action="delete" data-id="${escapeAttribute(product.id)}">Delete</button>
        </div>
      </article>`;
    }).join("");
    attachImageFallbacks(el.adminProductList);
  }

  function renderCategories() {
    const counts = state.products.reduce((acc, product) => {
      acc[product.categoryId] = (acc[product.categoryId] || 0) + 1;
      return acc;
    }, {});
    el.categoryAdminGrid.innerHTML = [...state.categories]
      .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name))
      .map((category) => `<article class="category-admin-card" style="--accent:${escapeAttribute(category.accent || "#49a667")}">
        <span>${escapeHtml(category.icon || "📦")}</span>
        <h3>${escapeHtml(category.name)}</h3>
        <p>${counts[category.id] || 0} products · ${category.active ? "Visible" : "Hidden"}</p>
        <div class="category-admin-actions">
          <button type="button" data-category-action="edit" data-id="${escapeAttribute(category.id)}">Edit</button>
          <button type="button" data-category-action="delete" data-id="${escapeAttribute(category.id)}">Delete</button>
        </div>
      </article>`).join("");
  }

  function populateSettings() {
    const form = el.settingsForm.elements;
    form.storeName.value = state.settings.storeName || config.STORE_NAME || "ExpressBazaar";
    form.whatsappNumber.value = state.settings.whatsappNumber || config.WHATSAPP_NUMBER || "";
    form.address.value = state.settings.address || config.ADDRESS || "";
    form.deliveryFee.value = Number(state.settings.deliveryFee || config.DELIVERY_FEE || 0);
    form.minimumOrder.value = Number(state.settings.minimumOrder || config.MINIMUM_ORDER || 0);
  }

  function switchTab(tab) {
    document.querySelectorAll(".admin-tabs [data-tab]").forEach((button) => button.classList.toggle("active", button.dataset.tab === tab));
    document.querySelectorAll("[data-panel]").forEach((panel) => { panel.hidden = panel.dataset.panel !== tab; });
  }

  function openProductDialog(product) {
    if (!state.categories.length) {
      showToast("Add a category before adding products.");
      switchTab("categories");
      return;
    }
    el.productForm.reset();
    const form = el.productForm.elements;
    el.productDialogTitle.textContent = product ? "Edit product" : "Add product";
    form.id.value = product ? product.id : "";
    form.name.value = product ? product.name : "";
    form.categoryId.value = product ? product.categoryId : state.categories[0].id;
    form.unit.value = product ? product.unit : "1 piece";
    form.price.value = product ? product.price : "";
    form.stockStatus.value = product ? product.stockStatus : "in";
    form.emoji.value = product ? (product.emoji || "📦") : "📦";
    form.sortOrder.value = product ? product.sortOrder : state.products.length + 1;
    form.featured.checked = Boolean(product && product.featured);
    form.imageUrl.value = product ? (product.imageUrl || "") : "";
    el.productDialog.showModal();
  }

  function openCategoryDialog(category) {
    el.categoryForm.reset();
    const form = el.categoryForm.elements;
    el.categoryDialogTitle.textContent = category ? "Edit category" : "Add category";
    form.id.value = category ? category.id : "";
    form.name.value = category ? category.name : "";
    form.icon.value = category ? (category.icon || "📦") : "📦";
    form.accent.value = category ? (category.accent || "#49a667") : "#49a667";
    form.sortOrder.value = category ? category.sortOrder : state.categories.length + 1;
    form.active.checked = category ? category.active : true;
    el.categoryDialog.showModal();
  }

  function handleProductListAction(event) {
    const button = event.target.closest("[data-product-action]");
    if (!button) return;
    const product = state.products.find((item) => item.id === button.dataset.id);
    if (!product) return;
    if (button.dataset.productAction === "edit") openProductDialog(product);
    if (button.dataset.productAction === "delete") deleteProduct(product);
  }

  function handleCategoryListAction(event) {
    const button = event.target.closest("[data-category-action]");
    if (!button) return;
    const category = state.categories.find((item) => item.id === button.dataset.id);
    if (!category) return;
    if (button.dataset.categoryAction === "edit") openCategoryDialog(category);
    if (button.dataset.categoryAction === "delete") deleteCategory(category);
  }

  async function saveProduct(event) {
    event.preventDefault();
    const form = el.productForm.elements;
    setButtonBusy(el.saveProductButton, true, "Saving…");
    try {
      let imageUrl = form.imageUrl.value.trim();
      const imageFile = form.imageFile.files[0];
      if (imageFile) {
        if (imageFile.size > 4 * 1024 * 1024) throw new Error("The product image must be 4 MB or smaller.");
        const dataUrl = await readFileAsDataUrl(imageFile);
        const upload = await apiPost("uploadImage", {
          fileName: imageFile.name,
          mimeType: imageFile.type,
          base64: dataUrl.split(",")[1]
        });
        imageUrl = upload.imageUrl;
      }
      await apiPost("saveProduct", { product: {
        id: form.id.value.trim(),
        name: form.name.value.trim(),
        categoryId: form.categoryId.value,
        unit: form.unit.value.trim(),
        price: Number(form.price.value),
        stockStatus: form.stockStatus.value,
        emoji: form.emoji.value.trim() || "📦",
        imageUrl,
        featured: form.featured.checked,
        sortOrder: Number(form.sortOrder.value || 0)
      }});
      el.productDialog.close();
      await loadCatalog();
      showToast("Product saved.");
    } catch (error) {
      showToast(error.message);
    } finally {
      setButtonBusy(el.saveProductButton, false, "Save product");
    }
  }

  async function deleteProduct(product) {
    if (!window.confirm(`Delete “${product.name}”? This cannot be undone.`)) return;
    try {
      await apiPost("deleteProduct", { id: product.id });
      await loadCatalog();
      showToast("Product deleted.");
    } catch (error) {
      showToast(error.message);
    }
  }

  async function saveCategory(event) {
    event.preventDefault();
    const form = el.categoryForm.elements;
    setButtonBusy(el.saveCategoryButton, true, "Saving…");
    try {
      await apiPost("saveCategory", { category: {
        id: form.id.value.trim(),
        name: form.name.value.trim(),
        icon: form.icon.value.trim() || "📦",
        accent: form.accent.value,
        sortOrder: Number(form.sortOrder.value || 0),
        active: form.active.checked
      }});
      el.categoryDialog.close();
      await loadCatalog();
      showToast("Category saved.");
    } catch (error) {
      showToast(error.message);
    } finally {
      setButtonBusy(el.saveCategoryButton, false, "Save category");
    }
  }

  async function deleteCategory(category) {
    if (!window.confirm(`Delete “${category.name}”? Empty categories only can be deleted.`)) return;
    try {
      await apiPost("deleteCategory", { id: category.id });
      await loadCatalog();
      showToast("Category deleted.");
    } catch (error) {
      showToast(error.message);
    }
  }

  async function saveSettings(event) {
    event.preventDefault();
    const form = el.settingsForm.elements;
    const phone = form.whatsappNumber.value.replace(/\D/g, "");
    if (phone.length < 10 || phone.length > 15) {
      showToast("Enter the WhatsApp number with country code, using 10 to 15 digits.");
      return;
    }
    setButtonBusy(el.saveSettingsButton, true, "Saving…");
    try {
      await apiPost("saveSettings", { settings: {
        storeName: form.storeName.value.trim(),
        whatsappNumber: phone,
        address: form.address.value.trim(),
        deliveryFee: Number(form.deliveryFee.value || 0),
        minimumOrder: Number(form.minimumOrder.value || 0),
        currency: "INR"
      }});
      await loadCatalog();
      showToast("Store settings saved.");
    } catch (error) {
      showToast(error.message);
    } finally {
      setButtonBusy(el.saveSettingsButton, false, "Save settings");
    }
  }

  async function importStarterCatalog() {
    const message = state.products.length
      ? "Load the starter catalogue again? Matching starter items will be updated, while your other items remain."
      : `Load all ${seed.products.length} starter products and ${seed.categories.length} categories?`;
    if (!window.confirm(message)) return;
    setButtonBusy(el.importCatalogButton, true, "Loading…");
    try {
      await apiPost("importCatalog", { categories: seed.categories, products: seed.products });
      await loadCatalog();
      showToast(`${seed.products.length} starter products are ready.`);
    } catch (error) {
      showToast(error.message);
    } finally {
      setButtonBusy(el.importCatalogButton, false, "Load starter catalogue");
    }
  }

  async function apiPost(action, payload, pinOverride) {
    const response = await fetch(apiUrl(), {
      method: "POST",
      redirect: "follow",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ action, adminPin: pinOverride || state.pin, ...payload })
    });
    if (!response.ok) throw new Error("The admin service could not be reached.");
    const result = await response.json();
    if (!result.ok) throw new Error(result.error || "The request failed.");
    return result;
  }

  function productImage(product) {
    const source = product.imageUrl || twemojiUrl(product.emoji || "📦");
    return `<img class="product-img ${product.imageUrl ? "uploaded-image" : ""}" src="${escapeAttribute(source)}" alt="" loading="lazy" data-emoji="${escapeAttribute(product.emoji || "📦")}">`;
  }

  function attachImageFallbacks(root) {
    root.querySelectorAll("img.product-img").forEach((image) => {
      image.addEventListener("error", () => {
        const span = document.createElement("span");
        span.textContent = image.dataset.emoji || "📦";
        span.style.fontSize = "1.9rem";
        image.replaceWith(span);
      }, { once: true });
    });
  }

  function twemojiUrl(emoji) {
    const code = Array.from(emoji).map((character) => character.codePointAt(0).toString(16)).filter((value) => value !== "fe0f").join("-");
    return `https://cdn.jsdelivr.net/gh/jdecked/twemoji@latest/assets/svg/${code}.svg`;
  }

  function readFileAsDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error("The image could not be read."));
      reader.readAsDataURL(file);
    });
  }

  function setButtonBusy(button, busy, label) {
    button.disabled = busy;
    button.textContent = label;
  }

  function formatCurrency(value) {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: Number(value) % 1 ? 2 : 0 }).format(Number(value || 0));
  }

  function showToast(message) {
    clearTimeout(toastTimer);
    el.toast.textContent = message;
    el.toast.classList.add("show");
    toastTimer = setTimeout(() => el.toast.classList.remove("show"), 3200);
  }

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]);
  }

  function escapeAttribute(value) {
    return escapeHtml(value).replace(/`/g, "&#96;");
  }
})();
