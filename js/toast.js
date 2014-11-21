/* global mobamasDojo */

mobamasDojo.controller('ToastController', ['$scope', '$timeout', function($scope, $timeout) {
  'use strict';

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
  var close = function() {
    $scope.message = '';
    if (id != null) {
      $scope.callback = null;
      $timeout.cancel(id);
      id = null;
    }
  };
  $scope.close = close;

  /**
   * クリック時にcallbackを呼ぶ
   */
  $scope.onclick = function() {
    if ($scope.callback) {
      $scope.callback();
    }

    close();
  };

  /**
   * トーストを表示するイベント
   */
  $scope.$on('showToast', function(event, data) {
    close();

    $scope.class = data.class || '';
    $scope.message = data.message;

    var timeout = data.timeout;

    if (timeout == null) {
      timeout = 3000;
    }

    $scope.callback = data.callback || null;

    if (timeout > 0) {
      id = $timeout(close, timeout);
    }
  });
}]);
