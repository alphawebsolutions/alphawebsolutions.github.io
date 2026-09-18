(function () {
  "use strict";

  const config = window.EXPRESS_BAZAAR_CONFIG || {};
  const seed = window.EXPRESS_BAZAAR_SEED || { categories: [], products: [] };
  const state = {
    categories: seed.categories,
    products: seed.products,
    settings: {
      storeName: config.STORE_NAME || "ExpressBazaar",
      whatsappNumber: config.WHATSAPP_NUMBER || "",
      address: config.ADDRESS || "",
      deliveryFee: Number(config.DELIVERY_FEE || 0),
      minimumOrder: Number(config.MINIMUM_ORDER || 0),
      currency: config.CURRENCY || "INR"
    },
    categoryId: "all",
    search: "",
    stock: "all",
    sort: "featured",
    visibleCount: 24,
    cart: loadCart()
  };

  const el = {};
  let toastTimer;
  let lastFocusedElement;

  document.addEventListener("DOMContentLoaded", init);

  async function init() {
    cacheElements();
    bindEvents();
    applyLocation();
    renderAll();
    await loadLiveCatalog();
  }

  function cacheElements() {
    [
      "heroSearchForm", "heroSearch", "catalogSearch", "stockFilter", "sortProducts",
      "categoryStrip", "catalogStatus", "resultSummary", "clearFilters", "productGrid",
      "emptyState", "emptyClearButton", "paginationWrap", "loadMoreButton", "openCartButton",
      "cartCount", "cartBackdrop", "cartDrawer", "closeCartButton", "cartItems", "cartEmpty",
      "cartSummary", "cartSubtotal", "cartDelivery", "cartTotal", "minimumOrderNote",
      "whatsappOrderButton", "clearCartButton", "startShoppingButton", "locationCartButton",
      "mobileCartBar", "mobileCartCount", "mobileCartTotal", "toast", "storeAddress",
      "directionsLink", "storeMap"
    ].forEach((id) => { el[id] = document.getElementById(id); });
  }

  function bindEvents() {
    el.heroSearchForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const value = el.heroSearch.value.trim();
      el.catalogSearch.value = value;
      setSearch(value);
      document.getElementById("shop").scrollIntoView({ behavior: "smooth" });
    });
    el.heroSearch.addEventListener("input", () => {
      if (!el.heroSearch.value) {
        el.catalogSearch.value = "";
        setSearch("");
      }
    });
    el.catalogSearch.addEventListener("input", () => setSearch(el.catalogSearch.value));
    el.stockFilter.addEventListener("change", () => {
      state.stock = el.stockFilter.value;
      resetVisibleAndRender();
    });
    el.sortProducts.addEventListener("change", () => {
      state.sort = el.sortProducts.value;
      resetVisibleAndRender();
    });
    el.categoryStrip.addEventListener("click", (event) => {
      const button = event.target.closest("[data-category]");
      if (!button) return;
      state.categoryId = button.dataset.category;
      resetVisibleAndRender();
    });
    el.productGrid.addEventListener("click", handleProductAction);
    el.clearFilters.addEventListener("click", clearFilters);
    el.emptyClearButton.addEventListener("click", clearFilters);
    el.loadMoreButton.addEventListener("click", () => {
      state.visibleCount += 24;
      renderProducts();
    });
    [el.openCartButton, el.locationCartButton, el.mobileCartBar].forEach((button) => button.addEventListener("click", openCart));
    [el.closeCartButton, el.cartBackdrop].forEach((button) => button.addEventListener("click", closeCart));
    el.startShoppingButton.addEventListener("click", () => {
      closeCart();
      document.getElementById("shop").scrollIntoView({ behavior: "smooth" });
    });
    el.cartItems.addEventListener("click", handleCartAction);
    el.clearCartButton.addEventListener("click", () => {
      if (window.confirm("Remove all items from your cart?")) {
        state.cart = {};
        updateCart();
      }
    });
    el.whatsappOrderButton.addEventListener("click", sendWhatsAppOrder);
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && el.cartDrawer.classList.contains("open")) closeCart();
    });
  }

  async function loadLiveCatalog() {
    const apiUrl = String(config.API_URL || "").trim();
    if (!apiUrl) {
      el.catalogStatus.textContent = `${state.products.length} products · starter catalogue`;
      return;
    }
    try {
      const url = new URL(apiUrl);
      url.searchParams.set("action", "catalog");
      url.searchParams.set("_", Date.now());
      const response = await fetch(url.toString(), { redirect: "follow", cache: "no-store" });
      if (!response.ok) throw new Error("Catalogue request failed");
      const result = await response.json();
      if (!result.ok) throw new Error(result.error || "Catalogue unavailable");

      if (Array.isArray(result.categories) && result.categories.length) {
        state.categories = result.categories.map(normalizeCategory);
      }
      if (Array.isArray(result.products) && result.products.length) {
        state.products = result.products.map(normalizeProduct);
      }
      if (result.settings && typeof result.settings === "object") {
        state.settings = {
          ...state.settings,
          ...result.settings,
          deliveryFee: Number(result.settings.deliveryFee || 0),
          minimumOrder: Number(result.settings.minimumOrder || 0)
        };
      }
      removeUnavailableCartItems();
      applyLocation();
      renderAll();
      el.catalogStatus.textContent = `${state.products.length} products · live inventory`;
    } catch (error) {
      console.warn(error);
      el.catalogStatus.textContent = `${state.products.length} products · offline catalogue`;
      showToast("Live stock could not be loaded. Showing the saved starter catalogue.");
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

  function renderAll() {
    renderCategories();
    renderProducts();
    renderCart();
  }

  function renderCategories() {
    const activeCategories = state.categories
      .filter((category) => category.active !== false)
      .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));
    const activeIds = new Set(activeCategories.map((category) => category.id));
    const publicProducts = state.products.filter((product) => activeIds.has(product.categoryId));
    const counts = state.products.reduce((acc, product) => {
      acc[product.categoryId] = (acc[product.categoryId] || 0) + 1;
      return acc;
    }, {});
    const allButton = `<button class="category-chip ${state.categoryId === "all" ? "active" : ""}" type="button" data-category="all">🛍️ All <span class="chip-count">${publicProducts.length}</span></button>`;
    const categoryButtons = activeCategories.map((category) => `
      <button class="category-chip ${state.categoryId === category.id ? "active" : ""}" type="button" data-category="${escapeAttribute(category.id)}">
        ${escapeHtml(category.icon || "📦")} ${escapeHtml(category.name)} <span class="chip-count">${counts[category.id] || 0}</span>
      </button>`).join("");
    el.categoryStrip.innerHTML = allButton + categoryButtons;
  }

  function getFilteredProducts() {
    const query = state.search.toLowerCase();
    const categoryMap = Object.fromEntries(state.categories.map((category) => [category.id, category]));
    const products = state.products.filter((product) => {
      const category = categoryMap[product.categoryId];
      const isPublic = category && category.active !== false;
      const matchesCategory = state.categoryId === "all" || product.categoryId === state.categoryId;
      const matchesStock = state.stock === "all" || product.stockStatus === state.stock;
      const searchable = `${product.name} ${product.unit} ${category ? category.name : ""}`.toLowerCase();
      return isPublic && matchesCategory && matchesStock && (!query || searchable.includes(query));
    });

    return products.sort((a, b) => {
      if (state.sort === "price-low") return a.price - b.price || a.name.localeCompare(b.name);
      if (state.sort === "price-high") return b.price - a.price || a.name.localeCompare(b.name);
      if (state.sort === "name") return a.name.localeCompare(b.name);
      return Number(b.featured) - Number(a.featured) || a.sortOrder - b.sortOrder || a.name.localeCompare(b.name);
    });
  }

  function renderProducts() {
    const filtered = getFilteredProducts();
    const visible = filtered.slice(0, state.visibleCount);
    const categoryMap = Object.fromEntries(state.categories.map((category) => [category.id, category]));

    el.productGrid.innerHTML = visible.map((product) => productCard(product, categoryMap[product.categoryId])).join("");
    el.emptyState.hidden = filtered.length !== 0;
    el.productGrid.hidden = filtered.length === 0;
    el.paginationWrap.hidden = filtered.length <= state.visibleCount;
    el.loadMoreButton.textContent = `Load more (${filtered.length - visible.length} remaining)`;
    const activeIds = new Set(state.categories.filter((category) => category.active !== false).map((category) => category.id));
    const publicTotal = state.products.filter((product) => activeIds.has(product.categoryId)).length;
    el.resultSummary.textContent = filtered.length === publicTotal
      ? `Showing ${Math.min(visible.length, filtered.length)} of ${filtered.length} products`
      : `${filtered.length} matching product${filtered.length === 1 ? "" : "s"}`;
    el.clearFilters.hidden = !hasActiveFilters();
    attachImageFallbacks(el.productGrid);
  }

  function productCard(product, category) {
    const quantity = state.cart[product.id] || 0;
    const outOfStock = product.stockStatus === "out";
    return `
      <article class="product-card">
        <div class="product-image" style="--accent:${escapeAttribute((category && category.accent) || "#49a667")}">
          ${productImage(product, "")}
          <span class="stock-badge ${outOfStock ? "out" : ""}">${outOfStock ? "Out of stock" : "In stock"}</span>
        </div>
        <div class="product-body">
          <p class="product-category">${escapeHtml((category && category.name) || "Groceries")}</p>
          <h3>${escapeHtml(product.name)}</h3>
          <div class="product-price-row">
            <div class="price"><strong>${formatCurrency(product.price)}</strong><small>per ${escapeHtml(product.unit)}</small></div>
            ${outOfStock ? `<button class="add-button" type="button" disabled>Unavailable</button>` : quantityControl(product.id, quantity)}
          </div>
        </div>
      </article>`;
  }

  function quantityControl(productId, quantity) {
    if (!quantity) return `<button class="add-button" type="button" data-action="add" data-id="${escapeAttribute(productId)}">+ Add</button>`;
    return `<div class="card-quantity" aria-label="Quantity controls">
      <button type="button" data-action="decrease" data-id="${escapeAttribute(productId)}" aria-label="Decrease quantity">−</button>
      <span>${quantity}</span>
      <button type="button" data-action="increase" data-id="${escapeAttribute(productId)}" aria-label="Increase quantity">+</button>
    </div>`;
  }

  function productImage(product, extraClass) {
    const source = product.imageUrl || twemojiUrl(product.emoji || "📦");
    const uploadedClass = product.imageUrl ? "uploaded-image" : "";
    return `<img class="product-img ${uploadedClass} ${extraClass}" src="${escapeAttribute(source)}" alt="${escapeAttribute(product.name)}" loading="lazy" data-emoji="${escapeAttribute(product.emoji || "📦")}">`;
  }

  function attachImageFallbacks(root) {
    root.querySelectorAll("img.product-img").forEach((image) => {
      image.addEventListener("error", () => {
        const fallback = document.createElement("span");
        fallback.className = "emoji-fallback";
        fallback.textContent = image.dataset.emoji || "📦";
        fallback.style.fontSize = image.closest(".cart-item") ? "2rem" : "4rem";
        image.replaceWith(fallback);
      }, { once: true });
    });
  }

  function handleProductAction(event) {
    const button = event.target.closest("button[data-action]");
    if (!button) return;
    updateQuantity(button.dataset.id, button.dataset.action === "decrease" ? -1 : 1);
    if (button.dataset.action === "add") showToast("Added to your cart");
  }

  function setSearch(value) {
    state.search = value.trim();
    state.visibleCount = 24;
    renderProducts();
  }

  function resetVisibleAndRender() {
    state.visibleCount = 24;
    renderCategories();
    renderProducts();
  }

  function hasActiveFilters() {
    return Boolean(state.search || state.categoryId !== "all" || state.stock !== "all" || state.sort !== "featured");
  }

  function clearFilters() {
    state.search = "";
    state.categoryId = "all";
    state.stock = "all";
    state.sort = "featured";
    state.visibleCount = 24;
    el.catalogSearch.value = "";
    el.heroSearch.value = "";
    el.stockFilter.value = "all";
    el.sortProducts.value = "featured";
    renderCategories();
    renderProducts();
  }

  function loadCart() {
    try {
      const parsed = JSON.parse(localStorage.getItem("expressbazaar-cart") || "{}");
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch (_) {
      return {};
    }
  }

  function saveCart() {
    localStorage.setItem("expressbazaar-cart", JSON.stringify(state.cart));
  }

  function updateQuantity(productId, change) {
    const product = state.products.find((item) => item.id === productId);
    if (!product || product.stockStatus === "out") return;
    const next = Math.max(0, Math.min(99, Number(state.cart[productId] || 0) + change));
    if (next) state.cart[productId] = next;
    else delete state.cart[productId];
    updateCart();
  }

  function updateCart() {
    saveCart();
    renderProducts();
    renderCart();
  }

  function getCartLines() {
    return Object.entries(state.cart).map(([id, quantity]) => {
      const product = state.products.find((item) => item.id === id);
      return product && product.stockStatus !== "out" ? { product, quantity: Number(quantity) } : null;
    }).filter(Boolean);
  }

  function removeUnavailableCartItems() {
    const validIds = new Set(state.products.filter((product) => product.stockStatus !== "out").map((product) => product.id));
    Object.keys(state.cart).forEach((id) => { if (!validIds.has(id)) delete state.cart[id]; });
    saveCart();
  }

  function renderCart() {
    const lines = getCartLines();
    const itemCount = lines.reduce((sum, line) => sum + line.quantity, 0);
    const subtotal = lines.reduce((sum, line) => sum + (line.product.price * line.quantity), 0);
    const delivery = itemCount ? Number(state.settings.deliveryFee || 0) : 0;
    const total = subtotal + delivery;

    el.cartCount.textContent = itemCount;
    el.cartItems.innerHTML = lines.map(({ product, quantity }) => `
      <div class="cart-item">
        <div class="cart-item-image">${productImage(product, "")}</div>
        <div><h3>${escapeHtml(product.name)}</h3><p>${formatCurrency(product.price)} × ${quantity} = ${formatCurrency(product.price * quantity)}</p></div>
        <div>
          <div class="cart-item-controls">
            <button type="button" data-cart-action="decrease" data-id="${escapeAttribute(product.id)}" aria-label="Decrease ${escapeAttribute(product.name)}">−</button>
            <span>${quantity}</span>
            <button type="button" data-cart-action="increase" data-id="${escapeAttribute(product.id)}" aria-label="Increase ${escapeAttribute(product.name)}">+</button>
          </div>
          <button type="button" class="remove-item" data-cart-action="remove" data-id="${escapeAttribute(product.id)}">Remove</button>
        </div>
      </div>`).join("");
    attachImageFallbacks(el.cartItems);
    el.cartEmpty.hidden = lines.length > 0;
    el.cartSummary.hidden = lines.length === 0;
    el.cartSubtotal.textContent = formatCurrency(subtotal);
    el.cartDelivery.textContent = delivery ? formatCurrency(delivery) : "Free";
    el.cartTotal.textContent = formatCurrency(total);

    const minimum = Number(state.settings.minimumOrder || 0);
    const belowMinimum = minimum > 0 && subtotal < minimum;
    el.minimumOrderNote.hidden = !belowMinimum;
    el.minimumOrderNote.textContent = belowMinimum ? `Add ${formatCurrency(minimum - subtotal)} more to reach the minimum order of ${formatCurrency(minimum)}.` : "";
    el.whatsappOrderButton.disabled = belowMinimum;

    el.mobileCartBar.hidden = itemCount === 0 || el.cartDrawer.classList.contains("open");
    el.mobileCartCount.textContent = `${itemCount} item${itemCount === 1 ? "" : "s"}`;
    el.mobileCartTotal.textContent = formatCurrency(total);
  }

  function handleCartAction(event) {
    const button = event.target.closest("button[data-cart-action]");
    if (!button) return;
    if (button.dataset.cartAction === "remove") {
      delete state.cart[button.dataset.id];
      updateCart();
      return;
    }
    updateQuantity(button.dataset.id, button.dataset.cartAction === "decrease" ? -1 : 1);
  }

  function openCart(event) {
    lastFocusedElement = event && event.currentTarget;
    el.cartBackdrop.hidden = false;
    el.cartDrawer.classList.add("open");
    el.cartDrawer.setAttribute("aria-hidden", "false");
    document.body.classList.add("drawer-open");
    el.mobileCartBar.hidden = true;
    setTimeout(() => el.closeCartButton.focus(), 50);
  }

  function closeCart() {
    el.cartDrawer.classList.remove("open");
    el.cartDrawer.setAttribute("aria-hidden", "true");
    document.body.classList.remove("drawer-open");
    setTimeout(() => { el.cartBackdrop.hidden = true; }, 240);
    renderCart();
    if (lastFocusedElement) lastFocusedElement.focus();
  }

  function sendWhatsAppOrder() {
    const lines = getCartLines();
    if (!lines.length) return;
    const phone = String(state.settings.whatsappNumber || config.WHATSAPP_NUMBER || "").replace(/\D/g, "");
    if (phone.length < 10) {
      showToast("The store WhatsApp number is not configured yet.");
      return;
    }
    const subtotal = lines.reduce((sum, line) => sum + line.product.price * line.quantity, 0);
    const delivery = Number(state.settings.deliveryFee || 0);
    const total = subtotal + delivery;
    const itemText = lines.map(({ product, quantity }, index) =>
      `${index + 1}. ${product.name} (${product.unit})\n   ${formatCurrency(product.price)} × ${quantity} = ${formatCurrency(product.price * quantity)}`
    ).join("\n\n");
    const message = [
      "Hi Alpha Web Solutions,",
      "",
      "I tested the ExpressBazaar grocery website demo. This is my sample cart:",
      "",
      itemText,
      "",
      `Subtotal: ${formatCurrency(subtotal)}`,
      `Delivery fee: ${delivery ? formatCurrency(delivery) : "Free"}`,
      `Total: ${formatCurrency(total)}`,
      "",
      "I am interested in a similar grocery or supermarket website. Please share the details."
    ].join("\n");
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, "_blank", "noopener");
  }

  function applyLocation() {
    const address = state.settings.address || config.ADDRESS || "";
    el.storeAddress.textContent = address;
    el.directionsLink.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    el.storeMap.src = `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`;
  }

  function formatCurrency(value) {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: state.settings.currency || "INR",
      maximumFractionDigits: Number(value) % 1 ? 2 : 0
    }).format(Number(value || 0));
  }

  function twemojiUrl(emoji) {
    const code = Array.from(emoji)
      .map((character) => character.codePointAt(0).toString(16))
      .filter((value) => value !== "fe0f")
      .join("-");
    return `https://cdn.jsdelivr.net/gh/jdecked/twemoji@latest/assets/svg/${code}.svg`;
  }

  function showToast(message) {
    clearTimeout(toastTimer);
    el.toast.textContent = message;
    el.toast.classList.add("show");
    toastTimer = setTimeout(() => el.toast.classList.remove("show"), 2800);
  }

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>'"]/g, (character) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;"
    })[character]);
  }

  function escapeAttribute(value) {
    return escapeHtml(value).replace(/`/g, "&#96;");
  }
})();
