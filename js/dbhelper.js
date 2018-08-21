 (function() {
   'use strict';

   //check for support
   if (!('indexedDB' in window)) {
     console.log('This browser doesn\'t support IndexedDB');
     return;
   }

   var dbPromise = idb.open('restaurant-db', 1,
     function(upgradeDb) {
       if (!upgradeDb.objectStoreNames.contains('names')) {
          var nameOS = upgradeDb.createObjectStore('names', {keyPath: 'id', autoIncrement: true});
          nameOS.createIndex('restaurant', 'restaurant', {unique: true});
          nameOS.createIndex('neighborhood', 'neighborhood', {unique: false});
        }
      console.log("ObjectStore: Created names");
      if (!upgradeDb.objectStoreNames.contains('cuisine')) {
        var cuisineOS = upgradeDb.createObjectStore('cuisine');
        cuisineOS.createIndex('cuisine', 'cuisine', {unique: false});
       }
      console.log("ObjectStore: Created cuisines");
      });
    })();


    // let idb = window.idb;
    // let open = indexedDB.open('restaurant-db', 1);
    //
    // open.onupgradeneeded = function(){
    //   let db = open.result;
    //   db.createObjectStore('foodList', { autoIncrement: true});
    //   console.log("ObjectStore: Created");
    // }
    //
    // open.onsuccess = function(){
    //   let db = open.result;
    //   let tx = db.transaction('foodList', 'readwrite');
    //   let store = tx.objectStore('foodList');
    //   console.log("ObjectStore: Foodlist added");
    //
    //   store.put({ r_id:'123', r_name:'chelsea', res_loc: '', res_cuisine: "pizza", res_hours: "today"});
    //   console.log("ObjectStore: Values added")
    //
    //
    //   let q1 = store.get(1);
    //   let qs = index.get("Robertas");
    //
    //   q1.onsuccess = function(){
    //     console.log(q1.result);
    //     console.log(q1.result.res_name);
    //   };
    //   //
    //   qs.onsuccess = function(){
    //     console.log(qs.result.res_name);
    //   };
    //   tx.oncomplete = function(){
    //     db.close();
    //   }
    // }



/**
 * Common database helper functions.
 */
class DBHelper {

  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
   static get DATABASE_URL() {
     const port = 1337; //Change this to your server port
     // stage1:
     // return `http://localhost:${port}/data/restaurants.json`;
     // return `http://localhost:${port}/restaurants/`;


// FETCH
     // fetch(`http://localhost:${port}/restaurants/`).then(function(response) {
     //  if(!response.ok){
     //    throw new Error('ERROR: response not ok.')
     //    }
     //  return response.json();// work with the returned response
     //  }).then(function(responseAsJson) {
     //    console.log(responseAsJson); //do stuff
     //  }).catch(function(error){
     //    console.log('Problem with: \n', error);
     // });

   }


  /**
   * Fetch all restaurants.
   */
  static fetchRestaurants(callback) {
    let xhr = new XMLHttpRequest();
    xhr.open('GET', DBHelper.DATABASE_URL);
    xhr.onload = () => {
      if (xhr.status === 200) { // Got a success response from server!
        const json = JSON.parse(xhr.responseText);
        const restaurants = json.restaurants;
        // const restaurants = json.restaurants; [old]
        callback(null, restaurants);
      } else { // Oops!. Got an error from server.
        const error = (`Request failed. Returned status of ${xhr.status}`);
        callback(error, null);
      }
    };
    xhr.send();
  }

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
