/* MAAIS offline-first service worker (hand-rolled, no build-time deps).
 * Strategy:
 *  - App shell navigations: network-first, fall back to cached index.html.
 *  - /api/v1/* : network-first with cache fallback (stale data when offline).
 *  - Static assets (js/css/img/fonts): stale-while-revalidate.
 */
const CACHE = 'maais-cache-v1';
const APP_SHELL = ['/', '/index.html', '/icon.svg', '/manifest.webmanifest'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(APP_SHELL)).catch(() => {}),
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))),
    ),
  );
  self.clients.claim();
});

function isApiRequest(url) {
  return url.pathname.startsWith('/api/v1/');
}

function networkFirst(request, fallbackToCache = true) {
  return fetch(request)
    .then((response) => {
      const copy = response.clone();
      caches.open(CACHE).then((cache) => cache.put(request, copy)).catch(() => {});
      return response;
    })
    .catch(() => {
      if (fallbackToCache) {
        return caches.match(request).then((cached) => cached || caches.match('/index.html'));
      }
      throw new Error('offline');
    });
}

function staleWhileRevalidate(request) {
  return caches.match(request).then((cached) => {
    const network = fetch(request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE).then((cache) => cache.put(request, copy)).catch(() => {});
        return response;
      })
      .catch(() => cached);
    return cached || network;
  });
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin && !isApiRequest(url)) return;

  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request, true));
  } else if (isApiRequest(url)) {
    event.respondWith(networkFirst(request, true));
  } else {
    event.respondWith(staleWhileRevalidate(request));
  }
});
