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
   * トーストを消す
   */
  var close = function() {
    $scope.message = '';
    if (id != null) {
      $timeout.cancel(id);
      id = null;
    }
  };
  $scope.close = close;

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

    if (timeout > 0) {
      id = $timeout(close, timeout);
    }
  });
}]);
