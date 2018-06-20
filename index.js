if (navigator.serviceWorker){
  navigator.serviceWorker.register('sw.js', {scope: '/'})
    .then(function(registration){
      console.log("Service Worker is registered", registration);
    })
    .catch(function(err){
        console.log("Service Worker failed to register", err);
    })
}
