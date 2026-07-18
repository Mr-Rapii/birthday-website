// service-worker.js - minimal cache-first service worker for app shell
const CACHE_NAME = 'ubv2-shell-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/css/style.css',
  '/js/main.js',
  '/js/loading.js',
  '/js/video-intro.js',
  '/js/countdown.js',
  '/js/three-scene.js',
  '/js/audio.js'
];

self.addEventListener('install', (ev)=>{
  ev.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.addAll(ASSETS)).catch(()=>{}));
  self.skipWaiting();
});

self.addEventListener('activate', (ev)=>{
  ev.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (ev)=>{
  const req = ev.request;
  // only handle GET navigation and same-origin assets
  if(req.method !== 'GET') return;
  ev.respondWith(caches.match(req).then(cached => cached || fetch(req).then(resp => {
    // put a copy in cache (optional)
    const resClone = resp.clone();
    caches.open(CACHE_NAME).then(cache=>cache.put(req, resClone)).catch(()=>{});
    return resp;
  })).catch(()=>caches.match('/index.html')));
});
