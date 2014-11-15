/* global mobamasDojo */

mobamasDojo.controller('SettingsController', ['$rootScope', '$scope', '$window', '$localStorage', function($rootScope, $scope, $window, $localStorage) {
  'use strict';

  /**
   * トーストを表示する
   */
  var showToast = function(message) {
    var data = {
      message: message,
      timeout: 3000
    };
    $rootScope.$broadcast('showToast', data);
  };

  // ストレージから設定を読み込む
  $scope.$storage = $localStorage.$default(angular.copy(defaultSettings));

  $scope.dataOutput = JSON.stringify($scope.$storage);

  $scope.resetVisited = function() {
    $scope.$storage.visited = {};
    showToast('訪問回数を初期化しました。');
  };

  $scope.resetHiddenDojos = function() {
    $scope.$storage.hidden = {};
    showToast('道場の非表示設定を初期化しました。');
  };

  $scope.resetAll = function() {
    $scope.$storage.$reset(defaultSettings);
    showToast('全ての設定を初期化しました。');
  };

  $scope.inputData = function() {
  };

  $scope.clearDataOutput = function() {
    $scope.dataOutput = '';
  };
}]);
