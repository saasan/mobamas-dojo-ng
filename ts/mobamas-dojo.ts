///<reference path='../typings/angularjs/angular.d.ts'/>
var mobamasDojo = angular.module('mobamasDojo', ['LocalStorageModule']);

// リクエストヘッダーにX-Requested-Withを付ける
mobamasDojo.config(function($httpProvider) {
  $httpProvider.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
});

mobamasDojo.config(function(localStorageServiceProvider) {
  localStorageServiceProvider.setPrefix('mobamas-dojo');
});

mobamasDojo.controller('MainController', ['$scope', '$http', 'localStorageService', function($scope, $http, localStorageService) {
  'use strict';

  // ランク表示用文字列
  $scope.RANK = [ 'F', 'E', 'D', 'C', 'B', 'A', 'S', 'SS', 'S3', 'S4', 'S5' ];
  // ソート順用データ
  $scope.ORDER_BY = [
    { name: 'ランク順', value: ['-rank', '-lv'] },
    { name: 'レベル順', value: ['-lv', '-rank'] }
  ];

  // 表示の設定
  $scope.viewSettings = {
    limitTo: 30,
    orderBy: $scope.ORDER_BY[0],
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
  $scope.dojoFilter = function(dojo) {
    // 非表示設定
    if (dojo.hidden) {
      return false;
    }

    var rank = ($scope.viewSettings.rank.min <= dojo.rank) &&
               ($scope.viewSettings.rank.max < 0 || dojo.rank <= $scope.viewSettings.rank.max);
    var level = ($scope.viewSettings.level.min <= dojo.lv) &&
                ($scope.viewSettings.level.max < 0 || dojo.lv <= $scope.viewSettings.level.max);
    var defense = true;

    // 最小値/最大値が無制限の場合はminDefenseがnullでも表示する
    if ($scope.viewSettings.defense.min > 0) {
      defense = defense && dojo.minDefense != null && $scope.viewSettings.defense.min <= dojo.minDefense;
    }
    if ($scope.viewSettings.defense.max > 0) {
      defense = defense && dojo.minDefense != null && dojo.minDefense <= $scope.viewSettings.defense.max;
    }

    return rank && level && defense;
  };

  // 初期化
  $scope.init = function() {
    $scope.status = '道場データ読み込み中...';
    $http.get('http://mobamas-dojo-server.herokuapp.com/dojos').
      success(function(data, status, headers, config) {
        // 最終更新日時
        $scope.lastUpdate = data.lastUpdate;
        // 道場リスト
        $scope.dojos = data.dojos;

        $scope.status = '道場データ読み込み完了！';
      }).
      error(function(data, status, headers, config) {
        $scope.status = 'エラー！ ステータスコード: ' + status + ' データ: ' + (data || '(無し)');
      });
  };

  // 道場のリンククリック時の処理
  $scope.onClickDojoLink = function(dojo) {
    if (dojo.visited) {
      dojo.visited++;
    }
    else {
      dojo.visited = 1;
    }
  };

  // 道場の非表示ボタンクリック時の処理
  $scope.onClickHideDojo = function(dojo) {
    dojo.hidden = true;
  };
}]);
