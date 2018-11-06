
/* Common database helper functions. */


  const dbPromise = idb.open('restaurant-db', 1, upgradeDb => {
    switch (upgradeDb.oldVersion){
      case 0:
        upgradeDb.createObjectStore('restaurants', {keyPath: 'id', autoIncrement: true});
      case 1:
        upgradeDb.createObjectStore('reviews', {keyPath: 'id', autoIncrement: true});
      case 2:
        upgradeDb.createObjectStore('offline', {keyPath: 'id', autoIncrement:true});
    }
  });


 class DBHelper {
   /* Database URL. Change this to restaurants.json file location on your server. */
    static get DATABASE_URL() {
      const port = 1337; //Change this to your server port
      return `http://localhost:${port}/`;
     }
   /* Fetch all restaurants. */
   static fetchRestaurants(callback) {
     fetch(`${DBHelper.DATABASE_URL}restaurants`).then(response => {
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
             console.log("Put Restaurants in Db.");
             for (let id in myJson.value){
               myJson.get(id);
             }
             /* Restaurants defined as 'myJson' */
             callback(null, myJson);
             return tx.complete;
             console.log("End tx.");
         });
       }).catch(error => {
         console.log('Problem with: \n', error);
         callback(error, null);
       });
     })
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


  // static checkOnline(){
  //   window.addEventListener("offline", function(event) {
  //      if(!event.navigator.online == true) {
  //         console.log("offline");
  //       }
  //     else{
  //       console.log("online");
  //     }
  //     return;
  //   });
  // }


  // Just gets reviews
  static getReviewsById(id, callback) {
    console.log("[getReviewsById()] Returning reviews data");
     fetch(`${DBHelper.DATABASE_URL}reviews/?restaurant_id=${id}`).then(response => {
      if(!response.ok){
        throw new Error('ERROR: response not ok.')
       } return response.json().then(myReviews => {
          console.log('Status: ', response.status );
          console.log("...returning rev data for getReviewsById()");
          dbPromise.then(db => {
          let tx = db.transaction('reviews', 'readwrite');
          let store = tx.objectStore('reviews');
          myReviews.forEach(element => {
             store.put(element);
             // console.log(element);
            });
            console.log("Put each review in Db.");
            for (let id in myReviews.value){
              myReviews.get(id);
            }
            callback(null, myReviews);
            return tx.complete;
            console.log("End tx.");
          });
        }).catch(function(error){
          console.log('FETCH Parsing Error', error);
          callback(error, null);
        });
      })
    }

// writeup for doug's version
// Open the database ad add the request details to the pending table
// Call the nextPending function to loop over the Queue
// Iterate over the pending items until there is a network failure
  // first check for obj: if nothing in obj, db.close() & return;
  // else, open db trans.
  // then open a cursor;
    // for each item it encounters, check that the item is good.
    // if not, delete the item, run the callback, return
  //then fetch the JSON
    // if the response is bad, return
    // else data is good, so use the cursor to delete the item
  // catch errors


