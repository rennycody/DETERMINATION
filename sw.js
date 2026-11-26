/* Service worker: lets the app load offline and install like a real app.
   Change the version number below whenever you update your files. */
const CACHE = "determination-v3";
const CORE = ["./", "index.html", "style.css", "script.js", "cloud.js", "firebase-config.js", "manifest.json", "icon-192.png", "icon-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(CORE)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Serve OUR OWN files from cache instantly and refresh them in the background.
// Everything else (Firebase, Google sign-in, fonts) goes straight to the network
// and is never cached, so logins and the leaderboard always stay live.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(event.request).then((hit) => {
      const network = fetch(event.request)
        .then((res) => {
          if (res && res.status === 200) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(event.request, copy)).catch(() => {});
          }
          return res;
        })
        .catch(() => hit);
      return hit || network;
    })
  );
});
