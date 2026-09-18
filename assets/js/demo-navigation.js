(() => {
  const bar = document.createElement("div");
  bar.className = "alpha-demo-nav";
  bar.innerHTML = '<a href="../../index.html#services">← All demo websites</a><span>Live demo by <b>Alpha Web Solutions</b></span><button type="button">Share demo ↗</button>';
  document.body.prepend(bar);
  const style = document.createElement("style");
  style.textContent = ".alpha-demo-nav{position:relative;z-index:9999;min-height:40px;padding:7px 18px;display:flex;align-items:center;justify-content:center;gap:22px;color:#fff;background:#071a45;font:700 12px/1.3 Inter,system-ui,sans-serif}.alpha-demo-nav a,.alpha-demo-nav button{padding:6px 10px;border:1px solid #ffffff30;border-radius:999px;color:#fff;background:#ffffff12;font:inherit;cursor:pointer;text-decoration:none}.alpha-demo-nav b{color:#8ec5ff}@media(max-width:600px){.alpha-demo-nav{justify-content:space-between}.alpha-demo-nav span{display:none}.alpha-demo-nav a,.alpha-demo-nav button{font-size:10px}}";
  document.head.appendChild(style);
  bar.querySelector("button").addEventListener("click", async () => {
    const data = { title: document.title, text: `View this demo website by Alpha Web Solutions: ${document.title}`, url: location.href };
    try {
      if (navigator.share) await navigator.share(data);
      else {
        await navigator.clipboard.writeText(location.href);
        const button = bar.querySelector("button");
        const previous = button.textContent;
        button.textContent = "Link copied ✓";
        setTimeout(() => button.textContent = previous, 1800);
      }
    } catch { /* sharing cancelled */ }
  });
})();
