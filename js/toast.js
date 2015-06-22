/* global mobamasDojo */

(function() {
  'use strict';

  // toastを出す為のサービス
  mobamasDojo.factory('toast', ['$rootScope', function($rootScope) {
    return {
      show: function(message, classString, timeout, callback) {
        var data = {
          message: message,
          class: classString,
          timeout: timeout,
          callback: callback
        };

        $rootScope.$broadcast('showToast', data);
      }
    };
  }]);

  mobamasDojo.controller('ToastController', ['$scope', '$timeout', function($scope, $timeout) {
    /**
     * トーストの表示状態
     */
    $scope.visible = false;

    /**
     * トーストのメッセージ
     */
    $scope.message = '';

    /**
     * トースト用タイマーID
     */
    var id = null;

    /**
     * クリック時に呼ばれる関数
     */
    $scope.callback = null;

    /**
     * トーストを消す
     */
    $scope.close = function() {
      $scope.visible = false;

      if (id != null) {
        $scope.callback = null;
        $timeout.cancel(id);
        id = null;
      }
    };

    /**
     * クリック時にcallbackを呼ぶ
     */
    $scope.onclick = function() {
      if ($scope.callback) {
        $scope.callback();
      }

      $scope.close();
    };

    /**
     * トーストを表示するイベント
     */
    $scope.$on('showToast', function(event, data) {
      $scope.close();

      $scope.class = data.class || '';
      $scope.message = data.message;

      if ($scope.message == null || $scope.message.length === 0) {
        $scope.message = '';
      }

      var timeout = data.timeout;

      if (timeout == null) {
        timeout = 3000;
      }

      $scope.callback = data.callback || null;

      if (timeout > 0) {
        id = $timeout($scope.close, timeout);
      }

      $scope.visible = true;
    });
  }]);
})();
