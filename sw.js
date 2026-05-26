// Service Worker - permite uso offline do PWA
const CACHE_NAME = 'gastos-pwa-v4';
const ARQUIVOS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './icon-180.png',
  'https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=JetBrains+Mono:wght@400;500;700&family=Inter:wght@400;500;600&display=swap',
];

// Instalar: faz cache inicial
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ARQUIVOS))
      .then(() => self.skipWaiting())
  );
});

// Ativar: limpa caches antigos
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Buscar: cache-first para recursos, network-first para API de câmbio
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // API de câmbio: network-first (sempre tenta buscar atualizado)
  if (url.hostname === 'economia.awesomeapi.com.br') {
    e.respondWith(
      fetch(e.request).catch(() => caches.match(e.request))
    );
    return;
  }

  // Outros: cache-first
  e.respondWith(
    caches.match(e.request).then(resp => resp || fetch(e.request).then(r => {
      // Cacheia recursos novos (apenas GET com sucesso)
      if (e.request.method === 'GET' && r.ok) {
        const clone = r.clone();
        caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
      }
      return r;
    }).catch(() => caches.match('./index.html')))
  );
});
