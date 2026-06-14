const CACHE_NAME = 'onyx-nutrition-pwa-v2';
const URLS_TO_CACHE = [
  '/',
  '/nutrition',
  '/manifest.json'
];

self.addEventListener('install', event => {
  self.skipWaiting(); // Force l'activation immédiate du nouveau Service Worker
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(URLS_TO_CACHE);
      })
  );
});

self.addEventListener('activate', event => {
  // Nettoyage des anciens caches pour libérer de l'espace
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log("Suppression de l'ancien cache:", cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  // Ignorer les requêtes non-GET, les appels Supabase et les extensions Chrome
  if (
    event.request.method !== 'GET' ||
    event.request.url.includes('supabase') ||
    !event.request.url.startsWith('http')
  ) {
    return;
  }

  // Stratégie "Network First" avec mise en cache dynamique
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Si la requête réseau réussit, on met la réponse en cache dynamiquement
        if (response && response.status === 200 && response.type === 'basic') {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // En cas de perte de connexion (mode hors-ligne), on cherche dans le cache
        return caches.match(event.request);
      })
  );
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