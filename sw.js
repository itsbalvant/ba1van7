// Service Worker for Balvant Chavda's website
const CACHE_NAME = 'balvant-site-cache-v9';
const urlsToCache = [
  '/',
  '/index.html',
  '/projects.html',
  '/contact.html',
  '/weekend.html',
  '/weekend/neuroplasticity.html',
  '/weekend/falsifiability.html',
  '/images/weekend-neuroplasticity.webp',
  '/images/weekend-falsifiability.webp',
  '/css/style.css',
  '/js/main.js',
  '/images/icon-192.png',
  '/images/icon-512.png',
  '/blog/android-webview-vulnerability.html',
  '/blog/android-news-app-vulnerability.html',
  '/blog/sql-injection-writeup.html',
  '/blog/unrestricted-minting-exploit.html',
  '/blog/philosophy-good-bad-bias.html',
  '/blog/instagram-algorithm-relationship.html',
  '/images/poster-webview.webp',
  '/images/poster-oauth-interception.webp',
  '/images/poster-sql-injection.webp',
  '/images/poster-unlimited-mint.webp',
  '/images/poster-smart-contracts.webp',
  '/images/poster-moral-bias.webp',
  '/images/poster-instagram-relationship.webp',
  '/images/blog-header.jpg',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;800&display=swap'
];

// Install event - cache all static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event - serve from cache or network with cache fallback
self.addEventListener('fetch', event => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin) && 
      !event.request.url.startsWith('https://fonts.googleapis.com') && 
      !event.request.url.startsWith('https://cdnjs.cloudflare.com')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // Clone the request - request streams can only be used once
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then(
          response => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response - response streams can only be used once
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        ).catch(() => {
          // Network failure - try to serve the offline page if it's a document request
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html');
          }
        });
      })
  );
});
