angular.module('ng-firebase')

.factory('firebaseCollection', ['$timeout', 'Firebase', function($timeout, Firebase) {

  /**
   * @class item in the collection
   * @param {DataSnapshot} ref      reference to the firebase data snapshot for this item
   * @param {int} index             position of the item in the collection
   *
   * @property {DataSnapshot} $ref  reference to the firebase data snapshot for this item
   * @property {String} $id         unique identifier for this item within the collection
   * @property {int} $index         position of the item in the collection
   */
  function FirebaseItem(ref, index) {
    this.$ref = ref.ref();
    this.$id = ref.name();
    this.$index = index;
    angular.extend(this, ref.val());
  }

  /**
   * create a firebaseCollection
   * @param  {String} collectionUrl The firebase url where the collection lives
   * @return {Array}                An array that will hold the items in the collection
   */
  return function(collectionUrl) {
    var collection = [];
    var indexes = {};
    var collectionRef = new Firebase(collectionUrl);

    function getIndex(prevId) {
      return prevId ? indexes[prevId] + 1 : 0;
    }
    
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

    function updateChild (index, item) {
      collection[index] = item;
      console.log('changed: ', index, item);
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

    collectionRef.on('child_added', function(data, prevId) {
      $timeout(function() {
        var index = getIndex(prevId);
        addChild(index, new FirebaseItem(data, index));
        updateIndexes(index);
      });
    });

    collectionRef.on('child_removed', function(data) {
      $timeout(function() {
        var id = data.name();
        removeChild(id);
        updateIndexes(indexes[id]);
      });
    });

    collectionRef.on('child_changed', function(data, prevId) {
      $timeout(function() {
        var index = indexes[data.name()];
        var newIndex = getIndex(prevId);
        var item = new FirebaseItem(data, index);

        updateChild(index, item);

        if ( newIndex !== index ) {
          moveChild(index, newIndex, item);
        }

      });
    });

    collectionRef.on('child_moved', function(ref, prevId) {
      $timeout(function() {
        var oldIndex = indexes[ref.name()];
        var newIndex = getIndex(prevId);
        var item = collection[oldIndex];

        moveChild(oldIndex, newIndex, item);
      });
    });

    collection.$add = function(item) {
      collectionRef.push(item);
    };
    collection.$remove = function(itemOrId) {
      var item = angular.isString(itemOrId) ? collection[itemOrId] : itemOrId;
      item.$ref.remove();
    };

    collection.$update = function(itemOrId) {
      var item = angular.isString(itemOrId) ? collection[itemOrId] : itemOrId;
      var copy = {};
      angular.forEach(item, function(value, key) {
        if (key.indexOf('$') !== 0) {
          copy[key] = value;
        }
      });
      item.$ref.set(copy);
    };

    return collection;
  };
}]);