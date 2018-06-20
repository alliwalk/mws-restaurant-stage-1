var staticCacheName = 'files-cache-v1';
var filesToCache = [
  '.',
  'index.html',
  'restaurant.html',
  'css/styles.css',
  'js/dbhelper.js',
  'js/main.js',
  'js/restaurant_info.js',
  'img/1.jpg',
  'img/2.jpg',
  'img/3.jpg',
  'img/4.jpg',
  'img/5.jpg',
  'img/6.jpg',
  'img/7.jpg',
  'img/8.jpg',
  'img/9.jpg',
  'img/10.jpg'
];



// Install SW
self.addEventListener('install', function(event){
  console.log("Installing Service Worker");
  event.waitUntil(
    caches.open('files-cache-v1').then(function(cache){
      return cache.addAll([
        '.',
        'index.html',
        'restaurant.html',
        'css/styles.css',
        'js/dbhelper.js',
        'js/main.js',
        'js/restaurant.js',
        'img/1.jpg',
        'img/2.jpg',
        'img/3.jpg',
        'img/4.jpg',
        'img/5.jpg',
        'img/6.jpg',
        'img/7.jpg',
        'img/8.jpg',
        'img/9.jpg',
        'img/10.jpg'
      ]);
    })
  );
});

// Activate serviceWorker
self.addEventListener('activate', function(event) {
  console.log("Activating Service Worker");
});


// Fetch serviceWorker
self.addEventListener('fetch', function(event) {
  console.log("Fetching Service Worker", event.request.url);
});



// function fromCache(request) {
//   return caches.open(staticCacheName).then(function (cache) {
//     return cache.match(request).then(function (matching) {
//       return matching || Promise.reject('no-match');
//     });
//   });
// }
