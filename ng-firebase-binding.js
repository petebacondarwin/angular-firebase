angular.module('ng-firebase')

// This service binds the scope expression to a firebase reference url.
// It returns a promise for the initialized reference
.factory('firebaseBinding', ['$timeout', '$q', '$parse', 'Firebase', function($timeout, $q, $parse, Firebase) {
  return function(referenceUrl, scope, expression) {
    var getObj = $parse(expression);
    var setObj = getObj.assign;
    if ( !setObj ) {
      throw new Error('expression ' + expression + 'must be assignable');
    }
    var reference = new Firebase(referenceUrl);
    var deferred = $q.defer();
    reference.once('value', function(data) {
      setObj(scope, data.val());
      deferred.resolve(getObj(scope));
    });
    reference.on('value', function(data) {
      $timeout(function() {
        setObj(scope, data.val());
      });
    });
    scope.$watch(getObj, function(value) {
      reference.set(value);
    },true);
    return deferred.promise;
  };
}])

// This service binds the scope expression to a firebase reference url.
// There is no promise provided
.factory('firebaseBindingSimple', ['$timeout', '$parse', 'Firebase', function($timeout, $parse, Firebase) {
  return function(referenceUrl, scope, expression) {
    var getObj = $parse(expression);
    var setObj = getObj.assign;
    if ( !setObj ) {
      throw new Error('expression ' + expression + 'must be assignable');
    }
    var reference = new Firebase(referenceUrl);
    reference.on('value', function(data) {
      $timeout(function() {
        setObj(scope, data.val());
      });
    });
    scope.$watch(getObj, function(value) {
      reference.set(value);
    },true);
  };
}]);