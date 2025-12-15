// sw.js - Service Worker
const CACHE_NAME = 'echoscript-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './main.js',
  './manifest.json',
  './icon.png'
];

// 安裝 Service Worker 並快取檔案
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
});

// 攔截網路請求：有快取就用快取 (離線支援)，沒快取就上網抓
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request))
  );
});