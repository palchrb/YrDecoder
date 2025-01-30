// service-worker.js

// Oppdater versjonsnummer ved hver ny utgivelse
const CACHE_NAME = "weather-decoder-v7";

// Hele ikonlisten
const iconList = [
  "01d", "01n", "01m", "02d", "02n", "02m", "03d", "03n", "03m", "04",
  "05d", "05n", "05m", "06d", "06n", "06m", "07d", "07n", "07m", "08d",
  "08n", "08m", "09", "10", "11", "12", "13", "14", "15", "20d", "20n",
  "20m", "21d", "21n", "21m", "22", "23", "24d", "24n", "24m", "25d",
  "25n", "25m", "26d", "26n", "26m", "27d", "27n", "27m", "28d", "28n",
  "28m", "29d", "29n", "29m", "30", "31", "32", "33", "34", "40d", "40n",
  "40m", "41d", "41n", "41m", "42d", "42n", "42m", "43d", "43n", "43m",
  "44d", "44n", "44m", "45d", "45n", "45m", "46", "47", "48", "49", "50"
];

// Basisen for filer som skal caches
const baseResources = [
  "/",
  "/index.html",
  "/script.js",
  // Legg evt. til /css/main.css, /favicon.ico, etc. hvis du har flere filer
];

// Sett sammen den endelige listen med alle SVG-filer
const resourcesToCache = baseResources.concat(
  iconList.map(icon => `/svg/${icon}.svg`)
);

// INSTALL – legg alle filer i cachen
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(resourcesToCache);
      })
      .catch((error) => {
        console.error("Feil ved installasjon av Service Worker:", error);
      })
  );
  self.skipWaiting(); // Tving installert SW til å bli aktiv
});

// ACTIVATE – fjern gamle cacher og ta kontroll over eksisterende klienter
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((oldCacheName) => {
          if (oldCacheName !== CACHE_NAME) {
            console.log("Sletter gammel cache:", oldCacheName);
            return caches.delete(oldCacheName);
          }
        })
      );
    })
    .then(() => self.clients.claim())
  );
});

// FETCH – prøv cache først, så nettverk
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Hvis vi har en match i cachen, returnér den
      if (cachedResponse) {
        return cachedResponse;
      }
      // Hvis ikke, forsøk nettverkskall
      return fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.ok) {
            // Legg i cache for framtidige offline-oppslag
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, networkResponse.clone());
            });
          }
          return networkResponse;
        })
        .catch((error) => {
          console.warn("Kunne ikke hente fra nettet:", event.request.url, error);
          // Evt: returner en fallback her, f.eks. et offline-bilde:
          // return caches.match("/offline.png");
        });
    })
  );
});
