const CACHE_NAME = "weather-decoder-v3"; // Ny versjon for å sikre oppdatering
const ICONS_PATH = "/svg/";

const resourcesToCache = [
  "/", 
  "/index.html", 
  "/script.js",
  // Liste over alle ikonene i `svg/`-mappen
  "/svg/01d.svg", "/svg/01n.svg", "/svg/01m.svg",
  "/svg/02d.svg", "/svg/02n.svg", "/svg/02m.svg",
  "/svg/03d.svg", "/svg/03n.svg", "/svg/03m.svg",
  "/svg/04.svg",
  "/svg/05d.svg", "/svg/05n.svg", "/svg/05m.svg",
  "/svg/06d.svg", "/svg/06n.svg", "/svg/06m.svg",
  "/svg/07d.svg", "/svg/07n.svg", "/svg/07m.svg",
  "/svg/08d.svg", "/svg/08n.svg", "/svg/08m.svg",
  "/svg/09.svg", "/svg/10.svg", "/svg/11.svg",
  "/svg/12.svg", "/svg/13.svg", "/svg/14.svg",
  "/svg/15.svg",
  "/svg/20d.svg", "/svg/20n.svg", "/svg/20m.svg",
  "/svg/21d.svg", "/svg/21n.svg", "/svg/21m.svg",
  "/svg/22.svg", "/svg/23.svg",
  "/svg/24d.svg", "/svg/24n.svg", "/svg/24m.svg",
  "/svg/25d.svg", "/svg/25n.svg", "/svg/25m.svg",
  "/svg/26d.svg", "/svg/26n.svg", "/svg/26m.svg",
  "/svg/27d.svg", "/svg/27n.svg", "/svg/27m.svg",
  "/svg/28d.svg", "/svg/28n.svg", "/svg/28m.svg",
  "/svg/29d.svg", "/svg/29n.svg", "/svg/29m.svg",
  "/svg/30.svg", "/svg/31.svg", "/svg/32.svg",
  "/svg/33.svg", "/svg/34.svg",
  "/svg/40d.svg", "/svg/40n.svg", "/svg/40m.svg",
  "/svg/41d.svg", "/svg/41n.svg", "/svg/41m.svg",
  "/svg/42d.svg", "/svg/42n.svg", "/svg/42m.svg",
  "/svg/43d.svg", "/svg/43n.svg", "/svg/43m.svg",
  "/svg/44d.svg", "/svg/44n.svg", "/svg/44m.svg",
  "/svg/45d.svg", "/svg/45n.svg", "/svg/45m.svg",
  "/svg/46.svg", "/svg/47.svg", "/svg/48.svg",
  "/svg/49.svg", "/svg/50.svg"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(resourcesToCache);
    })
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

self.addEventListener("activate", (event) => {
  const cacheWhitelist = [CACHE_NAME]; // Bare den nye cachen beholdes
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
