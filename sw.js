// Nexus — minimal service worker
// Required by Chrome/Android (alongside the manifest) to trigger the
// automatic "Install app" prompt. Caches the app shell for instant reloads
// and basic offline access; network requests still go live when online.

const CACHE = 'nexus-shell-v1';
const SHELL_URL = './'; // adjust if index.html lives at a different path

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.add(SHELL_URL))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Only handle the app shell navigation request; let everything else
  // (Claude API calls, etc.) go straight to the network untouched.
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(SHELL_URL))
    );
  }
});
