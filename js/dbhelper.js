
/**
 * Common database helper functions.
 */


 const dbPromise = idb.open('restaurant-idb', 1,
 function(upgradeDb) {
   if (!upgradeDb.objectStoreNames.contains('restaurants')) {
      const foodOs = upgradeDb.createObjectStore('restaurants', {keyPath: 'id', autoIncrement: true});
      // Neighborhood objectStore -- foodOs.createIndex('boro_name', 'neighborhood', {unique: false});
      // Cuisine objectStore -- foodOs.createIndex('cuis_name', 'cuisine_type', {unique: false});
      }
   console.log("ObjectStore: Created restaurants");
   });

class DBHelper {
  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
   // 'use strict';
   static get DATABASE_URL() {
     const port = 1337; //Change this to your server port
     // stage1:
     // return `http://localhost:${port}/data/restaurants.json`;
     return `http://localhost:${port}/restaurants/`;
    }

    // (function() {

    //check for support
    // if (!('indexedDB' in window)) {
    //   console.log('This browser doesn\'t support IndexedDB');
    //   return;
    //   }
      // const dbPromise = idb.open('restaurant-idb', 1,
      // function(upgradeDb) {
      //   if (!upgradeDb.objectStoreNames.contains('restaurants')) {
      //      const foodOs = upgradeDb.createObjectStore('restaurants', {keyPath: 'id', autoIncrement: true});
      //      // Neighborhood objectStore -- foodOs.createIndex('boro_name', 'neighborhood', {unique: false});
      //      // Cuisine objectStore -- foodOs.createIndex('cuis_name', 'cuisine_type', {unique: false});
      //      }
      //   console.log("ObjectStore: Created restaurants");
      //   });
          // var rests = JSON.parse();

        //   dbPromise.then(function(db) {
        //   var tx = db.transaction('restaurants', 'readwrite');
        //   var store = tx.objectStore('restaurants');
        //   console.log("ObjectStore: Restaurant object");
        //   store.add( {id: '6'});
        //   for(var i = 0; i < store.length; i++){
        //     store.add(i);
        //   )
        //   return tx.complete;
        // })


    // static fetchRestaurants(callback){
    //   return fetch(DBHelper.DATABASE_URL)
    //   .then(function(response) {
    //     console.log(response); //do stuff
    //     response.json();
    //   }.then(function(restaurants){
    //     dbPromise.then(function(db))
    //     console.log(restaurants)
    //   })

    // adnan
//     static fetchRestaurants(callback) {
//         return fetch(DBHelper.DATABASE_URL)
//         .then(response => response.json()) // return JSON from the server
//         .then(restaurants => callback(null, restaurants));
//         .catch(error => {
//         const errorMessage = (`Request failed. Returned status of ${error.statusText}`);
//         callback(errorMessage, null);
//        });
//       }
//
//
//       dbPromise.then(function(db) {
//       var tx = db.transaction('restaurants', 'readwrite');
//       var store = tx.objectStore('restaurants');
//       console.log("ObjectStore: Restaurant object");
//       restaurants.forEach(restaurant => {
//         store.add(restaurant);
//       })
//       return tx.complete;
//       });
//
//
// }

  /**
   * Fetch all restaurants.
   */
  static fetchRestaurants(callback) {
    // let xhr = new XMLHttpRequest();
    // xhr.open('GET', DBHelper.DATABASE_URL);
    // xhr.onload = () => {
    //   if (xhr.status === 200) { // Got a success response from server!
    //     const json = JSON.parse(xhr.responseText);
    //     const restaurants = json; // don't need .restaurants
    //     callback(null, restaurants);
    //   } else { // Oops!. Got an error from server.
    //     const error = (`Request failed. Returned status of ${xhr.status}`);
    //     callback(error, null);
    //   }
    // };
    // xhr.send();
        fetch(DBHelper.DATABASE_URL)
          .then(function(response) {
           if(!response.ok){
            throw new Error('ERROR: response not ok.')
            }
          return response.json().then(function(myJson) {
              dbPromise.then(function(db) {
              var tx = db.transaction('restaurants', 'readwrite');
              var store = tx.objectStore('restaurants');
              console.log("ObjectStore: Restaurant object");
              // store.add( {id: '6'});
              for(var i = 0; i < store.length; i++){
                store.add(i);
              }
              console.log("ObjectStore: For loop called");
              return tx.complete;
            })
          console.log('myJson is returned');
        }).catch(function(error){
          console.log('Problem with: \n', error);
        });
      })

  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {
    // fetch all restaurants with proper error handling.
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

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant) {
    return (`/img/${restaurant.photograph}`);
  }
  //
  // /**
  //  * Map marker for a restaurant.
  //  */
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
