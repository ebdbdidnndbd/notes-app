const CACHE_NAME = "study-notes-v9-pro";
const APP_SHELL = [
  "./",
  "./index.html",
  "./style.css",
  "./core.js",
  "./features.js",
  "./games.js",
  "./premium.js",
  "./manifest.json"
];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL).catch(() => {}))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Network-First مع مهلة سريعة: يسحب التحديثات فوراً، وإذا النت ضعيف أو مقطوع يفتح من الكاش
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  const url = new URL(e.request.url);
  if (url.origin !== self.location.origin) return;

  e.respondWith(
    Promise.race([
      fetch(e.request).then(res => {
        if (res && res.status === 200) {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(e.request, clone)).catch(() => {});
        }
        return res;
      }),
      new Promise((_, rej) => setTimeout(() => rej(new Error("timeout")), 3200))
    ]).catch(() => caches.match(e.request).then(c => c || fetch(e.request)))
  );
});
