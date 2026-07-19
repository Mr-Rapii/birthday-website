const CACHE_NAME = 'birthday-cache-v1';
const ASSETS = [
  './',
  './index.html',
  './css/style.css',
  './js/loading.js',
  './js/video-intro.js',
  './js/countdown.js',
  './js/three-scene.js',
  './js/audio.js',
  './js/gallery.js',
  './js/main.js',
  './manifest.json'
];

self.addEventListener('install', (event)=>{
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)).catch(()=>{})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event)=>{
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event)=>{
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request))
  );
});
