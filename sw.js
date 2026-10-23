/* Service worker du Compteur GPS : cache hors ligne.
   - index.html : réseau d'abord (3 s max), sinon cache → toujours à jour quand on est connecté, instantané sinon.
   - le reste (grille géoïde, manifeste, icônes, polices Google) : cache d'abord, remis à jour en arrière-plan. */
'use strict';
var VERSION = 'v1';
var CACHE = 'compteur-gps-' + VERSION;
var FONTS_CSS = 'https://fonts.googleapis.com/css2?family=B612+Mono:wght@400;700&family=Barlow:wght@400;600&display=swap';
var PRECACHE = ['./', 'index.html', 'egm96-1deg.bin', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'icon-512-maskable.png', FONTS_CSS];
var NETWORK_TIMEOUT_MS = 3000;

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (c) {
      /* chaque entrée indépendamment : une police injoignable ne doit pas empêcher le cache de la page */
      return Promise.all(PRECACHE.map(function (u) { return c.add(u).catch(function () {}); }));
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

function storable(res) { return res && (res.ok || res.type === 'opaque'); }

function withTimeout(promise, ms) {
  return new Promise(function (resolve, reject) {
    var t = setTimeout(function () { reject(new Error('timeout')); }, ms);
    promise.then(function (v) { clearTimeout(t); resolve(v); }, function (err) { clearTimeout(t); reject(err); });
  });
}

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  var sameOrigin = url.origin === self.location.origin;
  var fonts = url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com';
  if (!sameOrigin && !fonts) return;

  var isPage = req.mode === 'navigate' || /\/(index\.html)?$/.test(url.pathname);

  e.respondWith(caches.open(CACHE).then(function (c) {
    if (isPage) {
      return withTimeout(fetch(req), NETWORK_TIMEOUT_MS).then(function (res) {
        if (storable(res)) c.put(req, res.clone());
        return res;
      }).catch(function () {
        return c.match(req).then(function (cached) { return cached || c.match('./'); }).then(function (cached) {
          return cached || new Response('Hors ligne et page non encore mise en cache.', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
        });
      });
    }
    return c.match(req).then(function (cached) {
      var network = fetch(req).then(function (res) {
        if (storable(res)) c.put(req, res.clone());
        return res;
      }).catch(function () { return null; });
      if (cached) { network.catch(function () {}); return cached; }
      return network.then(function (res) {
        return res || new Response('', { status: 503 });
      });
    });
  }));
});
