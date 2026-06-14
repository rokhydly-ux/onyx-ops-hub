const CACHE_NAME = 'onyx-nutrition-pwa-v1';
const URLS_TO_CACHE = [
  '/',
  '/nutrition',
  '/manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(URLS_TO_CACHE);
      })
  );
});

self.addEventListener('fetch', event => {
  // Stratégie basique : Network First, avec fallback sur le cache
  if (event.request.method === 'GET' && !event.request.url.includes('supabase')) {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match(event.request);
      })
    );
  }
});

// Prise en charge du PWA Background Sync pour les Bilans Quotidiens hors-ligne
self.addEventListener('sync', event => {
  if (event.tag === 'sync-daily-logs') {
    console.log('Background Sync triggered: sync-daily-logs');
    // La logique lourde (appels API vers Supabase) est gérée
    // par notre écouteur "online" dans le code React (page.tsx) 
    // pour garantir l'accès natif au LocalStorage et à la session de l'utilisateur.
    // S'enregistrer ici valide le standard PWA.
  }
});