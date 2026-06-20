// Service Worker - Ronda Agrivalle
// Versão: 2026-06-20-v4 (altere este número para forçar atualização)
const CACHE_NAME = 'ronda-agrivalle-v20260620-4';

// Instala imediatamente sem esperar
self.addEventListener('install', e => {
  self.skipWaiting();
});

// Ao ativar: limpa todos os caches antigos e assume controle
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(names => Promise.all(
        names.filter(n => n !== CACHE_NAME).map(n => {
          console.log('[SW] Removendo cache antigo:', n);
          return caches.delete(n);
        })
      ))
      .then(() => self.clients.claim())
  );
});

// Fetch: index.html SEMPRE da rede (nunca do cache)
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // Arquivos HTML e raiz: sempre busca da rede
  if (url.pathname.endsWith('.html') || url.pathname === '/' || url.pathname.endsWith('/ronda-agrivalle/')) {
    e.respondWith(
      fetch(e.request).catch(() => caches.match(e.request))
    );
    return;
  }

  // Demais recursos: cache first
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(resp => {
        if (resp && resp.status === 200) {
          const clone = resp.clone();
          caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
        }
        return resp;
      });
    })
  );
});
