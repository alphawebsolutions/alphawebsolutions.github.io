(() => {
  const cards = [...document.querySelectorAll(".service-card")];
  const search = document.getElementById("demo-search");
  const buttons = [...document.querySelectorAll("[data-filter]")];
  const count = document.getElementById("demo-count");
  const empty = document.getElementById("demo-empty");
  let filter = "all";

  const groupFor = (text) => {
    if (/restaurant|food|grocery|bakery|optical|eyewear|electronics|retail|catalogue|qr menu/i.test(text)) return "shop";
    if (/clinic|doctor|salon|beauty|pet|grooming/i.test(text)) return "appointment";
    if (/real estate|coaching|tuition|home service|local service|event|vehicle|travel|gaming|gym|fitness|coworking|office space/i.test(text)) return "booking";
    return "professional";
  };

  cards.forEach((card, index) => {
    card.dataset.group = groupFor(card.textContent);
    card.style.setProperty("--delay", `${Math.min(index % 6, 5) * 55}ms`);
  });

  function applyFilters() {
    const query = search.value.trim().toLowerCase();
    let visible = 0;
    cards.forEach((card) => {
      const match = (filter === "all" || card.dataset.group === filter) && (!query || card.textContent.toLowerCase().includes(query));
      card.hidden = !match;
      if (match) visible += 1;
    });
    count.textContent = visible === cards.length ? `Showing all ${cards.length} demos` : `Showing ${visible} of ${cards.length} demos`;
    empty.hidden = visible !== 0;
  }

  search.addEventListener("input", applyFilters);
  buttons.forEach((button) => button.addEventListener("click", () => {
    filter = button.dataset.filter;
    buttons.forEach((item) => item.classList.toggle("active", item === button));
    applyFilters();
  }));
  document.getElementById("show-all-demos").addEventListener("click", () => {
    filter = "all";
    search.value = "";
    buttons.forEach((item) => item.classList.toggle("active", item.dataset.filter === "all"));
    applyFilters();
    search.focus();
  });

  if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("revealed");
        observer.unobserve(entry.target);
      }
    }), { threshold: 0.08 });
    document.querySelectorAll(".service-card,.value-strip article,.process-grid article,.pricing-cards article,.feature-grid article").forEach((element) => {
      element.classList.add("reveal");
      observer.observe(element);
    });
  }
  applyFilters();
})();
