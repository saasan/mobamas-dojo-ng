/* global mobamasDojo */

mobamasDojo.controller('SettingsController', ['$rootScope', '$scope', '$window', '$localStorage', 'defaultSettings', 'showToast',
                                              function($rootScope, $scope, $window, $localStorage, defaultSettings, showToast) {
  'use strict';

  // ストレージから設定を読み込む
  $scope.$storage = $localStorage.$default(angular.copy(defaultSettings));

  $scope.dataOutput = angular.toJson($scope.$storage);

  $scope.resetVisited = function() {
    $scope.$storage.visited = {};
    $scope.$storage.lastVisited = null;
    showToast($rootScope, '訪問回数を初期化しました。');
  };

  $scope.resetHiddenDojos = function() {
    $scope.$storage.hidden = {};
    showToast($rootScope, '道場の非表示設定を初期化しました。');
  };

  $scope.resetAll = function() {
    $scope.$storage.$reset(defaultSettings);
    showToast($rootScope, '全ての設定を初期化しました。');
  };

  $scope.inputData = function() {
    var json = $scope.dataOutput;

    if (json.length === 0) {
      showToast($rootScope, 'データが入力されていません。', 'error');
      return;
    }

    // JSONの前後に不要な文字列があれば削除
    var f = json.indexOf('{');
    var l = json.lastIndexOf('}');
    if (f >= 0 && l >= 0) {
      json = json.substring(f, l + 1);
    }

    // JSONからオブジェクトへ
    var newSettings = null;
    try {
      newSettings = angular.fromJson(json);
    }
    catch (e) {
      showToast($rootScope, e.message, 'error', 0);
      return;
    }

    // 設定に反映
    $scope.$storage.$reset(newSettings);

    showToast($rootScope, 'データを入力しました。');
  };
}]);
