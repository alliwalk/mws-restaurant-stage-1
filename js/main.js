let restaurants,
  neighborhoods,
  cuisines
var newMap
var markers = []


/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {
  initMap(); // added
  fetchNeighborhoods();
  fetchCuisines();
});

/**
 * Fetch all neighborhoods and set their HTML.
 */
fetchNeighborhoods = () => {
  DBHelper.fetchNeighborhoods((error, neighborhoods) => {
    if (error) { // Got an error
      console.error(error);
    } else {
      self.neighborhoods = neighborhoods;
      fillNeighborhoodsHTML();
    }
  });
}

/**
 * Set neighborhoods HTML.
 */
fillNeighborhoodsHTML = (neighborhoods = self.neighborhoods) => {
  const select = document.getElementById('neighborhoods-select');
  neighborhoods.forEach(neighborhood => {
    const option = document.createElement('option');
    option.innerHTML = neighborhood;
    option.value = neighborhood;
    select.append(option);
  });
}

/**
 * Fetch all cuisines and set their HTML.
 */
fetchCuisines = () => {
  DBHelper.fetchCuisines((error, cuisines) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.cuisines = cuisines;
      fillCuisinesHTML();
    }
  });
}

/**
 * Set cuisines HTML.
 */
fillCuisinesHTML = (cuisines = self.cuisines) => {
  const select = document.getElementById('cuisines-select');

  cuisines.forEach(cuisine => {
    const option = document.createElement('option');
    option.innerHTML = cuisine;
    option.value = cuisine;
    select.append(option);
  });
}

/**
 * Initialize leaflet map, called from HTML.
 */
initMap = () => {
  self.newMap = L.map('map', {
        center: [40.722216, -73.987501],
        zoom: 12,
        scrollWheelZoom: false
      });
  L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.jpg70?access_token={mapboxToken}', {
    mapboxToken: 'pk.eyJ1IjoiYWxsaXdhbGsiLCJhIjoiY2ppYWo4bnZ4MTd1cjN2bXJyNmdkamVwaSJ9.9liZwOLsK2gpRS4JEgJa2g',
    maxZoom: 18,
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
      '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
      'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    id: 'mapbox.streets'
  }).addTo(newMap);

  updateRestaurants();
}
/* window.initMap = () => {
  let loc = {
    lat: 40.722216,
    lng: -73.987501
  };
  self.map = new google.maps.Map(document.getElementById('map'), {
    zoom: 12,
    center: loc,
    scrollwheel: false
  });
  updateRestaurants();
} */

/**
 * Update page and map for current restaurants.
 */
updateRestaurants = () => {
  const cSelect = document.getElementById('cuisines-select');
  const nSelect = document.getElementById('neighborhoods-select');

  const cIndex = cSelect.selectedIndex;
  const nIndex = nSelect.selectedIndex;

  const cuisine = cSelect[cIndex].value;
  const neighborhood = nSelect[nIndex].value;

  DBHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, (error, restaurants) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      resetRestaurants(restaurants);
      fillRestaurantsHTML();
    }
  })
}

/**
 * Clear current restaurants, their HTML and remove their map markers.
 */
resetRestaurants = (restaurants) => {
  // Remove all restaurants
  self.restaurants = [];
  const ul = document.getElementById('restaurants-list');
  ul.innerHTML = '';

  // Remove all map markers
  self.markers.forEach(m => m.setMap(null));
  self.markers = [];
  self.restaurants = restaurants;
}

/**
 * Create all restaurants HTML and add them to the webpage.
 */
fillRestaurantsHTML = (restaurants = self.restaurants) => {
  const ul = document.getElementById('restaurants-list');
  restaurants.forEach(restaurant => {
    ul.append(createRestaurantHTML(restaurant));
  });
  addMarkersToMap();
}

/**
 * Create restaurant HTML.
 */
createRestaurantHTML = (restaurant) => {
  const li = document.createElement('li');

  const image = document.createElement('img');
  image.className = 'restaurant-img';
  image.src = DBHelper.imageUrlForRestaurant(restaurant);
  image.alt = "Interior photograph of " + restaurant.name ;
  li.append(image);

  const name = document.createElement('h3');
  name.innerHTML = restaurant.name;
  li.append(name);

  // Originally found via: https://www.youtube.com/watch?v=XbCwxeCqxw4 -- between 10/23 - 11/13 2018
  const favorite = document.createElement('button');
  favorite.innerHTML = '❤';
  favorite.className = 'fav_btn';

  favorite.onclick = function(){
    /* Evaluate favorite. If true or "true", set to false; Else, it must be false so set to true
    if/else updates :https://github.com/fgiorgio/mws-restaurant-stage-1/blob/master/js/main.js 11/18/2018*/
    if (restaurant.is_favorite == true){
      restaurant.is_favorite = false;
    } else if (restaurant.is_favorite == "true"){
      restaurant.is_favorite = false;
    } else {
      restaurant.is_favorite = true;
    }
    /* take restaurant id and send value */
    DBHelper.updateFavoriteStatus(restaurant.id, restaurant.is_favorite);
    changeFavit(favorite, restaurant.is_favorite);
  };

  /* Evaluate favorite. If true or "true", it is true; Else, it must be false it is false */
  if(restaurant.is_favorite == true){
    restaurant.is_favorite = true;
  } else if(restaurant.is_favorite == "true"){
    restaurant.is_favorite = true;
  } else {
    restaurant.is_favorite = false;
  }
  changeFavit(favorite, restaurant.is_favorite);
  li.append(favorite);

  const neighborhood = document.createElement('p');
  neighborhood.innerHTML = restaurant.neighborhood;
  li.append(neighborhood);

  const address = document.createElement('p');
  address.innerHTML = restaurant.address;
  li.append(address);

  const more = document.createElement('a');
  more.className = 'button'
  more.innerHTML = 'View Details';
  more.href = DBHelper.urlForRestaurant(restaurant);
  li.append(more)
  return li;

}

// This is only a toggle
// Based on...https://www.youtube.com/watch?v=XbCwxeCqxw4 - between 10/23 - 11/13 2018
changeFavit = (btn, fav) => {
  if(!fav){
    console.log("Not a favit! Look now it's grey.");
    btn.classList.remove('fav_yes');
    btn.classList.add('fav_no');
    btn.setAttribute('aria-label', 'Click to toggle as favorite');
    console.log("------ Not a favorite");
  } else {
    console.log("Found a Favit! Look now it's red.");
    btn.classList.add('fav_yes');
    btn.classList.remove('fav_no');
    btn.setAttribute('aria-label', 'Click to remove favorite');
    console.log("****** Toggled as favorite");
  }
}
//check for online status
DBHelper.isOnline();


/**
 * Add markers for current restaurants to the map.
 */
addMarkersToMap = (restaurants = self.restaurants) => {
  restaurants.forEach(restaurant => {
    // Add marker to the map
    const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.newMap);
    marker.on("click", onClick);
    function onClick() {
      window.location.href = marker.options.url;
    }
  });
}

// changeFavStatus = (restaurant = self.restaurants) => {
//   restaurants.forEach(restaurant => {
//     document.getElementById('``');
//
//     if(restaurant.is_favorite == "false"){
//       favorite.classList.add('fav_no');
//     } else {
//       favorite.classList.add('fav_yes');
//     }
//   }
//   const ul = document.getElementById('reviews-list');
//
//   reviews.forEach(review => {
//     ul.appendChild(createReviewHTML(review));
//   });
//   container.appendChild(ul);
//   }
