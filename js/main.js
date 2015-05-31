/* global Birthday, mobamasDojo */

mobamasDojo.controller('MainController', ['$rootScope', '$scope', '$http', '$localStorage', 'config', 'defaultSettings', '_showToast', function($rootScope, $scope, $http, $localStorage, config, defaultSettings, _showToast) {
  'use strict';

  // bindで_showToastの第1引数に$rootScopeを付けておく
  var showToast = _showToast.bind(null, $rootScope);

  /**
   * ver1.xの設定をインポートする
   * @return {object} ver1.xの設定があればそれをdefaultSettingsに上書きしたオブジェクト、なければdefaultSettings
   */
  var importVersion1Settings = function() {
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

  /**
   * ver2.xの設定を3.x用にアップグレードする
   */
  var upgradeVersion2Settings = function(settings) {
    // 表示順を文字列から数値へ変換
    var rank = {
      rankNo: 0,
      lvNo: 1
    };

    if (typeof settings.orderBy === 'string') {
      settings.orderBy = rank[settings.orderBy];
    }
  };

  // ストレージから設定を読み込む
  $scope.$storage = $localStorage.$default(importVersion1Settings());
  upgradeVersion2Settings($scope.$storage);

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
    var reset = config.reset;
    if (location.hostname === 'localhost') {
      reset = config.development.reset;
    }

    var resetTime = new Date();
    resetTime.setHours(reset.hour);
    resetTime.setMinutes(reset.minute);
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
   * 全角を半角に変換
   * @param {string} str 全角を含む文字列
   * @returns {string} 半角化した文字列
   */
  var fullToHalf = function(str) {
    var delta = '０'.charCodeAt(0) - '0'.charCodeAt(0);
    return str.replace(/[０-９ａ-ｚＡ-Ｚ]/g, function(c) {
      return String.fromCharCode(c.charCodeAt(0) - delta);
    });
  };

  /**
   * 守発揮値の文字列から、最低守発揮値を数値として取り出す
   * @param {string} defence CSVから取り出した守発揮値の文字列
   * @returns {number} 最低守発揮値。数字が無い場合はnullを返す。
   */
  var getMinDefence = function(defence) {
    // 一番左にある数値がおそらく最低守発揮値
    var re = /^[^0-9０-９]*([0-9０-９.]+)/;

    // 数字が無い場合は0を返す
    if (defence == null || !re.test(defence)) {
      return null;
    }

    // 数字部分を取り出して半角に変換する
    var minDefenceString = defence.replace(re, '$1');
    minDefenceString = fullToHalf(minDefenceString);

    // 数値化
    var minDefence = parseFloat(minDefenceString);

    // 数が小さい場合は「5k」等の表記と思われるので1000倍する
    if (minDefence < 100) {
      minDefence *= 1000;
    }

    // 小数点以下を切り捨てて返す
    return Math.floor(minDefence);
  };

  /**
   * 休業、発揮値を強調する
   * @param value 強調したい文字列
   * @returns 強調した文字列
   */
  var em = function(value) {
    var newValue = value;

    // 休業を強調
    newValue = newValue.replace(/((作業|休業|休止|お休み|休み)中?)/g, '<em class="paused">$1</em>');
    // 発揮値を強調
    newValue = newValue.replace(/(↑*[\d０-９]+([\.,][\d０-９]+)?[kKｋＫ]?↑*)/g, '<em class="defenseValue">$1</em>');

    // 上の置換で無関係な数値まで置換されるので元に戻す
    // 文字実体参照
    newValue = newValue.replace(/&#<em class="defenseValue">(\d+)<\/em>;/g, '&#$1;');
    // レベルとか
    newValue = newValue.replace(/(レベル|ﾚﾍﾞﾙ|Lv|LV|Ｌｖ|ＬＶ|第|S|攻|守|スタ|ｽﾀ|\w)<em class="defenseValue">([\d０-９]+)<\/em>/g, '$1$2');
    newValue = newValue.replace(/<em class="defenseValue">([\d０-９]+)<\/em>(時間|票|レベル|番|cm|戦|勝|敗|引|回|枚|人|年|コス|ｺｽ|名|%|％|st|nd|rd|th)/g, '$1$2');

    return newValue;
  };

  /**
   * recordから道場のデータを作成する
   * @param record DojoList APIのrecord
   * @returns 道場のデータ
   */
  var createDojo = function(record) {
    var rank, rankString, unit, defense, lastUpdate;
    // 文字列の長さが0以上なら追加する物
    var checkLength = {
      leader: 'Ldr',
      comment: 'Comm'
    };

    var dojo = {
      lv : record.Prof.Lv || record.Data.Lv,
      id : record.Prof.ID || record.Data.ID
    };

    // ランクを文字列から数値へ置換
    rankString = record.Prof.Rank || record.Data.Rank;
    rank = config.rank[rankString];
    if (rank != null) {
      dojo.rank = rank;
    }

    // 文字列の長さが0以上なら追加
    Object.keys(checkLength).forEach(function(key) {
      var value = record.Prof[checkLength[key]] || record.Data[checkLength[key]];
      if (value.length > 0) {
        if (key === 'comment') {
          value = em(value);
        }
        dojo[key] = value;
      }
    });

    // ユニット名が無ければ元データのリーダー
    unit = record.Prof.Unit || record.Data.Ldr;
    if (unit != null) {
      // 元のユニット名
      dojo.unit = unit;
      // 強調したユニット名
      dojo.htmlUnit = em(unit);
    }

    if (record.Data) {
      // 表示用守発揮値文字列
      dojo.defense = record.Data.Def;

      // 実際のプロフィール情報の守発揮値(record.Prof.Def)はリーダーアイドルの最大値なので、
      // 道場主の自己申告値(record.Data.Def)からてきとーに求める
      defense = getMinDefence(record.Data.Def);
      if (defense != null) {
        dojo.minDefense = defense;
      }
    }

    // 最終更新日時
    lastUpdate = record.Prof.Upd || record.Data.Upd;
    if (lastUpdate != null) {
      dojo.lastUpdate = lastUpdate;
    }

    return dojo;
  };

  /**
   * サーバーから取得したデータを$scopeに反映する
   * @param {object} data サーバーから取得したデータ
   */
  var setData = function(data) {
    var i, records = data.data.records;
    var dojos = [];

    for (i = 0; i < records.length; i++) {
      dojos.push(createDojo(records[i]));
    }

    $scope.dojos = dojos;
  };

  /**
   * データ取得正常終了時の処理
   * @param {object} data サーバーから取得したデータ
   */
  var getDataSuccess = function(data) {
    var cacheKey = 'dataCache';

    // 道場データが取得できたか確認
    if (data.result && data.data.records.length > 0) {
      setData(data);

      // 道場データのキャッシュを保存
      window.localStorage.setItem(cacheKey, angular.toJson(data));

      showToast('道場データ読み込み完了！');
    }
    else {
      // キャッシュがあるか確認
      var json = window.localStorage.getItem(cacheKey);
      if (json) {
        var dataCache = angular.fromJson(json);
        setData(dataCache);

        showToast('エラー: サーバーから取得した道場データに道場が1件もありませんでした。' + dataCache.lastUpdate + '時点の道場データを使用します。', 'error', 0);
      }
    }
  };

  // 初期化
  $scope.init = function() {
    updateBirthday();

    // 現在の日時のミリ秒
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

    var url = config.url;
    if (location.hostname === 'localhost') {
      // デバッグ時に使用するURL
      url = config.development.url;
    }

    $http.get(url).
      success(getDataSuccess);
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
    showToast('元に戻す: 「' + dojo.lv + ' ' + config.rank[dojo.rank] + ' ' + dojo.unit + '」の訪問', '', $scope.$storage.undoTimeout, undo);

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
    showToast('元に戻す: 「' + dojo.lv + ' ' + config.rank[dojo.rank] + ' ' + dojo.unit + '」の非表示', '', $scope.$storage.undoTimeout, undo);

    // 非表示に設定
    $scope.$storage.hidden[dojo.id] = true;
  };
}]);
