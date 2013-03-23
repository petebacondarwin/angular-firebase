# AngularJS &amp; Firebase

This project contains [AngularJS](http://angularjs.org) services to allow you to store your data in a [Firebase](www.firebase.com) reference.

# Installation

We use [bower](http://twitter.github.com/bower/) for dependency management.  Add

    dependencies: {
        "angular-firebase": "0.0.1"
    }

To your `components.json` file. Then run

    bower install

This will copy the angular-firebase and angularjs files into your `components` folder. Load the script files in your application:

    <script src="https://cdn.firebase.com/v0/firebase.js"></script>
    <script type="text/javascript" src="components/angular/angular.js"></script>
    <script type="text/javascript" src="components/angular-firebase/ng-firebase.js"></script>
    <script type="text/javascript" src="components/angular-firebase/ng-firebase-collection.js"></script>
    <script type="text/javascript" src="components/angular-firebase/ng-firebase-binding.js"></script>

(Currently there is no Bower package registered for firebase so you are best getting it from their CDN)

# Usage

## firebaseCollection

This service creates a collection object, similar to [ng-resource](http://docs.angularjs.org/api/ngResource.$resource) objects, which will automatically sync with a [Firebase List](https://www.firebase.com/docs/managing-lists.html).

    angular.module('app', ['ng-firebase'])
    .controller('App', function($scope, firebaseCollection, firebaseBinding) {
      $scope.books = firebaseCollection('https://angular.firebaseio.com/books');
    });

The books object on the scope is an array, containing each element in the list.  Each item in the array has additional properties: `$index`, `$id`, `$ref`.

The books object has additional methods to `$add(item)`, `$remove(itemOrId)` and `$update(item)` an item in the list.

## firebaseBinding

This service creates a single binding between an object on the scope and a Firebase reference.

    angular.module('app', ['ng-firebase'])
    .controller('App', function($scope, firebaseCollection, firebaseBinding) {
      var userPromise = firebaseBinding('https://angular.firebaseio.com/userInfo', $scope, 'userInfo');
      userPromise.then(function(userInfo) {
        console.log(userInfo, userInfo.firstName, userInfo.lastName);
      });
    });

The service returns a promise that will be resolved the first time the binding is initialized.  After that the object will be kept in synch whether updated remotely or on the scope.

# Running the Demo

You will need to install the dependent components (i.e. angularjs) using bower

    bower install

Then open the demo application in a browser

    demo/index.html
