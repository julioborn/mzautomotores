self.addEventListener("install", (event) => {
  // Forzar activación inmediata
  self.skipWaiting()
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    // Limpiar todos los caches existentes
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            console.log("Eliminando cache:", cacheName)
            return caches.delete(cacheName)
          }),
        )
      })
      .then(() => {
        // Desregistrar este service worker
        return self.registration.unregister()
      })
      .then(() => {
        // Recargar todas las páginas para aplicar cambios
        return self.clients.matchAll()
      })
      .then((clients) => {
        clients.forEach((client) => {
          client.navigate(client.url)
        })
      }),
  )
})

// No interceptar ninguna petición
self.addEventListener("fetch", (event) => {
  // Dejar que todas las peticiones pasen directamente al servidor
  return
})
