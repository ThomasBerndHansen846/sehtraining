// Service Worker der Web-App „Sehtraining“: legt beim ersten Öffnen alle Dateien der Web-App
// auf dem iPhone ab und liefert sie danach von dort, auch ohne Internet. Anfragen an andere
// Server (die Sicherung bei GitHub) gehen unverändert ins Netz.
// Neue Fassung: Das Bauwerkzeug setzt unten die Fassung ein; ändert sie sich, lädt das iPhone
// alle Dateien neu. Sie gelten ab dem nächsten Öffnen der Web-App.
var FASSUNG = '2026-11-01-23edf9';
var ABLAGE = 'sehtraining-webapp-' + FASSUNG;   // eindeutiger Name, weil alle Seiten unter <name>.github.io ihre Ablagen teilen
var DATEIEN = ['./', 'index.html', 'manifest.webmanifest', 'symbol-180.png', 'symbol-192.png', 'symbol-512.png',
  'schrift/AtkinsonHyperlegible-Regular.ttf', 'schrift/AtkinsonHyperlegible-Bold.ttf'];

self.addEventListener('install', function (e) {
  // cache: 'reload' umgeht den Zwischenspeicher des Browsers, damit wirklich die neue Fassung abgelegt wird.
  e.waitUntil(caches.open(ABLAGE).then(function (ablage) {
    return ablage.addAll(DATEIEN.map(function (u) { return new Request(u, { cache: 'reload' }); }));
  }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (e) {
  // Ablagen früherer Fassungen dieser Web-App löschen (fremde Ablagen bleiben unberührt).
  e.waitUntil(caches.keys().then(function (namen) {
    return Promise.all(namen.filter(function (n) { return n.indexOf('sehtraining-webapp-') === 0 && n !== ABLAGE; })
      .map(function (n) { return caches.delete(n); }));
  }).then(function () { return self.clients.claim(); }));
});

self.addEventListener('fetch', function (e) {
  var url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== self.location.origin) return;
  e.respondWith(caches.open(ABLAGE).then(function (ablage) {
    return ablage.match(e.request, { ignoreSearch: true }).then(function (antwort) {
      return antwort || fetch(e.request);
    });
  }));
});
