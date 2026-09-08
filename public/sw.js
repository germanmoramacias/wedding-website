const CACHE_NAME = "inma-pascual-v3";
const APP_SHELL = [
  "/hero.jpg",
  "/manifest.webmanifest",
  "/icon-192.png",
  "/icon-512.png",
  "/apple-touch-icon.png"
];
const CACHEABLE_PATHS = new Set(APP_SHELL);

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))),
    ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET" || !request.url.startsWith(self.location.origin)) return;

  const url = new URL(request.url);

  // Never cache HTML or Next.js build artifacts. Mixing files from different
  // builds causes React hydration mismatches after edits and deployments.
  if (
    request.mode === "navigate" ||
    url.pathname.startsWith("/_next/") ||
    url.pathname === "/sw.js" ||
    !CACHEABLE_PATHS.has(url.pathname)
  ) {
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) =>
      cached ||
      fetch(request).then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        }
        return response;
      }),
    ),
  );
});
