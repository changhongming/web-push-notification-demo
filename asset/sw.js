const CACHE_NAME = 'push-notify-v3';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-256x256.png',
  '/icon-384x384.png',
  '/icon-512x512.png'
];

// Listen to notification and SHOW a notification popup
self.addEventListener('push', event => {
  const randVal = Math.random();
  let title = (event.data && event.data.text()) || 'a default message if nothing was passed to us';
  let body = 'Hi, Just a Test. ' + randVal;
  let tag = 'push-simple-demo-notification-tag-' + randVal;
  let icon = '/icon-512x512.png';

  event.waitUntil(
    self.registration.showNotification(title, { body, icon, tag })
  );
});



self.addEventListener('notificationclick', event => {
  event.notification.close();

  event.waitUntil(
    clients.openWindow('/')
  );
});


self.addEventListener('install', function (event) {
  // Perform install steps
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function (cache) {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});


self.addEventListener('fetch', function (event) {
  event.respondWith(
    caches.match(event.request)
      .then(function (response) {
        // Cache hit - return response
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
      )
  );
});


self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (cacheNames) {
      return Promise.all(
        cacheNames.map(function (cacheName) {
          if (CACHE_NAME !== cacheName) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
