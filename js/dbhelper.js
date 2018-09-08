/**
 * Common database helper functions.
 */

 var dbPromise = idb.open('restaurant-idb', 1, upgradeDb => {
   if (!upgradeDb.objectStoreNames.contains('restaurants')) {
      const foodOs = upgradeDb.createObjectStore('restaurants', {keyPath: 'id', autoIncrement: true});
        foodOs.createIndex('rest_name', 'name', {unique: true});
        foodOs.createIndex('boro_name', 'neighborhood', {unique: false});
        foodOs.createIndex('cuis_name', 'cuisine_type', {unique: false});
      }
   console.log("ObjectStore: Created restaurants");
   });



class DBHelper {
  /**
   * Database URL. Change this to restaurants.json file location on your server.
   */
   static get DATABASE_URL() {
     const port = 1337; //Change this to your server port
     // stage1:
     // return `http://localhost:${port}/data/restaurants.json`;
     return `http://localhost:${port}/restaurants/`;
    }
  /**
    Fetch all restaurants.
   */
  static fetchRestaurants(callback) {
   // var stuffs = dbPromise.then(db => {
   //    var tx = db.transaction('restaurants');
   //    var store = tx.objectStore('restaurants');
   //      return store.getAll('restaurants');
   //
   //    console.log("ObjectStore: getting all the stuff");
   //      return stuffs;
   //
   //    }).then(items => {
   //
   //        console.log("Items by name: ", items);
   //    });

    fetch(DBHelper.DATABASE_URL).then(response => {
      if(!response.ok){
        throw new Error('ERROR: response not ok.')
      } return response.json().then(myJson => {
          // create db and put stuff in
          dbPromise.then(db => {
            var tx = db.transaction('restaurants', 'readwrite');
            var store = tx.objectStore('restaurants');
            myJson.forEach(element => {
              store.put(element);
            });
            console.log("ObjectStore: elements added");
            return tx.complete;
          }).then(function() {
          // close dbPromise
          console.log('myJson is returned');
          });
      }).catch(error => {
        console.log('Problem with: \n', error);
      });
    // } //end else
    console.log("out of all the stuff");
  })
  console.log("is it here yet?");
}



  /**
   * Fetch a restaurant by its ID.
   1
   */
  static fetchRestaurantById(id, callback) {
    // // fetch all restaurants with proper error handling.
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        const restaurant = restaurants.find(r => r.id == id);
        if (restaurant) { // Got the restaurant
          callback(null, restaurant);
        } else { // Restaurant does not exist in the database
          callback('Restaurant does not exist', null);
        }
      }
    });

  }



  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   2
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   3
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood == neighborhood);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   4
  //  */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants
        if (cuisine != 'all') { // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != 'all') { // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        callback(null, results);
      }
    });
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   5
   */
  static fetchNeighborhoods(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
        callback(null, uniqueNeighborhoods);
      }
    });
  }

  /**
   * Fetch all cuisines with proper error handling.
   6
   */
  static fetchCuisines(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)
        callback(null, uniqueCuisines);
      }
    });
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }
//
//   /**
//    * Restaurant image URL.
//    */
  static imageUrlForRestaurant(restaurant) {
    return (`/img/${restaurant.photograph}`);
  }
//   //
//   // /**
//   //  * Map marker for a restaurant.
//   //  */
   static mapMarkerForRestaurant(restaurant, map) {
    // https://leafletjs.com/reference-1.3.0.html#marker
    const marker = new L.marker([restaurant.latlng.lat, restaurant.latlng.lng],
      {title: restaurant.name,
      alt: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant)
      })
      marker.addTo(newMap);
    return marker;
  }
 static mapMarkerForRestaurant(restaurant, map) {
    const marker = new google.maps.Marker({
      position: restaurant.latlng,
      title: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant),
      map: map,
      animation: google.maps.Animation.DROP}
    );
    return marker;
  }
}
