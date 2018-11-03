//Referenced: How to set up a basic service worker - https://www.youtube.com/watch?v=BfL3pprhnms
// Accessed June 20, 2018

if (navigator.serviceWorker){
  navigator.serviceWorker.register('sw.js', {scope: '/'})
    .then(function(registration){
      console.log("Service Worker is registered", registration);
    })
    .catch(function(err){
        console.log("Service Worker failed to register", err);
    })
}

// 
// navigator.serviceWorker.ready.then(function(swRegistration){
//   return swRegistration.sync.register('myFirstSync');
// })
