const CACHE_NAME = 'territoryrun-static-v1'

const STATIC_ASSETS = [
  '/',
  '/icon-192.png',
  '/icon-512.png',
  '/icon-maskable-192.png',
  '/icon-maskable-512.png',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS)
    }),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key)),
      ),
    ),
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event

  // Apenas GETs
  if (request.method !== 'GET') return

  const url = new URL(request.url)

  // Estratégia network-first para requests dinâmicos e Firebase
  if (url.origin !== self.location.origin || url.pathname.startsWith('/api')) {
    event.respondWith(
      fetch(request).catch(() => caches.match(request)),
    )
    return
  }

  // Estratégia stale-while-revalidate para assets estáticos
  event.respondWith(
    caches.match(request).then((cached) => {
      const networkFetch = fetch(request).then((response) => {
        const copy = response.clone()
        caches.open(CACHE_NAME).then((cache) => cache.put(request, copy))
        return response
      })

      return cached || networkFetch
    }),
  )
})

