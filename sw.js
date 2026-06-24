const CACHE = 'smeta-e98c574a06b7';
const ASSETS = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png'];
self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(
    ks.filter(k => k !== CACHE).map(k => caches.delete(k))
  )).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  // HTML/навигацию тянем БЕЗ HTTP-кэша (cache:'no-store') — иначе обновления
  // не появляются до истечения max-age GitHub Pages (частая жалоба «не обновилось»).
  const isDoc = e.request.mode === 'navigate' || e.request.destination === 'document';
  const req = isDoc ? new Request(e.request.url, {cache: 'no-store'}) : e.request;
  e.respondWith(
    fetch(req).then(resp => {
      const copy = resp.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy)).catch(()=>{});
      return resp;
    }).catch(() => caches.match(e.request).then(r => r || caches.match('./index.html')))
  );
});
