const CACHE_NAME = "weather-decoder-v7";
const ICONS_PATH = "/svg/";
const DB_NAME = "WeatherIconsDB";
const STORE_NAME = "icons";

// Ressurser for cache
const resourcesToCache = ["/", "/index.html", "/script.js"];
const iconFiles = [...Array.from({ length: 51 }, (_, i) => `${ICONS_PATH}${i.toString().padStart(2, "0")}.svg`)];

// Installer Service Worker og cache ressurser
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log("Caching static resources...");
      return cache.addAll(resourcesToCache);
    }).then(() => storeIconsInDB())
  );
});

// Håndter fetch-hendelser
self.addEventListener("fetch", (event) => {
  const { request } = event;
  
  if (request.url.includes(ICONS_PATH)) {
    event.respondWith(
      getIconFromDB(request.url).then(response => {
        if (response) return response;
        return fetch(request).then(async networkResponse => {
          const clone = networkResponse.clone();
          await storeIconInDB(request.url, clone);
          return networkResponse;
        });
      })
    );
  } else {
    event.respondWith(
      caches.match(request).then(response => {
        return response || fetch(request);
      })
    );
  }
});

// Åpne IndexedDB
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Lagre ikoner i IndexedDB
async function storeIconInDB(url, response) {
  const db = await openDB();
  const blob = await response.blob();
  const tx = db.transaction(STORE_NAME, "readwrite");
  const store = tx.objectStore(STORE_NAME);
  store.put(blob, url);
  console.log(`✅ Lagret ikon i IndexedDB: ${url}`);
}

// Hent ikon fra IndexedDB
async function getIconFromDB(iconUrl) {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, "readonly");
  const store = tx.objectStore(STORE_NAME);
  const data = await store.get(iconUrl);
  if (data) console.log(`✅ Fant ikon i IndexedDB: ${iconUrl}`);
  return data ? new Response(data, { headers: { "Content-Type": "image/svg+xml" } }) : null;
}

// Lagre alle ikoner ved installasjon
async function storeIconsInDB() {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, "readwrite");
  const store = tx.objectStore(STORE_NAME);

  for (const iconUrl of iconFiles) {
    try {
      const response = await fetch(iconUrl);
      const blob = await response.blob();
      store.put(blob, iconUrl);
      console.log(`✅ Lagrer ikon: ${iconUrl}`);
    } catch (error) {
      console.warn(`⚠️ Kunne ikke lagre ikon: ${iconUrl}`, error);
    }
  }
}

// Fjern gamle cacher ved oppdatering
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log(`🗑️ Sletter gammel cache: ${cacheName}`);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
