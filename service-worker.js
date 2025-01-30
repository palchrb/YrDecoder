// service-worker.js

// Bytt versjonsnavn for hver ny endring (slik at brukere får ny cache).
const CACHE_NAME = "weather-decoder-v8";

// Legg alle ikon-id-ene i en liste:
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

// Basen av filer som skal caches. Bruker relative stier, forutsatt at
// service-worker.js ligger i samme mappe som index.html, script.js etc.
const baseResources = [
  "./",           // Ofte greit å ta med "./" for å cache roten (index.html)
  "./index.html",
  "./script.js",
  "./manifest.json", // Ta gjerne med manifest om du bruker det
  // legg til evt. CSS eller andre filer du måtte ha
];

// Sett sammen den komplette listen av filer å cache
const resourcesToCache = baseResources.concat(
  iconList.map(icon => `./svg/${icon}.svg`)
);

// INSTALL – legg alle filer i cachen
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        // addAll(...) vil feile hvis EN av filene ikke finnes.
        // Du kan ev. logge hver fil for debugging
        return cache.addAll(resourcesToCache);
      })
      .catch((error) => {
        console.error("Feil ved installasjon av Service Worker:", error);
      })
  );
  
  // Tving installert SW til å bli aktiv
  self.skipWaiting();
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

// FETCH – prøv cache først, deretter fallback til nett
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Returner fra cache hvis vi har en match
      if (cachedResponse) {
        return cachedResponse;
      }
      // Hvis ikke, hent fra nettverkskall
      return fetch(event.request)
        .then((networkResponse) => {
          // Hvis nettverkskallet er vellykket, legg i cache
          if (networkResponse && networkResponse.ok) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, networkResponse.clone());
            });
          }
          return networkResponse;
        })
        .catch((err) => {
          console.warn("Kunne ikke hente fra nettet:", event.request.url, err);
          // Evt. fallback til en lokal offline-side eller et placeholder-bilde:
          // return caches.match("/offline.html");
        });
    })
  );
});
