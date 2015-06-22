/* global mobamasDojo */

mobamasDojo.controller('MainController', ['$scope', '$http', '$localStorage', 'config', 'defaultSettings', 'toast', 'util', function($scope, $http, $localStorage, config, defaultSettings, toast, util) {
  'use strict';

  // ストレージから設定を読み込む
  $scope.$storage = $localStorage.$default(angular.copy(defaultSettings));

  /**
   * 保存されている訪問回数と最後に訪問した道場を初期化する
   */
  var resetVisited = function() {
    $scope.$storage.visited = {};
    $scope.$storage.lastVisited = null;
  };

  // ランク表示用文字列
  $scope.RANK = config.rank;
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
   * サーバーから取得したデータを$scopeに反映する
   * @param {object} data サーバーから取得したデータ
   */
  var setData = function(data) {
    var i, records = data.data.records;
    var dojos = [];

    for (i = 0; i < records.length; i++) {
      dojos.push(util.createDojo(records[i]));
    }

    $scope.dojos = dojos;
  };

  /**
   * データ取得正常終了時の処理
   * 引数なしで呼び出すとキャッシュを使用する
   * @param {object} data サーバーから取得したデータ
   */
  var getDataSuccess = function(data) {
    var cacheKey = 'dataCache';

    // 道場データが取得できたか確認
    if (data && data.result && data.data.records && data.data.records.length > 0) {
      setData(data);

      // 道場データのキャッシュを保存
      window.localStorage.setItem(cacheKey, angular.toJson(data));

      toast.show('道場データ読み込み完了！');
    }
    else {
      // キャッシュがあるか確認
      var json = window.localStorage.getItem(cacheKey);
      if (json) {
        var dataCache = angular.fromJson(json);
        setData(dataCache);

        toast.show('エラー: 道場データを取得できませんでした。前回取得した道場データを使用します。', 'error', 0);
      }
    }
  };

  // 初期化
  $scope.init = function() {
    // 誕生日を更新する
    $scope.birthdayToday = util.birthdayToday;
    $scope.birthdayNext = util.birthdayNext;

    // 現在の日時のミリ秒
    var now = Date.now();
    // 訪問回数のリセットが必要か
    var needReset = util.betweenRange(util.getResetTime(), $scope.$storage.lastTime, now);

    // 前回のアクセスから今回の間でリセット時間を跨いでいたら訪問回数を初期化
    if (needReset) {
      resetVisited();
    }

    // アクセス日時を保存
    $scope.$storage.lastTime = now;

    toast.show('道場データ読み込み中...');

    var url = (config.debug ? config.development.url : config.url);

    $http.get(url).
      success(getDataSuccess).
      error(function() {
        // 引数なしで呼び出すとキャッシュを使用する
        getDataSuccess();
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
    var message = '元に戻す: 「' + dojo.lv + ' ' + config.rank[dojo.rank] + ' ' + dojo.unit + '」の訪問';
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
    var message = '元に戻す: 「' + dojo.lv + ' ' + config.rank[dojo.rank] + ' ' + dojo.unit + '」の非表示';
    toast.show(message, '', $scope.$storage.undoTimeout, undo);

    // 非表示に設定
    $scope.$storage.hidden[dojo.id] = true;
  };
}]);
