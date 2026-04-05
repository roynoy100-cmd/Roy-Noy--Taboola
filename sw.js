// PunchList Pro — Service Worker v1.0
const CACHE_NAME = 'punchlist-v20260329-1145';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  'https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;700&display=swap'
];

// Install
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS).catch(() => {});
    })
  );
  self.skipWaiting();
});

// Activate
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch — Cache First for assets, Network First for data
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  // Always try network first for HTML
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).then(res => {
        const clone = res.clone();
        caches.open(CACHE_NAME).then(c => c.put(event.request, clone));
        return res;
      }).catch(() => caches.match('./index.html'))
    );
    return;
  }

  // Cache first for fonts and static assets
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    event.respondWith(
      caches.match(event.request).then(cached => {
        return cached || fetch(event.request).then(res => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(event.request, clone));
          return res;
        });
      })
    );
    return;
  }
});

// Background sync
self.addEventListener('sync', event => {
  if (event.tag === 'sync-defects') {
    event.waitUntil(syncDefects());
  }
});

async function syncDefects() {
  // This would sync with Google Sheets API when online
  console.log('Background sync: punchlist data');
}
