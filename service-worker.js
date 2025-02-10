// service-worker.js

const CACHE_NAME = "weather-decoder-v12";

// ------------------------------------
// 1) ICON LIST
// ------------------------------------
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

// ------------------------------------
// 2) FILES TO CACHE
// ------------------------------------
const baseResources = [
  // For example:
  "/YrDecoder/index.html",
  "/YrDecoder/avalanche.html",
  "/YrDecoder/script.js",
  "/YrDecoder/script2.js",
  "/YrDecoder/manifest.json",
  "/YrDecoder/cmd.html",
  // Add more files here (CSS, images, etc.) if needed
];

const iconResources = iconList.map(icon => `/YrDecoder/svg/${icon}.svg`);

const resourcesToCache = [...baseResources, ...iconResources];

// ------------------------------------
// 3) INDEXEDDB UTILS
// ------------------------------------
function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("weatherPWA-db", 1);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains("files")) {
        db.createObjectStore("files");
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject("IndexedDB could not be opened.");
  });
}

async function saveToIndexedDB(url, response) {
  try {
    const db = await openDatabase();
    // Convert response body to Blob:
    const blob = await response.blob();

    const tx = db.transaction("files", "readwrite");
    const store = tx.objectStore("files");
    store.put(blob, url);
    await tx.complete;
  } catch (err) {
    console.warn("Failed to save to IndexedDB:", url, err);
  }
}

async function getFromIndexedDB(url) {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("files", "readonly");
    const store = tx.objectStore("files");
    const request = store.get(url);

    request.onsuccess = () => {
      if (request.result) {
        // Return a new Response with the stored Blob
        resolve(new Response(request.result));
      } else {
        reject(`File not found in IndexedDB for ${url}`);
      }
    };
    request.onerror = (e) => {
      reject("IndexedDB request error: " + e);
    };
  });
}

// ------------------------------------
// 4) INSTALL
// ------------------------------------
self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      // We'll manually fetch each file so we can store it in both Cache and IDB
      for (const resourceUrl of resourcesToCache) {
        try {
          console.log("Attempting to cache:", resourceUrl);
          const response = await fetch(resourceUrl);

          if (response.ok) {
            // Clone for IDB
            const cloneIDB = response.clone();
            // Clone for Cache
            const cloneCache = response.clone();

            // Save in IDB
            await saveToIndexedDB(resourceUrl, cloneIDB);

            // Save in Cache
            await cache.put(resourceUrl, cloneCache);
          } else {
            console.error("Non-OK response for", resourceUrl, response.status);
          }
        } catch (err) {
          console.error("Failed to fetch/cache:", resourceUrl, err);
        }
      }
    })()
  );

  // Immediately activate after install
  self.skipWaiting();
});

// ------------------------------------
// 5) ACTIVATE
// ------------------------------------
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((oldCache) => {
          if (oldCache !== CACHE_NAME) {
            console.log("Deleting old cache:", oldCache);
            return caches.delete(oldCache);
          }
        })
      )
    ).then(() => self.clients.claim())
  );
});

// ------------------------------------
// 6) FETCH
// ------------------------------------
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return; // Only handle GET

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // 1. If found in Cache, return immediately
      if (cachedResponse) {
        return cachedResponse;
      }
      // 2. If not in Cache, go to network
      return fetch(event.request)
        .then(async (networkResponse) => {
          // If OK, store in both Cache and IDB
          if (networkResponse && networkResponse.ok && networkResponse.type === "basic") {
            const responseForIDB = networkResponse.clone();
            const responseForCache = networkResponse.clone();

            // Save to IndexedDB
            saveToIndexedDB(event.request.url, responseForIDB)
              .catch(err => console.warn("IDB save failed:", err));

            // Save to Cache
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseForCache);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // 3. If network fails, fallback to IndexedDB
          console.warn("Network fail => trying IndexedDB for", event.request.url);
          return getFromIndexedDB(event.request.url)
            .catch((err) => {
              console.warn("IndexedDB fallback also failed:", err);
              // Optionally return some fallback page or image
            });
        });
    })
  );
});
