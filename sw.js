const CACHE = "ruta-del-dia-v27";
const SHELL = ["./", "./index.html", "./manifest.json", "./icon-192.png", "./icon-512.png"];

self.addEventListener("install", e => {
  // cache:"reload" evita guardar copias viejas de la caché HTTP del navegador
  e.waitUntil(caches.open(CACHE).then(c =>
    Promise.all(SHELL.map(u => fetch(new Request(u, {cache: "reload"})).then(r => c.put(u, r))))
  ));
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Red primero (siempre la versión más nueva); si no hay internet, usa la copia guardada.
self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== self.location.origin) return;
  e.respondWith(
    fetch(e.request, {cache: "no-cache"}).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy));
      return res;
    }).catch(() => caches.match(e.request))
  );
});
