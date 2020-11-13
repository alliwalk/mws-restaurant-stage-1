
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
     // const port = 1337; //Change this to your server port
     // return `http://localhost:${port}/`;
     return 'https://udacity-mws-final.netlify.app/data/restaurants.json';
    
   }

   /* Fetch all restaurants. */
   static fetchRestaurants(callback) {
     // debugger;

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

  // Just gets reviews
  static getReviewsById(id, callback) {
    console.log("[getReviewsById] Returning reviews data");
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


  static putReview(review, id) {
    console.log("[putReview] Adding a review for ", review, id);
    createReviewHTML(review, id);


    if (!navigator.onLine){
      console.log('The site is OFFline');
      /* put the reviews into offline db */
      dbPromise.then(db => {
        let tx = db.transaction('offline', 'readwrite');
        let store = tx.objectStore('offline');
        store.put(review);
        fillReviewsHTML(review, id); // adds reviews to the page
      }).then(response =>{
          console.log("Just put review in OFFLINE db.");
      }).catch(error => {
        console.log('FETCH Parsing Error', error);
      });
      DBHelper.addReviewWhenOnline(review, id);
      // return;

    } else {
      // This is if you're online when first clicking Submit.
      console.log('The site is ONline');
      //create this fetch methods object
      // DBHelper.postToServer(review, id);

      let fetchMethods = {
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify(review),
        headers:{'Content-Type': 'application/json'}
      };

      fetch(`${DBHelper.DATABASE_URL}reviews/?restaurant_id=${id}`, fetchMethods).then(response => {
        console.log('* after FETCH is * ', JSON.stringify(review));
        console.log('Status: ', response.status );

        if(!response.ok){
          throw new Error('ERROR: response not ok.')
        }

        return response.json().then(data => {
          console.log('FETCH Result', JSON.stringify(data));

          dbPromise.then(db => {
            let tx = db.transaction('reviews', 'readwrite');
            let store = tx.objectStore('reviews');
            data.forEach(rev => {
              store.put(rev);
              console.log("This is ", rev);
              fillReviewsHTML(review, id); // adds reviews to the page

            })
            return tx.complete;
            console.log('end rev');
          }).then(response =>{
              console.log("response: ", response);
          }).catch(error => {
            console.log('FETCH Parsing Error', error);
          });
        });
      }); //end fetch

    } //end else
  }


static isOnline() {
   function handleConnectionChange(event){
      let result = event.type;

        if(event.type == "offline"){
            console.log("You lost connection.");
        }
        if(event.type == "online"){
            console.log("You are now back online.");
            DBHelper.addReviewWhenOnline();
        }
    }
    window.addEventListener('online', handleConnectionChange);
    window.addEventListener('offline', handleConnectionChange);
}

 /* ...if offline...*/
  static addReviewWhenOnline(review, id){
     console.log("[addReviewWhenOnline] Add this review when online: ", review, id);
    // console.log(navigator.onLine);
    DBHelper.isOnline();

    var result = navigator.onLine;
      /* ...check if now online...*/
      if (result){ //is true

        console.log("BACK ONLINE");

        /* This IF is if you're back online after being offline first.
        The review is already posted to the screen, and in the offline queue.
        Now it needs to be deleted from the offline queue.*/
        /* ...if online, go through the db and get all the stuff...*/

          dbPromise.then(db => {
            console.log("Open OFFLINE db...");
            return db.transaction('offline')
              .objectStore('offline')
              .getAll();
            }).then(reviews => {
              reviews.forEach(function(review) {
                console.log("The review: ", review, review.id);
                DBHelper.postToServer(review, id);
              })
            });
        return;
      }
  }

  static postToServer(review, id){
    let fetchMethods = {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify(review),
      headers:{'Content-Type': 'application/json'}
    };

    fetch(`${DBHelper.DATABASE_URL}reviews/?restaurant_id=${id}`, fetchMethods).then(response => {
      console.log('Fetch from network because now ONLINE AGAIN...', JSON.stringify(review));

      if(!response.ok){
        throw new Error('ERROR: response not ok.')
      }

      return response.json().then(data => {
        // console.log('FETCH Result', JSON.stringify(data));

        dbPromise.then(db => {
          let tx = db.transaction('reviews', 'readwrite');
          let store = tx.objectStore('reviews');
          data.forEach(rev => {
            store.put(rev);
          })
          console.log('Move from offline db to reviews db.');
          tx.complete;

          //Discussed during 1:1 11.12.2018
          let tx2 = db.transaction('offline','readwrite');
          let store2 = tx2.objectStore('offline');
            data.forEach(del => {
            store2.clear(del.id);
          })
          tx2.complete;
          console.log('Offline DB is cleared.');
        }).then(response =>{
            console.log("response: ", response);
        }).catch(error => {
          console.log('FETCH Parsing Error', error);
        });
      });
    }); //end fetch
  }

  /** Restaurant page URL.  */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }

  /**  * Restaurant image URL. */
  /* If/else idea & .photograph, from https://github.com/fgiorgio/mws-restaurant-stage-1/blob/master/js/dbhelper.js
  Nov 21, 2018
  */
  static imageUrlForRestaurant(restaurant) {
    if(typeof restaurant.photograph !== 'undefined') {
      return (`/img/${restaurant.photograph}`);
    }else{
      return (`/img/10`);
    }
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
  static updateFavoriteStatus(restaurantId, newFavStatus) {

    fetch(`${DBHelper.DATABASE_URL}restaurants/${restaurantId}/?is_favorite=${newFavStatus}`, {method: 'PUT'}).then(function(response) {
      console.log('Status: ', response.status );
        if(!response.ok){
          throw new Error('ERROR: response not ok.')
        }
        response.json().then(function(getFavData){
          console.log('[dbhelper.js] FETCH Result:', getFavData.is_favorite);
          dbPromise.then(function(db) {
            let tx = db.transaction('restaurants', 'readwrite');
            let store = tx.objectStore('restaurants');
            store.get(restaurantId).then(restaurant => {
              restaurant.is_favorite = newFavStatus; /* SEE - https://www.youtube.com/watch?v=XbCwxeCqxw4 - between 10/23 - 11/13 2018*/
              store.put(restaurant);
              console.log("[dbhelper.js] Updating Fav status to:", restaurant.is_favorite);
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