// doug's looping version - https://github.com/thefinitemonkey/udacity-restaurant-reviews/blob/master/app/js/dbhelper.js
  // static addRequestToQueue(review, id) {
  //   // Open the database ad add the request details to the pending table
  //   dbPromise.then(db => {
  //     let tx = db.transaction('offline', 'readwrite');
  //     let store = tx.objectStore('offline').put({
  //       data: {
  //         url,
  //         method,
  //         body
  //       }
  //     })
  //   })
  //   .catch(function(error){
  //     console.log('FETCH Parsing Error', error);
  //   }).then(DBHelper.nextOffline());
  // }
  //
  // static nextOffline(){
  //   // Call the nextPending function to loop over the Queue
  //   DBHelper.tryToPost(DBHelper.nextOffline);
  // }
  //
  // static tryToPost(callback){
  //   let url, method, body;
  //   // first check for obj: if nothing in obj, db.close() & return;
  //   dbPromise.then(db => {
  //     if(!db.objectStoreNames.length){
  //       console.log("DB not available");
  //       db.close();
  //       return
  //     }
  //     // else, open db trans.
  //     let tx = db.transaction("offline", "readwrite");
  //     let store = tx.objectStore("offline")
  //     // then open a cursor
  //     .openCursor().then(cursor => {
  //       if(!cursor){
  //         return;
  //       }
  //       let value = cursor.value;
  //       url = cursor.value.data.method;
  //       body = cursor.value.data.body;
  //       method = cursor.value.data.method;
  //
  //       // for each item it encounters, check that the item is good.
  //       if((!url || !method) || (method === "POST" && !body)){
  //         cursor.delete().then(callback());
  //         // if not, delete the item, run the callback, return
  //         return;
  //       };
  //
  //       const properties = {
  //         //this is the body of whatever it is
  //         body: JSON.stringify(body), method: method
  //       }
  //
  //       console.log("sending from queue ", properties);
  //       //then fetch the JSON
  //       fetch(url, properties)
  //       .then(response => {
  //         // if the response is bad, return
  //         if(!response.ok && !response.redirected){
  //           return;
  //         }
  //       })
  //       .then(function(){
  //         // else data is good, so use the cursor to delete the item
  //         let deleteTx = db.transaction("offline", "readwrite");
  //         let deleteObj = db.objectStore("offline").openCursor()
  //           .then(cursor => {
  //             cursor.delete().then(() => {
  //               callback();
  //             })
  //           })
  //       })
  //       .catch(error => {
  //         console.log("Error reading cursor");
  //         return;
  //       })
  //     })
  //   })
  // }

