
/* Common database helper functions. */

 const dbPromise = idb.open('restaurant-idb', 1, upgradeDb => {
   if (!upgradeDb.objectStoreNames.contains('restaurants')) {
      const foodOs = upgradeDb.createObjectStore('restaurants', {keyPath: 'id', autoIncrement: true});
        // foodOs.createIndex('favorite', 'name', {unique: true});
        // foodOs.createIndex('boro_name', 'neighborhood', {unique: false});
        // foodOs.createIndex('cuis_name', 'cuisine_type', {unique: false});
      }
   console.log("ObjectStore: Created restaurants");
   });

class DBHelper {
  /* Database URL. Change this to restaurants.json file location on your server. */
   static get DATABASE_URL() {
     const port = 1337; //Change this to your server port
     return `http://localhost:${port}/restaurants/`;
    }
  /* Fetch all restaurants. */
  static fetchRestaurants(callback) {

  /** myJson = response **/
    fetch(DBHelper.DATABASE_URL).then(response => {
      if(!response.ok){
        throw new Error('ERROR: response not ok.')
      } return response.json().then(myJson => {

          console.log("Db created. Now put stuff in.");
          dbPromise.then(db => {
            let tx = db.transaction('restaurants', 'readwrite');
            let store = tx.objectStore('restaurants');
            myJson.forEach(element => {
              store.put(element);
            });
            console.log("Put stuff in Db.");
            for (let id in myJson.value){
              myJson.get(id);
            }

            /*
            Restaurants defined as 'myJson'
            */
            callback(null, myJson);
            return tx.complete;
            console.log("End tx.");
          /*
            This .then comes from documentation, but it's not really necessary.
            }).then(function()
              {console.log('RESPONSE: myJson = response');
            });
          */
        });
      }).catch(error => {
        console.log('Problem with: \n', error);
        callback(error, null);

      });
      console.log("Fetch DBHelper is done.");
  })
  console.log("Is it here yet?");
}

  /** 1 Fetch a restaurant by its ID. */
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

  /** 2 Fetch restaurants by a cuisine type with proper error handling. */
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

  /** 3 Fetch restaurants by a neighborhood with proper error handling. */
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

  /* 4 Fetch restaurants by a cuisine and a neighborhood with proper error handling. */
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

  /* 5 Fetch all neighborhoods with proper error handling. */
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

  /*  6 Fetch all cuisines with proper error handling. */
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

  /* 4 Fetch restaurants by a favorite with proper error handling. */
  static fetchRestaurantByFavorite(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        let result = restaurants;
        if (is_favorite != false) { // check if favorite
          console.log('true');
          return result;
        } else {
          console.log('false');
          return result;
        }
        callback(null, result);
      }
    });
  }




  /** Restaurant page URL.  */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }

  /**  * Restaurant image URL. */
  static imageUrlForRestaurant(restaurant) {
    return (`/img/${restaurant.id}.jpg`);
  }

  /** Map marker for a restaurant. */
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
}
