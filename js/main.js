var mobamasDojo = angular.module('mobamasDojo', []);

// リクエストヘッダーにX-Requested-Withを付ける
mobamasDojo.config(function($httpProvider) {
  $httpProvider.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
});

mobamasDojo.controller('MainController', ['$scope','$http', function($scope, $http) {
  'use strict';

  // 道場リストの元データ
  $scope.dojosMaster = {};

  // 表示の設定
  $scope.viewSettings = {
    limitTo: 30,
    orderBy: '-rank',
    rank: {
      min: 0,
      max: -1
    },
    level: {
      min: 0,
      max: -1
    },
    defense: {
      min: 0,
      max: -1
    }
  };

  // 道場フィルター
  $scope.rangeFilter = function(input) {
    var rank = ($scope.viewSettings.rank.min <= input.rank) && ($scope.viewSettings.rank.max < 0 || input.rank <= $scope.viewSettings.rank.max);
    var level = ($scope.viewSettings.level.min <= input.lv) && ($scope.viewSettings.level.max < 0 || input.lv <= $scope.viewSettings.level.max);
    var defense = true;

    // 最小値/最大値が無制限の場合はminDefenseがnullでも表示する
    if ($scope.viewSettings.defense.min > 0) {
      defense = defense && input.minDefense != null && $scope.viewSettings.defense.min <= input.minDefense;
    }
    if ($scope.viewSettings.defense.max > 0) {
      defense = defense && input.minDefense != null && input.minDefense <= $scope.viewSettings.defense.max;
    }

    return rank && level && defense;
  };

  // 初期化
  $scope.init = function() {
    $http.get('http://mobamas-dojo-server.herokuapp.com/dojos').
      success(function(data, status, headers, config) {
        $scope.message = 'updated!';
        $scope.lastUpdate = data.lastUpdate;
        $scope.dojosMaster = angular.copy(data.dojos);
        $scope.dojos = angular.copy(data.dojos);
      }).
      error(function(data, status, headers, config) {
        $scope.message = 'error!';
      });
  };
}]);
