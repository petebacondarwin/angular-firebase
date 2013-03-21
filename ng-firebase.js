angular.module('ng-firebase', [])

.factory('firebaseCollection', function($timeout) {

  /**
   * @class item in the collection
   * @param {DataSnapshot} ref      reference to the firebase data snapshot for this item
   * @param {int} index             position of the item in the collection
   *
   * @property {DataSnapshot} $ref  reference to the firebase data snapshot for this item
   * @property {string} $id         unique identifier for this item within the collection
   * @property {int} $index         position of the item in the collection
   */
  function FirebaseItem(ref, index) {
    this.$ref = ref.ref();
    this.$id = ref.name();
    this.$index = index;
    angular.extend(this, ref.val());
  }

  return function(collectionUrl) {
    var collection = [];
    var indexes = {};
    var collectionRef = new Firebase(collectionUrl);
    
    function addChild(index, item) {
      indexes[item.$id] = index;
      collection.splice(index,0,item);
      console.log('added: ', index, item);
    }

    function removeChild(id) {
      var index = indexes[id];

      // Remove the item from the collection
      collection.splice(index, 1);
      indexes[id] = undefined;

      console.log('removed: ', id);
    }

    function moveChild (from, to, item) {
      collection.splice(from, 1);
      collection.splice(to, 0, item);
      updateIndexes(from, to);
      console.log('moved: ', from, ' -> ', to, item);
    }

    function updateIndexes(from, to) {
      var length = collection.length;
      to = to || length;
      if ( to > length ) { to = length; }
      for(index = from; index < to; index++) {
        var item = collection[index];
        item.$index = indexes[item.$id] = index;
      }
    }

    collectionRef.on('child_added', function(ref, prevId) {
      $timeout(function() {
        var index = prevId ? indexes[prevId] + 1 : 0;
        var item = new FirebaseItem(ref, index);

        addChild(index, item);
        updateIndexes(index);
      });
    });

    collectionRef.on('child_removed', function(ref) {
      $timeout(function() {
        var id = ref.name();
        var index = indexes[id];
        removeChild(id);
        updateIndexes(index);
      });
    });

    collectionRef.on('child_changed', function(ref, prevId) {
      $timeout(function() {
        // Update item
        var index = indexes[ref.name()];
        var item = new FirebaseItem(ref, index);
        collection[index] = item;

        // Do we need to move the item?
        var newIndex = prevId ? indexes[prevId] + 1 : 0;
        if ( newIndex !== index ) {
          moveChild(index, newIndex, item);
        }

        console.log('changed: ', index, item);
      });
    });

    collectionRef.on('child_moved', function(ref, prevId) {
      $timeout(function() {
        var oldIndex = indexes[ref.name()];
        var newIndex = prevId ? indexes[prevId] + 1 : 0;
        var item = collection[oldIndex];

        moveChild(oldIndex, newIndex, item);
      });
    });

    collection.$addItem = function(item) {
      collectionRef.push(item);
    };
    collection.$removeItem = function(itemOrId) {
      var item = angular.isString(itemOrId) ? collection[itemOrId] : itemOrId;
      item.$ref.remove();
    };

    collection.$updateItem = function(itemOrId) {
      var item = angular.isString(itemOrId) ? collection[itemOrId] : itemOrId;
    };

    return collection;
  };
});