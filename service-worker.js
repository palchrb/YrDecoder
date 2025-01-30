const CACHE_NAME = "weather-decoder-v7";
const DB_NAME = "WeatherPWA";
const STORE_NAME = "files";
const ICONS_PATH = "/svg/";

// Liste over nødvendige ressurser
const resourcesToCache = [
  "/", "/index.html", "/script.js"
];

// Liste over ikonfiler
const iconFiles = [
  "01d", "01n", "01m", "02d", "02n", "02m", "03d", "03n", "03m", "04",
  "05d", "05n", "05m", "06d", "06n", "06m", "07d", "07n", "07m", "08d",
  "08n", "08m", "09", "10", "11", "12", "13", "14", "15", "20d", "20n",
  "20m", "21d", "21n", "21m", "22", "23", "24d", "24n", "24m", "25d",
  "25n", "25m", "26d", "26n", "26m", "27d", "27n", "27m", "28d", "28n",
  "28m", "29d", "29n", "29m", "30", "31", "32", "33", "34", "40d", "40n",
  "40m", "41d", "41n", "41m", "42d", "42n", "42m", "43d", "43n", "43m",
  "44d", "44n", "44m", "45d", "45n", "45m", "46", "47", "48", "49", "50"
].map(icon => `${ICONS_PATH}${icon}.svg`);

// Åpne eller opprett IndexedDB
function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = (event) => {
      let db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject("IndexedDB kunne ikke åpnes.");
  });
}

// Lagre en fil i IndexedDB
async function saveToIndexedDB(url, response) {
  const db = await openDatabase();
  const tx = db.transaction(STORE_NAME, "readwrite");
  const store = tx.objectStore(STORE_NAME);
  const blob = await response.blob();
  store.put(blob, url);
}

// Hente en fil fra IndexedDB
async function getFromIndexedDB(url) {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const request = store.get(url);
    request.onsuccess = () => request.result ? resolve(new Response(request.result)) : reject();
    request.onerror = () => reject();
  });
}

// Installer Service Worker og cache ressurser
self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      await cache.addAll(resourcesToCache);

      // Lagrer ikonene i IndexedDB
      for (const icon of iconFiles) {
        try {
          const response = await fetch(icon);
          if (response.ok) {
            await saveToIndexedDB(icon, response);
          } else {
            console.warn(`Kunne ikke laste ikon: ${icon}`);
          }
        } catch (error) {
          console.warn(`Feil ved henting av ikon: ${icon}`, error);
        }
      }
    })()
  );
});

// Håndter fetch-hendelser med IndexedDB fallback
self.addEventListener("fetch", (event) => {
  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      const cachedResponse = await cache.match(event.request);
      if (cachedResponse) return cachedResponse;

      try {
        const networkResponse = await fetch(event.request);
        if (event.request.url.includes(ICONS_PATH)) {
          await saveToIndexedDB(event.request.url, networkResponse.clone());
        } else {
          cache.put(event.request, networkResponse.clone());
        }
        return networkResponse;
      } catch (error) {
        if (event.request.url.includes(ICONS_PATH)) {
          return getFromIndexedDB(event.request.url).catch(() => new Response("?", { status: 404 }));
        }
        return new Response("Offline - Ressurs ikke tilgjengelig", { status: 503 });
      }
    })()
  );
});

// Fjerner gamle cacher ved oppdatering
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
