var mobamasDojo = angular.module('mobamasDojo', []);

mobamasDojo.config(function($httpProvider) {
  $httpProvider.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
});

mobamasDojo.controller('MainController', ['$scope','$http', function($scope, $http) {
  'use strict';

  $scope.numberOfShownDojos = 30;
  $scope.order = '-rank';
  $scope.rankMin = 0;
  $scope.rankMax = -1;
  $scope.levelMin = 0;
  $scope.levelMax = -1;
  $scope.defenseMin = 0;
  $scope.defenseMax = -1;

  $scope.rangeFilter = function(input) {
    var rank = ($scope.rankMin <= input.rank) && ($scope.rankMax < 0 || input.rank <= $scope.rankMax);
    var level = ($scope.levelMin <= input.lv) && ($scope.levelMax < 0 || input.lv <= $scope.levelMax);
    var defense = true;

    // 最小値/最大値が無制限の場合はminDefenseがnullでも表示する
    if ($scope.defenseMin > 0) {
      defense = defense && input.minDefense != null && $scope.defenseMin <= input.minDefense;
    }
    if ($scope.defenseMax > 0) {
      defense = defense && input.minDefense != null && input.minDefense <= $scope.defenseMax;
    }

    return rank && level && defense;
  };

  $scope.init = function() {
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
