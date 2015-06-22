/* global mobamasDojo */

mobamasDojo.controller('SettingsController',
    ['$scope', '$localStorage', 'config', 'defaultSettings', 'toast',
    function($scope, $localStorage, config, defaultSettings, toast) {

  'use strict';

  // ストレージから設定を読み込む
  $scope.$storage = $localStorage.$default(angular.copy(defaultSettings));

  $scope.dataOutput = angular.toJson($scope.$storage);

  // メニューのデータを設定
  $scope.mobamasMenu = config.mobamasMenu;

  $scope.resetVisited = function() {
    $scope.$storage.visited = {};
    $scope.$storage.lastVisited = null;
    toast.show('訪問回数を初期化しました。');
  };

  $scope.resetHiddenDojos = function() {
    $scope.$storage.hidden = {};
    toast.show('道場の非表示設定を初期化しました。');
  };

  $scope.resetAll = function() {
    $scope.$storage.$reset(defaultSettings);
    toast.show('全ての設定を初期化しました。');
  };

  $scope.inputData = function() {
    var json = $scope.dataOutput;

    if (json.length === 0) {
      toast.show('データが入力されていません。', 'error');
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
      toast.show(e.message, 'error', 0);
      return;
    }

    // 設定に反映
    $scope.$storage.$reset(newSettings);

    toast.show('データを入力しました。');
  };
}]);
