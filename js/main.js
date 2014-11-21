/* global defaultSettings, Birthday, mobamasDojo */

// リクエストヘッダーにX-Requested-Withを付ける
mobamasDojo.config(['$httpProvider', function($httpProvider) {
  'use strict';
  $httpProvider.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
}]);

mobamasDojo.controller('MainController', ['$rootScope', '$scope', '$http', '$localStorage', function($rootScope, $scope, $http, $localStorage) {
  'use strict';

  // ストレージから設定を読み込む
  $scope.$storage = $localStorage.$default(angular.copy(defaultSettings));

  /** 道場をリセットする時間 */
  var RESET = {
    HOUR: 5,
    MINUTE: 0
  };
  /** トーストを表示する時間(ミリ秒) */
  var TOAST_TIME = 3000;

  /**
   * 誕生日を更新する
   */
  var updateBirthday = function() {
    var birthday = new Birthday();

    $scope.birthdayToday = birthday.getToday();
    $scope.birthdayNext = birthday.getNext();
  };

  /**
   * トーストを表示する
   */
  var showToast = function(message) {
    var data = {
      message: message,
      timeout: TOAST_TIME
    };
    $rootScope.$broadcast('showToast', data);
  };

  /**
   * 今日のリセット時間を取得する
   * @return {number} リセット時間をgetTime()でミリ秒にした値
   */
  var getResetTime = function() {
    var resetTime = new Date();
    resetTime.setHours(RESET.HOUR);
    resetTime.setMinutes(RESET.MINUTE);
    resetTime.setSeconds(0);
    resetTime.setMilliseconds(0);

    // 未来だったら1日前にする
    if (resetTime.getTime() > Date.now()) {
      resetTime.setDate(resetTime.getDate() - 1);
    }

    return resetTime.getTime();
  };

  /**
   * 値が範囲内か確認する
   * @param {number} value 調べる対象
   * @param {number} start 範囲開始値
   * @param {number} end 範囲終了値
   * @return {boolean} trueなら範囲内
   */
  var betweenRange = function(value, start, end) {
    return (start < value && value <= end);
  };

  /**
   * 保存されている訪問回数と最後に訪問した道場を初期化する
   */
  var resetVisited = function() {
    $scope.$storage.visited = {};
    $scope.$storage.lastVisited = null;
  };

  // ランク表示用文字列
  $scope.RANK = [ 'F', 'E', 'D', 'C', 'B', 'A', 'S', 'SS', 'S3', 'S4', 'S5' ];
  // ソート順用データ
  $scope.ORDER_BY = [
    ['-rank', '-lv'],
    ['-lv', '-rank']
  ];

  // 道場のCSSクラス
  $scope.dojoClass = function(dojo) {
    var visited = 0;
    var classes = {
      1: ['', 'error'],
      3: ['', 'success', 'warning', 'error']
    };

    if (dojo.visited != null) {
       visited = dojo.visited;
    }

    if (visited > $scope.$storage.visitedMax) {
      visited = $scope.$storage.visitedMax;
    }

    return classes[$scope.$storage.visitedMax][visited];
  };

  // 道場フィルター
  $scope.dojoFilter = function(dojo) {
    // 非表示設定
    if (dojo.hidden) {
      return false;
    }

    // 訪問済の道場を表示しない
    if ($scope.$storage.autoHide) {
      // 訪問回数が設定値以上
      var visited = (dojo.visited != null && dojo.visited >= $scope.$storage.visitedMax);
      // 最後に訪問した道場を残す設定 AND 最後に訪問した道場
      var keep = ($scope.$storage.keepLastVisited && $scope.$storage.lastVisited === dojo.id);

      if (visited && !keep) {
        return false;
      }
    }

    var rank = ($scope.$storage.view.rankRange.min <= dojo.rank) &&
               ($scope.$storage.view.rankRange.max < 0 || dojo.rank <= $scope.$storage.view.rankRange.max);
    var level = ($scope.$storage.view.levelRange.min <= dojo.lv) &&
                ($scope.$storage.view.levelRange.max < 0 || dojo.lv <= $scope.$storage.view.levelRange.max);
    var defense = true;

    // 最小値/最大値が無制限の場合はminDefenseがnullでも表示する
    if ($scope.$storage.view.defenseRange.min > 0) {
      defense = defense && dojo.minDefense != null && $scope.$storage.view.defenseRange.min <= dojo.minDefense;
    }
    if ($scope.$storage.view.defenseRange.max > 0) {
      defense = defense && dojo.minDefense != null && dojo.minDefense <= $scope.$storage.view.defenseRange.max;
    }

    return rank && level && defense;
  };

  // 初期化
  $scope.init = function() {
    updateBirthday();

    // 現在の日時
    var now = Date.now();
    // 訪問回数のリセットが必要か
    var needReset = betweenRange(getResetTime(), $scope.$storage.lastTime, now);

    // 前回のアクセスから今回の間でリセット時間を跨いでいたら訪問回数を初期化
    if (needReset) {
      resetVisited();
    }

    // アクセス日時を保存
    $scope.$storage.lastTime = now;

    showToast('道場データ読み込み中...');
    $http.get('http://mobamas-dojo-server.herokuapp.com/dojos').
      success(function(data) {
        // 最終更新日時
        $scope.lastUpdate = data.lastUpdate;

        // 訪問回数と非表示設定を復元
        data.dojos.forEach(function(dojo) {
          if (!needReset && $scope.$storage.visited[dojo.id]) {
            dojo.visited = $scope.$storage.visited[dojo.id];
          }
          if ($scope.$storage.hidden[dojo.id]) {
            dojo.hidden = true;
          }
        });

        // 道場リスト
        $scope.dojos = data.dojos;

        showToast('道場データ読み込み完了！');
      }).
      error(function(data, status) {
        showToast('エラー！ ステータスコード: ' + status + ' データ: ' + (data || '(無し)'));
      });
  };

  // 道場のリンククリック時の処理
  $scope.onClickDojoLink = function(dojo) {
    // 訪問回数のインクリメント
    if (dojo.visited) {
      dojo.visited++;
    }
    else {
      dojo.visited = 1;
    }
    $scope.$storage.visited[dojo.id] = dojo.visited;

    // 最後に訪問した道場
    $scope.$storage.lastVisited = dojo.id;
  };

  // 道場の非表示ボタンクリック時の処理
  $scope.onClickHideDojo = function(dojo) {
    $scope.$storage.hidden[dojo.id] = dojo.hidden = true;
  };
}]);
