// Oliva service worker v9
const CACHE_VERSION = 'v9';
const APP_CACHE = `oliva-app-${CACHE_VERSION}`;
// Keep product images across app-shell updates so returning visitors can use
// their previously downloaded full images immediately for the long term.
const IMAGE_CACHE = 'oliva-images-long-lived-v1';
const CONTENT_CACHE = `oliva-content-${CACHE_VERSION}`;
const CACHE_PREFIX = 'oliva-';
const SHELL_URLS = ['/', '/index.html'];

function canCache(response) {
  return response && (response.ok || response.type === 'opaque');
}

async function putSafely(cache, key, response) {
  if (!canCache(response)) return;
  try {
    await cache.put(key, response.clone());
  } catch {
    // Streaming, partial, and browser-rejected responses are never cached.
  }
}

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  await putSafely(cache, request, response);
  return response;
}

async function staleWhileRevalidate(event, request) {
  const cache = await caches.open(IMAGE_CACHE);
  const cached = await cache.match(request);
  const network = fetch(request)
    .then(async (response) => {
      await putSafely(cache, request, response);
      return response;
    })
    .catch(() => undefined);

  if (cached) {
    event.waitUntil(network);
    return cached;
  }
  const response = await network;
  if (response) return response;
  throw new Error('Image unavailable');
}

async function networkFirstNavigation(request) {
  const cache = await caches.open(APP_CACHE);
  try {
    const response = await fetch(request);
    if (response.ok) await putSafely(cache, '/', response);
    return response;
  } catch {
    return (await cache.match(request)) ||
      (await cache.match('/')) ||
      (await cache.match('/index.html')) ||
      Response.error();
  }
}

async function networkFirstContent(request, url) {
  const cache = await caches.open(CONTENT_CACHE);
  const canonicalKey = new Request(`${url.origin}${url.pathname}`);
  try {
    const response = await fetch(request);
    if (response.ok) {
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        await putSafely(cache, canonicalKey, response);
      }
    }
    return response;
  } catch {
    return (await cache.match(canonicalKey)) || Response.error();
  }
}

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(APP_CACHE).then((cache) => cache.addAll(SHELL_URLS)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(
      names
        .filter((name) =>
          name.startsWith(CACHE_PREFIX) &&
          name !== APP_CACHE &&
          name !== IMAGE_CACHE &&
          name !== CONTENT_CACHE)
        .map((name) => caches.delete(name)),
    );
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  const isContentEvents = /\/public\/content\/events\/?$/.test(url.pathname);
  const isPublicContent = /\/public\/content\/?$/.test(url.pathname);
  const isImmutableMedia =
    url.pathname.includes('/public/media/') ||
    (url.origin === self.location.origin && url.pathname.startsWith('/assets/')) ||
    url.hostname === 'hebbkx1anhila5yf.public.blob.vercel-storage.com';
  const isImage = request.destination === 'image' ||
    /\.(jpe?g|png|gif|webp|avif|svg)(\?.*)?$/i.test(url.pathname);
  const isLongLivedMenuImage =
    url.origin === self.location.origin &&
    (url.pathname.startsWith('/images/products/') ||
      url.pathname.startsWith('/images/products-optimized/') ||
      url.pathname.startsWith('/images/products-lqip/') ||
      url.pathname.startsWith('/menu-optimized/') ||
      url.pathname.startsWith('/menu-lqip/'));
  const isImmutableStatic =
    url.origin === self.location.origin &&
    url.pathname.startsWith('/assets/') &&
    ['script', 'style', 'font', 'worker'].includes(request.destination);
  const isDevModule =
    url.origin === self.location.origin &&
    (url.pathname.startsWith('/src/') ||
      url.pathname.startsWith('/node_modules/') ||
      url.pathname.startsWith('/@'));

  if (isContentEvents || isDevModule) {
    event.respondWith(fetch(request));
  } else if (isPublicContent) {
    event.respondWith(networkFirstContent(request, url));
  } else if (request.mode === 'navigate') {
    event.respondWith(networkFirstNavigation(request));
  } else if (isImage && (isImmutableMedia || isLongLivedMenuImage)) {
    event.respondWith(cacheFirst(request, IMAGE_CACHE));
  } else if (isImage) {
    event.respondWith(staleWhileRevalidate(event, request));
  } else if (isImmutableStatic) {
    event.respondWith(cacheFirst(request, APP_CACHE));
  }
});