const CACHE_NAME = 'arab-pwa-v14-student-selection';
const APP_SHELL = ['./','./index.html','./manifest.json','./icon.svg','./icon-192.png','./icon-512.png'];
self.addEventListener('install', event => { event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', event => { event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin === self.location.origin) {
    event.respondWith(caches.match(req).then(cached => cached || fetch(req).then(res => { if (res.ok) { const copy=res.clone(); caches.open(CACHE_NAME).then(c=>c.put(req,copy)); } return res; }).catch(() => caches.match('./index.html'))));
  } else if (/cdn\.jsdelivr\.net|cdnjs\.cloudflare\.com|fonts\.googleapis\.com|fonts\.gstatic\.com/.test(url.hostname)) {
    event.respondWith(caches.match(req).then(cached => cached || fetch(req).then(res => { if (res && (res.ok || res.type === 'opaque')) { const copy=res.clone(); caches.open(CACHE_NAME).then(c=>c.put(req,copy)); } return res; })));
  }
});
