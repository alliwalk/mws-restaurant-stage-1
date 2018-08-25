(function() {
  'use strict';

  //check for support
  if (!('indexedDB' in window)) {
    console.log('This browser doesn\'t support IndexedDB');
    return;
    }

  var dbPromise = idb.open('restaurant-idb', 1,
    function(upgradeDb) {
      if (!upgradeDb.objectStoreNames.contains('restaurants')) {
         var foodOs = upgradeDb.createObjectStore('restaurants', {keyPath: 'id', autoIncrement: true});
         // Neighborhood objectStore -- foodOs.createIndex('boro_name', 'neighborhood', {unique: false});
         // Cuisine objectStore -- foodOs.createIndex('cuis_name', 'cuisine_type', {unique: false});
         }
      console.log("ObjectStore: Created restaurants");
      });
      // var rests = JSON.parse();

        dbPromise.then(function(db) {
        var tx = db.transaction('restaurants', 'readwrite');
        var store = tx.objectStore('restaurants');
        console.log("ObjectStore: Restaurant object");
        store.add( {id: '6'});
        return tx.complete;
      })

      // dbPromise.then(function(db) {
      //   var tx = db.transaction('restaurants', 'readonly');
      //   var store = tx.objectStore('restaurants');
      //   store.getAll();
      // });
      // };

})();
