/* global Birthday, mobamasDojo */

// リクエストヘッダーにX-Requested-Withを付ける
mobamasDojo.config(['$httpProvider', function($httpProvider) {
  'use strict';
  $httpProvider.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
}]);

mobamasDojo.controller('MainController', ['$rootScope', '$scope', '$http', '$localStorage', 'defaultSettings', '_showToast', function($rootScope, $scope, $http, $localStorage, defaultSettings, _showToast) {
  'use strict';

  // bindで_showToastの第1引数に$rootScopeを付けておく
  var showToast = _showToast.bind(null, $rootScope);

  /** 道場をリセットする時間 */
  var RESET = {
    HOUR: 5,
    MINUTE: 0
  };

  /**
   * 旧設定をインポートする
   * @return {object} 旧設定があればそれをdefaultSettingsに上書きしたオブジェクト、なければdefaultSettings
   */
  var importOldSettings = function() {
    var oldKey = 'mobamas-dojo_config';
    var newSettings = angular.copy(defaultSettings);
    var oldSettingsJson = window.localStorage.getItem(oldKey);

    if (!oldSettingsJson) {
      return newSettings;
    }

    var oldSettings = angular.fromJson(oldSettingsJson);

    // 訪問回数
    Object.keys(oldSettings.visited).forEach(function(key) {
      // 旧設定の訪問回数は各キー名の先頭に"id"が付いているので削除する
      var newKey = key.replace(/^id/, '');
      newSettings.visited[newKey] = oldSettings.visited[key];
    });

    // 非表示にした道場
    Object.keys(oldSettings.hide).forEach(function(key) {
      // 旧設定の非表示にした道場は各キー名の先頭に"id"が付いているので削除する
      var newKey = key.replace(/^id/, '');
      newSettings.hidden[newKey] = oldSettings.hide[key];
    });

    // 最後に訪問した道場
    if (oldSettings.lastVisited) {
      // 旧設定の最後に訪問した道場は値の先頭に"id"が付いているので削除し数値化する
      newSettings.lastVisited = parseInt(oldSettings.lastVisited.replace(/^id/, ''), 10);
    }

    // visitedMax回以上訪問した時、道場を訪問済とする
    newSettings.visitedMax = oldSettings.visitedMax;
    // 訪問済の道場を表示しない
    newSettings.autoHide = oldSettings.autoHide;
    // 最後に訪問した道場を残す
    newSettings.keepLastVisited = oldSettings.keepLastVisited;

    // 道場を別のタブ/同じタブで開く
    newSettings.dojoLinkTarget = (oldSettings.sameTab ? '_self' : '_blank');
    // 誕生日を表示する
    newSettings.showBirthday = !oldSettings.hideBirthday;
    // モバマスのメニューを表示する
    newSettings.showMobamasMenu = oldSettings.showMobamasMenu;

    // 旧設定を削除
    window.localStorage.removeItem(oldKey);

    return newSettings;
  };

  // ストレージから設定を読み込む
  $scope.$storage = $localStorage.$default(importOldSettings());

  /**
   * 誕生日を更新する
   */
  var updateBirthday = function() {
    var birthday = new Birthday();

    $scope.birthdayToday = birthday.getToday();
    $scope.birthdayNext = birthday.getNext();
  };

  /**
   * 前回のリセット時間を取得する
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

  // 道場のCSSクラス
  $scope.dojoClass = function(dojo) {
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
  };

  // 道場フィルター
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

    // 最小値/最大値が無制限の場合はminDefenseがnullでも表示する
    if ($scope.$storage.view.defenseRange.min > 0) {
      defense = defense && dojo.minDefense != null && $scope.$storage.view.defenseRange.min <= dojo.minDefense;
    }
    if ($scope.$storage.view.defenseRange.max > 0) {
      defense = defense && dojo.minDefense != null && dojo.minDefense <= $scope.$storage.view.defenseRange.max;
    }

    return rank && level && defense;
  };

  /**
   * Webサーバーからデータを取得する
   */
  var getDataFromWebServer = function() {
    $http.get('dojos.json').
      success(function(data) {
        // 最終更新日時
        $scope.lastUpdate = data.lastUpdate;
        // 道場リスト
        $scope.dojos = data.dojos;

        showToast('エラー: 道場データを取得できませんでした。' + data.lastUpdate + '時点の道場リストを使用します。', 'error', 0);
      }).
      error(function() {
        showToast('エラー: 道場データを取得できませんでした。', 'error', 0);
      });
  };

  /**
   * サーバーから取得したデータを$scopeに反映する
   * @param {object} data サーバーから取得したデータ
   */
  var setData = function(data) {
    // 最終更新日時
    $scope.lastUpdate = data.lastUpdate;
    // 道場リスト
    $scope.dojos = data.dojos;
  };

  /**
   * データ取得正常終了時の処理
   * @param {object} data サーバーから取得したデータ
   */
  var getDataSuccess = function(data) {
    var cacheKey = 'dataCache';

    // 道場データが含まれているか確認
    if (data.dojos && data.dojos.length > 0) {
      setData(data);

      // 道場データのキャッシュを保存
      window.localStorage.setItem(cacheKey, angular.toJson(data.dojos));

      showToast('道場データ読み込み完了！');
    }
    else {
      // キャッシュがあるか確認
      var json = window.localStorage.getItem(cacheKey);
      if (json) {
        var dataCache = angular.fromJson(json);
        setData(dataCache);

        showToast('エラー: サーバーから取得した道場データに道場が1件もありませんでした。' + dataCache.lastUpdate + '時点の道場リストを使用します。', 'error', 0);
      }
      else {
        getDataFromWebServer();
      }
    }
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

    var url = 'http://mobamas-dojo-server.herokuapp.com/dojos';

    if (location.hostname === 'localhost') {
      // デバッグ時に使用するURL
      url = 'http://localhost:4000/dojos';
    }

    $http.get(url).
      success(getDataSuccess).
      error(function() {
        getDataFromWebServer();
      });
  };

  // 道場のリンククリック時の処理
  $scope.onClickDojoLink = function(dojo) {
    // トーストクリック時に元に戻すコールバック関数を作成する
    var generateUndo= function(id, oldValue, lastVisited) {
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

    var undo = generateUndo(dojo.id, $scope.$storage.visited[dojo.id], $scope.$storage.lastVisited);
    showToast('元に戻す: 「' + dojo.lv + ' ' + $scope.RANK[dojo.rank] + ' ' + dojo.leader + '」の訪問', '', 10000, undo);

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

  // 道場の非表示ボタンクリック時の処理
  $scope.onClickHideDojo = function(dojo) {
    // トーストクリック時に元に戻すコールバック関数を作成する
    var generateUndo= function(id, oldValue) {
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

    var undo = generateUndo(dojo.id, $scope.$storage.hidden[dojo.id]);
    showToast('元に戻す: 「' + dojo.lv + ' ' + $scope.RANK[dojo.rank] + ' ' + dojo.leader + '」の非表示', '', 10000, undo);

    // 非表示に設定
    $scope.$storage.hidden[dojo.id] = true;
  };
}]);
