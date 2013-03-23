angular.module('ng-firebase')

.factory('firebaseBinding', ['$timeout', '$q', 'Firebase', function($timeout, $q, Firebase) {
  return function(referenceUrl, scope, property) {
    var reference = new Firebase(referenceUrl);
    var deferred = $q.defer();
    reference.once('value', function(data) {
      scope[property] = data.val();
      deferred.resolve(scope[property]);
    });
    reference.on('value', function(data) {
      $timeout(function() {
        scope[property] = data.val();
      });
    });
    scope.$watch(property, function(value) {
      reference.set(value);
    },true);
    return deferred.promise;
  };
}])

.factory('firebaseBindingSimple', ['$timeout', 'Firebase', function($timeout, Firebase) {
  return function(referenceUrl, scope, property) {
    var reference = new Firebase(referenceUrl);
    reference.on('value', function(data) {
      $timeout(function() {
        scope[property] = data.val();
      });
    });
    scope.$watch(property, function(value) {
      reference.set(value);
    },true);
  };
}]);