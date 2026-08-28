/* Copyright (C) 1993-2026 Abhishek Choudhary | GPL-3.0-or-later
   Rung / skin switcher. Same data; different projection. */
(function(){
  const SKINS = {
    estate: { href: null, label: "Estate" },
    academic: { href: "skins/academic.css", label: "Paper" },
    jazz: { href: "skins/jazz.css", label: "Jazz" }
  };
  const path = location.pathname.includes("/dome/") || location.pathname.endsWith("/skins/") ? "../" : "";
  function apply(id){
    localStorage.setItem("panini-skin", id);
    let el = document.getElementById("panini-skin");
    if (el) el.remove();
    const spec = SKINS[id];
    if (spec && spec.href) {
      el = document.createElement("link");
      el.id = "panini-skin";
      el.rel = "stylesheet";
      el.href = path + spec.href;
      document.head.appendChild(el);
    }
  }
  const bar = document.createElement("div");
  bar.setAttribute("role","navigation");
  bar.style.cssText = "display:flex;flex-wrap:wrap;gap:.4rem;padding:.35rem 1rem;font:12px/1.3 ui-monospace,monospace;background:#05070c;color:#c9a227;";
  const here = path;
  bar.innerHTML =
    '<span>Rung:</span>' +
    '<a href="'+here+'index.html" style="color:#e8d9a8">2D</a>' +
    '<a href="'+here+'workbench.html" style="color:#e8d9a8">CLI/IDE</a>' +
    '<a href="'+here+'linguist.html" style="color:#e8d9a8">Lab</a>' +
    '<a href="'+here+'dome/" style="color:#e8d9a8">Dome</a>' +
    '<span style="margin-left:.6rem">Skin:</span>' +
    Object.keys(SKINS).map(k => '<button type="button" data-skin="'+k+'" style="background:#1a3348;color:#e8d9a8;border:1px solid #c9a227;cursor:pointer">'+SKINS[k].label+'</button>').join("");
  document.documentElement.insertBefore(bar, document.body);
  bar.querySelectorAll("[data-skin]").forEach(b => b.onclick = () => apply(b.dataset.skin));
  apply(localStorage.getItem("panini-skin") || "estate");
})();
