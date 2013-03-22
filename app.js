angular.module('app', ['ng-firebase'])
.controller('App', function($scope, firebaseCollection) {
  $scope.books = firebaseCollection('https://angular.firebaseio.com/books');
});