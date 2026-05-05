/* =====================================================
   Service Worker — 定期巡回計算ツール PRO版
   GitHub Pages対応版 sw_pro.js
   ===================================================== */
var CACHE_NAME = 'teiki-pro-v4';
var ASSETS = [
  './',
  './index.html',
  './manifest_pro.json',
  './icon-180.png',
  './icon-192.png',
  './icon-512.png',
  './splash-iphone14pro.png',
  './splash-iphone14pm.png',
  './splash-iphone14.png',
  './splash-iphone13pm.png',
  './splash-iphone12m.png',
  './splash-iphonex.png',
  './splash-iphonexr.png',
  './splash-iphone8.png',
  './splash-ipadpro13.png',
  './splash-ipadpro11.png',
  './splash-ipad.png'
];

/* インストール：キャッシュに登録 */
self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

/* アクティベート：古いキャッシュを削除 */
self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE_NAME; })
            .map(function(k) { return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

/* フェッチ：キャッシュ優先、なければネット */
self.addEventListener('fetch', function(e) {
  /* GETリクエストのみ対象 */
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(function(cached) {
      return cached || fetch(e.request).then(function(res) {
        if (res && res.status === 200 && res.type === 'basic') {
          var resClone = res.clone();
          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(e.request, resClone);
          });
        }
        return res;
      });
    }).catch(function() {
      return caches.match('./index.html');
    })
  );
});

/* skipWaiting メッセージ対応 */
self.addEventListener('message', function(e) {
  if (e.data && e.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});
