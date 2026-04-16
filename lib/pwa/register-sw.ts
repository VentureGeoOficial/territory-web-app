'use client'

export function registerServiceWorker() {
  if (typeof window === 'undefined') return
  if (!('serviceWorker' in navigator)) return
  if (process.env.NODE_ENV !== 'production') return

  window.addEventListener('load', () => {
    void navigator.serviceWorker
      .register('/sw.js')
      .catch((error) => {
        console.error('[PWA] Failed to register service worker', error)
      })
  })
}

