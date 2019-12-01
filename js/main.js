/* global mobamasDojo */

mobamasDojo.controller('MainController',
    ['$scope', '$http', '$localStorage', '$window', 'config', 'defaultSettings', 'toast', 'util', 'birthday',
    function($scope, $http, $localStorage, $window, config, defaultSettings, toast, util, birthday) {

  'use strict';

  // ストレージから設定を読み込む
  $scope.$storage = $localStorage.$default(angular.copy(defaultSettings));

  // UI用データを設定
  $scope.ui = config.ui;

  // 誕生日を表示する
  $scope.birthdayToday = birthday.getToday();
  $scope.birthdayNext = birthday.getNext();

  // ソート順用データ
  $scope.ORDER_BY = [
    ['-rank', '-lv'],
    ['-lv', '-rank']
  ];

  /**
   * データ取得正常終了時の処理
   * @param {object} data サーバーから取得したデータ
   */
  function getDataSuccess(response) {
    // 道場データが取得できたか確認
    if (response && response.data &&  response.data.length > 0) {
      // 道場を表示
      $scope.dojos = util.createDojos(response.data);

      // 道場データのキャッシュを保存
      $window.localStorage.setItem(config.cacheKey, angular.toJson(response.data));

      toast.show('道場データ読み込み完了！');
    }
    else {
      getDataError();
    }
  }

  /**
   * データ取得異常終了時の処理
   */
  function getDataError() {
    // キャッシュがあるか確認
    var json = $window.localStorage.getItem(config.cacheKey);
    if (json) {
      // 道場を表示
      var dataCache = angular.fromJson(json);
      $scope.dojos = util.createDojos(dataCache);

      toast.show('エラー: 道場データを取得できませんでした。前回取得した道場データを使用します。', 'error', 0);
    }
    else {
      toast.show('エラー: 道場データを取得できませんでした。', 'error', 0);
    }
  }

  /**
   * 初期化
   */
  function init() {
    // 現在の日時のミリ秒
    var now = Date.now();
    // 訪問回数のリセットが必要か
    var needReset = util.betweenRange(util.getResetTime(), $scope.$storage.lastTime, now);

    // 前回のアクセスから今回の間でリセット時間を跨いでいたら訪問回数を初期化
    if (needReset) {
      // 訪問回数
      $scope.$storage.visited = {};
      // 最後に訪問した道場
      $scope.$storage.lastVisited = null;
    }

    // アクセス日時を保存
    $scope.$storage.lastTime = now;

    toast.show('道場データ読み込み中...');

    // 道場データを取得する
    var url = (config.debug ? config.development.url : config.url);
    $http.get(url).then(getDataSuccess, getDataError);
  }

  /**
   * 道場が訪問済みであることを示すCSSクラスを取得する
   */
  function getDojoVisitedClass(dojo) {
    var visited = 0;
    var classes = {
      1: ['', 'error'],
      3: ['', 'success', 'warning', 'error']
    };

    if ($scope.$storage.visited[dojo.id] != null) {
       visited = $scope.$storage.visited[dojo.id];
    }

    if (visited > $scope.$storage.visitedMax) {
      visited = $scope.$storage.visitedMax;
    }

    return classes[$scope.$storage.visitedMax][visited];
  }

  /**
   * 道場のCSSクラス
   */
  $scope.dojoClass = function(dojo) {
    var classes = [getDojoVisitedClass(dojo), (dojo.paused ? 'paused' : '')];
    return classes.join(' ');
  };

  /**
   * 道場フィルター
   */
  $scope.dojoFilter = function(dojo) {
    // 非表示設定
    if ($scope.$storage.hidden[dojo.id]) {
      return false;
    }

    // 訪問済の道場を表示しない
    if ($scope.$storage.autoHide) {
      // 訪問回数が設定値以上
      var visited = ($scope.$storage.visited[dojo.id] != null && $scope.$storage.visited[dojo.id] >= $scope.$storage.visitedMax);
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
    var paused = !($scope.$storage.hidePausedDojo && dojo.paused);

    // 最小値/最大値が無制限の場合はminDefenseがnullでも表示する
    if ($scope.$storage.view.defenseRange.min > 0) {
      defense = defense && dojo.minDefense != null && $scope.$storage.view.defenseRange.min <= dojo.minDefense;
    }
    if ($scope.$storage.view.defenseRange.max > 0) {
      defense = defense && dojo.minDefense != null && dojo.minDefense <= $scope.$storage.view.defenseRange.max;
    }

    return rank && level && defense && paused;
  };

  /**
   * 道場のリンククリック時の処理
   */
  $scope.onClickDojoLink = function(dojo) {
    // トーストクリック時に元に戻すコールバック関数を作成する
    var generateUndo = function(id, oldValue, lastVisited) {
      var undo = function() {
        if (oldValue) {
          $scope.$storage.visited[id] = oldValue;
        }
        else {
          delete $scope.$storage.visited[id];
        }

        $scope.$storage.lastVisited = lastVisited || null;
      };

      return undo;
    };

    var message = '元に戻す: 「' + dojo.lv + ' ' + config.ui.rank[dojo.rank] + ' ' + dojo.unit + '」の訪問';
    var undo = generateUndo(dojo.id, $scope.$storage.visited[dojo.id], $scope.$storage.lastVisited);
    toast.show(message, '', $scope.$storage.undoTimeout, undo);

    // 訪問回数のインクリメント
    if ($scope.$storage.visited[dojo.id]) {
      $scope.$storage.visited[dojo.id]++;
    }
    else {
      $scope.$storage.visited[dojo.id] = 1;
    }

    // 最後に訪問した道場
    $scope.$storage.lastVisited = dojo.id;
  };

  /**
   * 道場の非表示ボタンクリック時の処理
   */
  $scope.onClickHideDojo = function(dojo) {
    // トーストクリック時に元に戻すコールバック関数を作成する
    var generateUndo = function(id, oldValue) {
      var undo = function() {
        if (oldValue) {
          $scope.$storage.hidden[id] = oldValue;
        }
        else {
          delete $scope.$storage.hidden[id];
        }
      };

      return undo;
    };

    var message = '元に戻す: 「' + dojo.lv + ' ' + config.ui.rank[dojo.rank] + ' ' + dojo.unit + '」の非表示';
    var undo = generateUndo(dojo.id, $scope.$storage.hidden[dojo.id]);
    toast.show(message, '', $scope.$storage.undoTimeout, undo);

    // 非表示に設定
    $scope.$storage.hidden[dojo.id] = true;
  };

  // 初期化
  init();
}]);
