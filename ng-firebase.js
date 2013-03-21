angular.module('ng-firebase', [])

.factory('firebaseCollection', function($rootScope) {
  function getIndex(collection, $id) {
    for(var i=0, ii=collection.length; i<ii; i++) {
      if ( collection[i].$id === $id ) {
        return i;
      }
    }
    return -1;
  }

  return function(collectionUrl) {
    var collection = [];
    var collectionRef = new Firebase(collectionUrl);
    
    collectionRef.on('child_added', function(data, prevId) {
      var item = data.val();
      item.$id = data.name();
      $rootScope.$apply(function() {
        var i = getIndex(collection, prevId)+1;
        collection.splice(i,0,item);
        console.log('added: ',i, collection[i]);
      });
    });

    collectionRef.on('child_removed', function(data) {
      $rootScope.$apply(function() {
        var i = getIndex(collection, data.name());
        console.log('removed: ',i, collection[i]);
        collection.splice(i,1);
      });
    });

    collectionRef.on('child_changed', function(data) {
      $rootScope.$apply(function() {
        var i = getIndex(collection, data.name());
        collection[i] = data.val();
        console.log('changed: ',i, collection[i]);
      });
    });

    collectionRef.on('child_moved', function(data, prevId) {
      $rootScope.$apply(function() {
        var item = data.val();
        item.$id = data.name();
        var from = getIndex(collection, data.name());
        var to = getIndex(collection, prevId) + 1;
        collection.splice(from,1);
        collection.splice(to,0, item);
        console.log('moved: ', from, ' -> ', to, item);
      });
    });

    return collection;
  };
})

.controller('App', function($scope, firebaseCollection) {
  $scope.books = firebaseCollection('https://angular.firebaseio.com/books');
});