// Service worker de la herramienta del guardaparque: guarda sus archivos para que abra y valide sin conexión.
// Solo atiende sus propios archivos; el resto del sitio sigue funcionando normal.
const CACHE = 'paj-guardaparque-v2';
const FILES = [
  'guardaparque.html', 'guardaparque.webmanifest', 'assets/guardaparque.js', 'assets/boleto.js',
  'assets/vendor/jsQR.js', 'assets/cancelaciones.json', 'assets/icono-guardaparque.svg'
];
const scopeUrl = new URL('./', self.location).href;
const own = url => FILES.some(f => url.startsWith(scopeUrl + f));

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
// Primero la red (para recibir actualizaciones); si no hay señal, la copia guardada.
self.addEventListener('fetch', e => {
  const url = e.request.url.split('#')[0];
  if (e.request.method !== 'GET' || !own(url)) return;
  const key = url.split('?')[0];
  e.respondWith(fetch(e.request).then(res => {
    if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(key, copy)); }
    return res;
  }).catch(() => caches.match(key)));
});
