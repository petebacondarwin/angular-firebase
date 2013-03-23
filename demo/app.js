angular.module('app', ['ng-firebase'])
.controller('App', function($scope, firebaseCollection, firebaseBinding) {
  $scope.books = firebaseCollection('https://angular.firebaseio.com/books');
  $scope.userInfo = {
    firstName: 'Jo', lastName: 'Bloggs'
  };
  var userPromise = firebaseBinding('https://angular.firebaseio.com/userInfo', $scope, 'userInfo');
  userPromise.then(function(userInfo) {
    console.log(userInfo, userInfo.firstName, userInfo.lastName);
  });
});