(function() {


  //check for support
  if (!('indexedDB' in window)) {
    console.log('This browser doesn\'t support IndexedDB');
    return;
    }

  var dbPromise = idb.open('restaurant-idb', 1,
    function(upgradeDb) {
      if (!upgradeDb.objectStoreNames.contains('restaurants')) {
         var foodOs = upgradeDb.createObjectStore('restaurants', {keyPath: 'id', autoIncrement: true});
         }
      console.log("ObjectStore: Created restaurants");
      });

    dbPromise.then(function(db) {
        var tx = db.transaction('restaurants', 'readonly');
        var store = tx.objectStore('restaurants');
        store.getAll();
        }).then(function() {
          console.log('get all the json');
        });

      dbPromise.then(function(db) {
        var tx = db.transaction('restaurants', 'readwrite');
        var store = tx.objectStore('restaurants');
        var array1 = myJson;
        array1.forEach(function(elements){
          store.add(elements);
          });
        console.log("ObjectStore: elements added");
        return tx.complete;
      }).then(function() {
      console.log('myJson is returned');
      });
})();

      // };
