const CACHE_NAME = "weather-decoder-v6";
const ICONS_PATH = "/svg/";

// **Ressurser som skal caches**
const resourcesToCache = [
  "/", "/index.html", "/script.js"
].concat([
  "01d", "01n", "01m", "02d", "02n", "02m", "03d", "03n", "03m", "04",
  "05d", "05n", "05m", "06d", "06n", "06m", "07d", "07n", "07m", "08d",
  "08n", "08m", "09", "10", "11", "12", "13", "14", "15", "20d", "20n",
  "20m", "21d", "21n", "21m", "22", "23", "24d", "24n", "24m", "25d",
  "25n", "25m", "26d", "26n", "26m", "27d", "27n", "27m", "28d", "28n",
  "28m", "29d", "29n", "29m", "30", "31", "32", "33", "34", "40d", "40n",
  "40m", "41d", "41n", "41m", "42d", "42n", "42m", "43d", "43n", "43m",
  "44d", "44n", "44m", "45d", "45n", "45m", "46", "47", "48", "49", "50"
].map(icon => `/svg/${icon}.svg`));

// **Åpne eller opprett IndexedDB**
function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("weatherPWA", 1);

    request.onupgradeneeded = (event) => {
      let db = event.target.result;
      if (!db.objectStoreNames.contains("files")) {
        db.createObjectStore("files");
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject("IndexedDB kunne ikke åpnes.");
  });
}

// **Lagre filer i IndexedDB**
function saveToIndexedDB(url, response) {
  return openDatabase().then((db) => {
    return response.blob().then((blob) => {
      const transaction = db.transaction("files", "readwrite");
      const store = transaction.objectStore("files");
      store.put(blob, url);
      return transaction.complete;
    });
  });
}

// **Hent en fil fra IndexedDB**
function getFromIndexedDB(url) {
  return openDatabase().then((db) => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction("files");
      const store = transaction.objectStore("files");
      const request = store.get(url);

      request.onsuccess = () => {
        if (request.result) {
          resolve(new Response(request.result));
        } else {
          reject("Fil ikke funnet i IndexedDB.");
        }
      };
      request.onerror = () => reject("Feil ved henting fra IndexedDB.");
    });
  });
}

// **Installer Service Worker og cache filer**
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.all(
        resourcesToCache.map((resource) => {
          return fetch(resource)
            .then((response) => {
              if (!response.ok) throw new Error(`Feil: ${response.status}`);
              cache.put(resource, response.clone());
              return saveToIndexedDB(resource, response.clone()); // Lagre i IndexedDB også
            })
            .catch((error) => console.warn(`Kunne ikke cache ${resource}:`, error));
        })
      );
    })
  );
});

// **Håndter fetch-hendelser (cache first, fallback til IndexedDB)**
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;

      return fetch(event.request)
        .then((networkResponse) => {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, networkResponse.clone());
            saveToIndexedDB(event.request.url, networkResponse.clone()); // Lagre i IndexedDB også
            return networkResponse;
          });
        })
        .catch(() => {
          console.warn("Kunne ikke hente fra nettet:", event.request.url);
          return getFromIndexedDB(event.request.url); // Fallback til IndexedDB
        });
    })
  );
});

// **Fjern gamle cacher ved oppdatering**
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log("Sletter gammel cache:", cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
