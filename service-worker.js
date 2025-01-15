self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open("weather-decoder-v2").then((cache) => { // Endret cache-navnet til "weather-decoder-v2"
      return cache.addAll(["/", "/index.html", "/script.js"]);
    })
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Returner cachet respons hvis tilgjengelig, ellers hent fra nettet
      return response || fetch(event.request);
    })
  );
});

self.addEventListener("activate", (event) => {
  const cacheWhitelist = ["weather-decoder-v2"]; // Kun den nye cachen skal beholdes
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName); // Slett gamle cacher
          }
        })
      );
    })
  );
});
