
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


  static putReview(review, id) {
    console.log("[putReview()] Adding a review for ", JSON.stringify(review));
    if(review.name === ""){
      return;
      console.log('nothing here');
    }

    createReviewHTML(review, id);


    if (!navigator.onLine){
      console.log('site is OFFline');
        DBHelper.addReviewWhenOnline();
      return;
      // dbPromise.then(db => {
      //   let tx = db.transaction('offline', 'readwrite');
      //   let store = tx.objectStore('offline');
      //   store.put();
      //   return;
      //   fillReviewsHTML(review, id); // adds reviews to the page
      // }).then(response =>{
      //     //nothing seems to go here?
      // }).catch(error => {
      //   console.log('FETCH Parsing Error', error);
      // });
    } else {
      console.log('site is ONline');

    //   //create this fetch methods object
    //   let fetchMethods = {
    //     method: 'POST',
    //     credentials: 'include',
    //     body: JSON.stringify(review),
    //     headers:{'Content-Type': 'application/json'}
    //   };
    //
    //   fetch(`${DBHelper.DATABASE_URL}reviews/?restaurant_id=${id}`, fetchMethods).then(response => {
    //     console.log('* after FETCH is * ', JSON.stringify(review));
    //     console.log('Status: ', response.status );
    //
    //     if(!response.ok){
    //       throw new Error('ERROR: response not ok.')
    //     }
    //
    //     return response.json().then(data => {
    //       console.log('FETCH Result', JSON.stringify(data));
    //       // go to the offline storage db
    //
          // dbPromise.then(db => {
          //   let tx = db.transaction('offline', 'readwrite');
          //   let store = tx.objectStore('offline');
          //   data.forEach(rev => {
          //     store.put(rev);
          //     console.log("This is ", rev);
          //     fillReviewsHTML(review, id); // adds reviews to the page
          //     store.delete(id);
          //     console.log("deleted ")
          //   })
          //   return tx.complete;
          //   console.log('end rev');
          // })
        // });
    // });

  } //end else
}

  static checkForOnline(){
    // if (!navigator.onLine){
      alert("The site is not online. ");

      // https://stackoverflow.com/questions/17883692/how-to-set-time-delay-in-javascript
      var delayInMilliseconds = 6500; //5 second

      setTimeout(function() {
        if (!navigator.onLine){
        //your code to be executed after 1 second
          DBHelper.addReviewWhenOnline()
          return;
          } else {
          alert("The site is online. ");
          DBHelper.addReviewWhenOnline();
          return;
          }
        }, delayInMilliseconds);
    }

  static addReviewWhenOnline(){
    // console.log(navigator.onLine);
    var result = navigator.onLine;
      if (result){ //is true
        console.log("ONLINE");

        // dbPromise.then(db => {
        //   let tx = db.transaction('offline', 'readwrite');
        //   let store = tx.objectStore('offline');
        //   return store.getAll();
        //     fillReviewsHTML(review, id); // adds reviews to the page
        //     store.delete(id);
        //     console.log("deleted stuff")
        //   }).then(function(items){
        //     console.log("items by name: ", items)
        //   })
        //   return tx.complete;
        //   console.log('end rev');
        // })

        // go to the offline Database
        // put all the stuff from the offline Database
        // delete all the stuff
        return;
      } else {
        console.log("OFFLINE");
        DBHelper.checkForOnline();
      }
      // var status = document.getElementById("status");
      // if(!navigator.onLine){
      //   var condition = "it's offline";
      // } else {
      //   var condition = "it's online";
      // }
      // console.log(condition);

      // function updateOnlineStatus(event) {
      //   // var condition = navigator.onLine ? "online" : "offline";
      //
      //   // status.className = condition;
      //   // console.log(condition);
      //
      //   if(navigator.onLine){
      //     var condition = "online";
      //   } else {
      //     var contion = "offline";
      //   }
      //   console.log(condition);
      //
      //   // log.insertAdjacentHTML("beforeend", "Event: " + event.type + "; Status: " + condition);
      // }

      // window.addEventListener('online',  updateOnlineStatus);
      // window.addEventListener('offline', updateOnlineStatus);
    // });


  }


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
          // dbPromise.then(db => {
          //   let tx = db.transaction('offline', 'readwrite');
          //   let store = tx.objectStore('offline');
          //
          //   if (!navigator.onLine) {
          //     store.put(rev);
          //     return;
          //     console.log('status is not 200');
          //     fillReviewsHTML(review, id); // adds reviews to the page
          //   } else if (navigator.onLine) {
          //     data.forEach(rev => {
          //       store.put(rev);
          //       console.log("This is ", rev);
          //       fillReviewsHTML(review, id); // adds reviews to the page
          //       store.delete(id);
          //       console.log("deleted ")
          //     });
          //   }
          //   return tx.complete;
          //   console.log('end rev');
          // }) //end dbPromise
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

/*
  static putReviewsWhenOnline(review, id) {
  window.addEventListener('online', (event) => {
    console.log('Browser: Online again! Get data.');
    console.log('Online so adding reviews: ', JSON.parse(review));
  }

    dbPromise.then(db => {
      let tx = db.transaction('reviews', 'readwrite');
      let store = tx.objectStore('reviews');
      let index = store.index('id');

    }
    fetch(`${DBHelper.DATABASE_URL}reviews/?restaurant_id=${id}`,
      }).then(function(response) {
      console.log('* after FETCH is * ', JSON.stringify(review));
      console.log('Status: ', response.status );
    });
  }

*/

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
