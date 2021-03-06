var staticCacheName = 'files-cache-v1';
var filesToCache = [
  '.',
  'index.html',
  'restaurant.html',
  'css/styles.css',
  'js/dbhelper.js',
  'js/main.js',
  'js/restaurant_info.js',
  'js/lazysizes.min.js',
  'img/1.jpg',
  'img/2.jpg',
  'img/3.jpg',
  'img/4.jpg',
  'img/5.jpg',
  'img/6.jpg',
  'img/7.jpg',
  'img/8.jpg',
  'img/9.jpg',
  'img/10.jpg',
  'img/1_400.jpg',
  'img/2_400.jpg',
  'img/3_400.jpg',
  'img/4_400.jpg',
  'img/5_400.jpg',
  'img/6_400.jpg',
  'img/7_400.jpg',
  'img/8_400.jpg',
  'img/9_400.jpg',
  'img/10_400.jpg',
  'manifest.webmanifest',
  // 'data/restaurants.json',
  // 'index.js',
  'sw.js'
];


// For Install & Activate, I referenced: How to set up a basic service worker - https://www.youtube.com/watch?v=BfL3pprhnms
// Accessed June 20, 2018

// Install SW
self.addEventListener('install', function(event){
  console.log("[Service Worker] Installed ");
  event.waitUntil(
    caches.open(staticCacheName)
    .then(function(cache){
      console.log("[Service Worker] Caching");
      return cache.addAll(filesToCache);
    }).catch(function(err){
      console.log("[Cache not working]", err);
    })
  );
});

// Activate serviceWorker -- help from Slack, Oct 17
self.addEventListener('activate', function(event) {
  console.log("[Service Worker] Activated");

  event.waitUntil(
    caches.keys().then(function(cacheNames){
      return Promise.all(cacheNames.map(function(thisCacheName){

        if(thisCacheName !== staticCacheName){

          console.log("[Service Worker] Removing cached files from ", thisCacheName);
          return caches.delete(thisCacheName);
        }
      }))
    })
  )
});

// https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerGlobalScope
// June 20, 2018
self.addEventListener('fetch', function(event) {
  console.log('SW fetch OK');

  event.respondWith(
    caches.match(event.request).then(function(cacheResponse) {
      if (cacheResponse) {
        return cacheResponse;
      }
      console.log('No response found in cache. About to fetch from network...');

      return fetch(event.request).then(function (fetchResponse) {
        //put new request into cache?
        return caches
          .open(staticCacheName)
          .then(function (cache) {
            console.log("[Service Worker] New Data, new", event.request.url);
            cache.add(event.request.url, fetchResponse.clone());

            return fetchResponse;
            });
        }, function (error) {
          console.error('Fetching failed:', error);

          throw error;
        });
      }));
    });
