/* =====================================================
   Service Worker — 定期巡回計算ツール PRO版
   sw_pro.js
   ===================================================== */
var CACHE_NAME = 'teiki-pro-v1';
var ASSETS = [
  '/pro.vol.3/index_pro.html',
  '/pro.vol.3/manifest_pro.json'
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
      return caches.match('/pro.vol.3/index_pro.html');
    })
  );
});

/* skipWaiting メッセージ対応 */
self.addEventListener('message', function(e) {
  if (e.data && e.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});
