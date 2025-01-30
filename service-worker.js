// service-worker.js

const CACHE_NAME = "weather-decoder-v11";

// Ikonliste
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

// Basisfiler (absolutte stier m/ YrDecoder i path)
const baseResources = [
  "/YrDecoder/avalanche.html",              // cachen index-siden
  "/YrDecoder/index.html",
  "/YrDecoder/script.js",
  "/YrDecoder/script2.js",
  "/YrDecoder/manifest.json", // hvis du bruker den
  // ev. "/YrDecoder/style.css", "/YrDecoder/icon.png" osv...
];

// Bygg en komplett liste med ikoner
const iconResources = iconList.map(icon => `/YrDecoder/svg/${icon}.svg`);

// Samlet liste
const resourcesToCache = [...baseResources, ...iconResources];

// INSTALL – legg filer i cache
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      // Kjør en løkke for å se evt. hvilke filer som feiler (debug)
      for (const resourceUrl of resourcesToCache) {
        try {
          console.log("Prøver å cache:", resourceUrl);
          await cache.add(resourceUrl);
        } catch (err) {
          console.error("Feil ved caching av", resourceUrl, err);
        }
      }
    })
  );
  self.skipWaiting();
});

// ACTIVATE – fjern gamle cacher
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then(cacheNames => 
      Promise.all(
        cacheNames.map(oldCache => {
          if (oldCache !== CACHE_NAME) {
            console.log("Sletter gammel cache:", oldCache);
            return caches.delete(oldCache);
          }
        })
      )
    ).then(() => self.clients.claim())
  );
});

// FETCH – cache first, fallback til nett
self.addEventListener("fetch", (event) => {
  // Sjekk kun GET-forespørsler (POST/PUT bør ikke caches)
  if (event.request.method !== "GET") {
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      // Fant i cache? Returner den
      if (cachedResponse) {
        return cachedResponse;
      }
      // Hvis ikke, hent fra nett
      return fetch(event.request)
        .then((networkResponse) => {
          // Bare cacher hvis alt OK og same-origin
          if (networkResponse && networkResponse.ok && networkResponse.type === "basic") {
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, networkResponse.clone());
            });
          }
          return networkResponse;
        })
        .catch((err) => {
          console.warn("Nettverksfeil:", event.request.url, err);
          // Kan evt. returnere offline-side her
        });
    })
  );
});
