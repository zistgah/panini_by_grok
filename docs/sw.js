const CACHE = "panini-l15-v1";
const ASSETS = ["./","index.html","workbench.css","workbench.js","console.js","catalog.js","files.js","tree.js","ARCHITECTURE.md","manifest.webmanifest","icon.svg"];
self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS).catch(() => {})));
});
self.addEventListener("fetch", (e) => {
  e.respondWith(caches.match(e.request).then((r) => r || fetch(e.request)));
});
