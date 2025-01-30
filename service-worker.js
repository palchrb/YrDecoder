const CACHE_NAME = "weather-decoder-v6";
const ICONS_PATH = "/svg/";
const DB_NAME = "WeatherIconsDB";
const STORE_NAME = "icons";

// Liste over ressurser som skal caches i nettleserens cache (korttidslagring)
const resourcesToCache = [
  "/", "/index.html", "/script.js"
];

// Liste over ikon-filer som skal lagres i IndexedDB (langtidslagring)
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

// **Installer Service Worker og cache nødvendige ressurser**
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(resourcesToCache);
    }).then(() => {
      return storeIconsInDB();
    })
  );
});

// **Henter ikon fra IndexedDB eller faller tilbake til nettverket**
async function getIconFromDB(iconUrl) {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, "readonly");
  const store = tx.objectStore(STORE_NAME);
  const data = await store.get(iconUrl);
  return data ? new Response(data, { headers: { "Content-Type": "image/svg+xml" } }) : null;
}

// **Håndter fetch-hendelser**
self.addEventListener("fetch", (event) => {
  const { request } = event;
  
  if (request.url.includes(ICONS_PATH)) {
    event.respondWith(
      getIconFromDB(request.url).then(response => {
        return response || fetch(request).then(async networkResponse => {
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

// **Opprett eller åpne IndexedDB for ikon-lagring**
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

// **Lagrer ikoner i IndexedDB**
async function storeIconInDB(url, response) {
  const db = await openDB();
  const blob = await response.blob();
  const tx = db.transaction(STORE_NAME, "readwrite");
  const store = tx.objectStore(STORE_NAME);
  store.put(blob, url);
}

// **Lagrer alle ikonene i IndexedDB ved installasjon**
async function storeIconsInDB() {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, "readwrite");
  const store = tx.objectStore(STORE_NAME);

  for (const iconUrl of iconFiles) {
    try {
      const response = await fetch(iconUrl);
      const blob = await response.blob();
      store.put(blob, iconUrl);
    } catch (error) {
      console.warn(`Kunne ikke lagre ikon: ${iconUrl}`, error);
    }
  }
}

// **Fjerner gamle cacher og oppdaterer service worker**
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
