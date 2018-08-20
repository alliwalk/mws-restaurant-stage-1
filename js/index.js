// if (!window.indexedDB){
//   alert();
// }

// let request = window.indexedDB.open("restDB", 1),
//   db,
//   tx,
//   store,
//   index;
// request.onupgradeneeded = function(event) {
//   let db = request.result,
//     store = db.createObjectStore("res_db", {
//       keyPath: 'res_ID'}),
//       index = store.createIndex("foodList", "res_name", {unique: true});
// }
// request.onerror = function(event){
//   console.log("There was an error: " + event.target.errorCode);
// };
// open.onsuccess = function(event){
//     db = request.result;
//     tx = db.transaction("res_db", "readwrite");
//     store = tx.objectStore("res_db");
//     index = store.index("foodList");
//
//     db.onerror = function(event) {
//       console.log("[error]" + event.target.errorCode);
//     }
//     store.put({res_ID: 1, res_name: "Robertas", rest_loc: "444 main", res_food: "Chinese", res_hours: "Today only"});
//
//     let q1 = store.get(1);
//     let qs = index.get("Robertas");
//
//     q1.onsuccess = function(){
//       console.log(q1.result);
//       console.log(q1.result.res_name);
//     };
//
//     qs.onsuccess = function(){
//       console.log(qs.result.res_name);
//     };
//
//     tx.oncomplete = function(){
//       db.close();
//     }
//   }


//  let idb = window.idb;
//
//
// // create index
//   var dbPromise = idb.open('restaurant-db', 1,
//     function(upgradeDB) {
//       if (!upgradeDb.createObjectStoreNames.contains('foodList')) {
//          upgradeDb.createObjectStore('foodList', {keyPath: 'id', autoIncrement: true});
//           console.log("ObjectStore: Created");
//        }
//    });

// dbPromise.then(function(db) {
//   var tx = db.transation('foodList');
//   var keyValStore
//
// })

// res_ID, res_name, rest_loc, res_food, res_hours
// window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB


// Create indexDB
// https://medium.com/@filipvitas/indexeddb-with-promises-and-async-await-3d047dddd313. 8/19
// (function() {
//   'use strict';
//
//   let idb = window.idb;
//   let open = indexedDB.open('restaurant-db', 1);
//
//   open.onupgradeneeded = function(){
//     let db = open.result;
//     db.createObjectStore('foodList', { autoIncrement: true});
//     console.log("ObjectStore: Created");
//   }
//
//   open.onsuccess = function(){
//     let db = open.result;
//     let tx = db.transaction('foodList', 'readwrite');
//     let store = tx.objectStore('foodList');
//     console.log("ObjectStore: Foodlist added");
//
//     store.put({ r_id:'123', r_name:'chelsea', res_loc: '', res_cuisine: "pizza", res_hours: "today"});
//     console.log("ObjectStore: Values added")
//
//     tx.oncomplete = function(){
//       db.close();
//     }
//   }
// })();
  //
  //

  //   var KeyValStore = upgradeDB.createObjectStore('resList');
    //   keyValStore.put('world', 'hello');
    // });
  //  Google PWA
  //   idb.open('restaurant-db', 1, function(upgradeDB) {
  //   console.log("making a new object store");
  //   if (!upgradeDb.createObjectStoreNames.contains('foodList')){
  //     upgradeDb.createObjectStore('foodList')
  //   }
  // });





// (function() {
//   'use strict';
//
//   //check for support
//   if (!('indexedDB' in window)) {
//     console.log('This browser doesn\'t support IndexedDB');
//     return;
//
//   var dbPromise = idb.open('restaurant-db', 1, function(upgradeDB) {
//     console.log("making a new object store");
//     if(!upgradeDb.createObjectStoreNames.contains('restaurant')){
//       upgradeDb.createObjectStore('restaurant')
//     }
    // var KeyValStore = upgradeDb.createObjectStore('keyval');
    // KeyValStore.put('world', 'hello');
//   });
// )();
// create data