//how it should work
// window.eventListener('offline');
// listen for offline status
//   if offline
//     on submit
//       put code into offline_db
//       return
//   set offline status to true
//   return
//
// window.eventListener('offline-true')
// if offline-true
//   check for online.Status
//     if onLine
//       get all posting from offline_db
//       put all onto webpage
//       return
//     else {
//       return
//     }

  static putReview(review, id) {
    console.log("[putReview()] Adding a review for ", JSON.stringify(review));
    createReviewHTML(review, id);

    // let createOfflineObject = {
    //   name: 'offlineObj',
    //   data: review,
    //   object_type: 'review'
    // };

    if (!navigator.online){
      console.log('site is OFFline');
      //create an offline object?
      // let createOfflineObject = {
      //   name: 'offlineObj',
      //   data: review,
      //   object_type: 'review'
      // };
      //put the review into the offline db
      dbPromise.then(db => {
        let tx = db.transaction('offline', 'readwrite');
        let store = tx.objectStore('offline');
        store.put(rev);
        return;
        fillReviewsHTML(review, id); // adds reviews to the page
      }).then(response =>{
          //nothing seems to go here?
      }).catch(error => {
        console.log('FETCH Parsing Error', error);
      });
      //do something with the offline object
      // DBHelper.sendDataWhenOnline(createOfflineObject);
      // return;

    } else {
      console.log('site is ONline');

      //create this fetch methods object
      let fetchMethods = {
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify(review),
        headers:{'Content-Type': 'application/json'}
      };

      fetch(`${DBHelper.DATABASE_URL}reviews/?restaurant_id=${id}`, fetchMethods)
      .then(response => {
      console.log('* after FETCH is * ', JSON.stringify(review));
      console.log('Status: ', response.status );

        if(!response.ok){
          throw new Error('ERROR: response not ok.')
        }

        return response.json()
        .then(data => {
          console.log('FETCH Result', JSON.stringify(data));
          // go to the offline storage db
          dbPromise.then(db => {
            let tx = db.transaction('offline', 'readwrite');
            let store = tx.objectStore('offline');
            data.forEach(rev => {
              store.put(rev);
              console.log("This is ", rev);
              fillReviewsHTML(review, id); // adds reviews to the page
              store.delete(id);
              console.log("deleted ")
            })
          })
          return tx.complete;
          console.log('end rev');
          // .then(reviews => { /* do something */})
          // .catch(error => {
          //   console.log('FETCH Parsing Error', error);
          // });
        // )
      });
    // .catch(error => {
    //   console.log('FE TCH Failed', error);
    //   })
    });
  } //end else
};

    // window.addEventListener('online', (event) => {
    //   console.log('Browser: Online again! Get data.');
    //   let data = JSON.parse(localStorage.getItem('data'));
    //
    //   console.log('updating and cleaning ui');
    //   [...document.querySelectorAll(".reviews_offline")]
    //   .forEach(element => {
    //     element.classList.remove("reviews_offline")
    //     element.querySelector(".offline_label").remove()
    //   });
    //   if (data !== null) {
    //     console.log(data);
    //     if (createOfflineObject.name === 'offlineObj') {
    //       DBHelper.addReview(createOfflineObject.data);
    //     }


      // fetch(`${DBHelper.DATABASE_URL}reviews/?restaurant_id=${id}`, fetchMethods)
      // .then(response => {
      //   console.log('* after FETCH is * ', JSON.stringify(review));
      //   console.log('Status: ', response.status );
      //   if(!response.ok){
      //     throw new Error('ERROR: response not ok.')
      //   }
      //
      //   return response.json()
      //   .then(function(data){
      //     console.log('FETCH Result', JSON.stringify(data));
      //     dbPromise.then(db => {
      //       let tx = db.transaction('offline', 'readwrite');
      //       let store = tx.objectStore('offline');

  //           if (!navigator.onLine) {
  //             store.put(rev);
  //             return;
  //             console.log('status is not 200');
  //             fillReviewsHTML(review, id); // adds reviews to the page
  //           } else if (navigator.onLine) {
  //             data.forEach(rev => {
  //               store.put(rev);
  //               console.log("This is ", rev);
  //               fillReviewsHTML(review, id); // adds reviews to the page
  //               store.delete(id);
  //               console.log("deleted ")
  //             });
  //           }
  //           return tx.complete;
  //           console.log('end rev');
  //         }) //end dbPromise
  //
  //         .then(function(reviews){ fillReviewsHTML(review, id); })
  //
  //         if (data.result === 'success') {
  //           data.forEach(rev => {
  //             store.put(rev);
  //             console.log("this is ", rev);
  //             fillReviewsHTML(review, id); // adds reviews to the page
  //           });
  //         } else { fillReviewsHTML(review, id); }
  //
  //         for (let id in data.value){
  //           data.get(id);
  //           fillReviewsHTML(review, id);
  //           }
  //         return index;
  //         })
  //       .catch(function(error){
  //         console.log('FETCH Parsing Error', error);
  //       });
  //   }).catch(function(error) {
  //     console.log('FETCH Failed', error);
  //     })
  // };


  // static putReviewsWhenOnline(review, id) {
  //   console.log('Online so adding reviews: ', JSON.parse(review));
  //
  //
  //   dbPromise.then(db => {
  //     let tx = db.transaction('reviews', 'readwrite');
  //     let store = tx.objectStore('reviews');
  //     let index = store.index('id');
  //
  //   }
  //   fetch(`${DBHelper.DATABASE_URL}reviews/?restaurant_id=${id}`,
  //     }).then(function(response) {
  //     console.log('* after FETCH is * ', JSON.stringify(review));
  //     console.log('Status: ', response.status );
  //   });
  // }



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



  /* Use Fetch to update restaurant favorite. */
  static updateFavoriteStatus(restaurantId, isFavorite) {

    fetch(`http://localhost:1337/restaurants/${restaurantId}/?is_favorite=${isFavorite}`, {method: 'PUT'}).then(function(response) {
      console.log('Status: ', response.status );
        if(!response.ok){
          throw new Error('ERROR: response not ok.')
        }
        response.json().then(function(getFavData){
          console.log('FETCH Result', getFavData);
          dbPromise.then(function(db) {
            let tx = db.transaction('restaurants', 'readwrite');
            let store = tx.objectStore('restaurants');
            store.get(restaurantId).then(restaurant => {
              restaurant.is_favorite = isFavorite; /* SEE - https://www.youtube.com/watch?v=XbCwxeCqxw4*/
              store.put(restaurant);
            });
        })
        .catch(function(error){
          console.log('FETCH Parsing Error', error);
        });
      });
    });
  }

/** end of Class DBHelper **/
}
