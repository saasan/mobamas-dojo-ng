'use strict';

angular.module('dojoMain', [])
  .controller('MainController', ['$scope','$http', function($scope, $http) {
    $scope.$on('$viewContentLoaded', function() {
      console.log('moge');
    });
    $scope.update = function() {
      $http.get('http://mobamas-dojo-server.herokuapp.com/dojos').
        success(function(data, status, headers, config) {
          $scope.message = 'updated!';
          $scope.dojos = data.dojos;
        }).
        error(function(data, status, headers, config) {
        });
      console.log('hoge');
      $scope.message = 'hoge';
    };
  }]);
console.log('fuga');
