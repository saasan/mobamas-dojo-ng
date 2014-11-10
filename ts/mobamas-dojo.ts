///<reference path='../typings/angularjs/angular.d.ts'/>
// 道場のソート順
var DOJOS_ORDER_BY = {
  RANK: 0,
  LV: 1
};

var defaultSettings = {
  visited: {},
  hidden: {},
  lastVisited: null,
  lastTime: new Date(),

  otherTab: true,
  visitedMax: 1,
  autoHide: true,
  keepLastVisited: true,
  showWelcomeMessage: true,
  showInformation: true,
  showBirthday: true,

  showMobamasMenu: true,
  showMobamasMenuItem: {
    myPage: true,
    petitCg: false,
    gacha: false,
    cardStr: false,
    auction: false,
    quests: false,
    battles: false,
    cardUnion: false,
    shop: false,
    item: false,
    present: false,
    cardList: true,
    tradeResponse: false,
    deck: false,
    exchange: false,
    cardStorage: true,
    rareParts: false,
    friend: false,
    wish: false,
    archive: false,
    pRankingAward: true,
    results: false,
    gallery: false,
    memory: false,
    sBooth: false,
    personalOption: false,
    advise: false,
    top: false
  },

  // 表示の設定
  view: {
    limitTo: 30,
    orderBy: DOJOS_ORDER_BY.RANK,
    rankRange: {
      min: 0,
      max: -1
    },
    levelRange: {
      min: 0,
      max: -1
    },
    defenseRange: {
      min: 0,
      max: -1
    }
  }
};

var mobamasDojo = angular.module('mobamasDojo', ['ngStorage']);

// リクエストヘッダーにX-Requested-Withを付ける
mobamasDojo.config(function($httpProvider) {
  $httpProvider.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
});

mobamasDojo.controller('MainController', ['$scope', '$http', '$localStorage', function($scope, $http, $localStorage) {
  'use strict';

  // ランク表示用文字列
  $scope.RANK = [ 'F', 'E', 'D', 'C', 'B', 'A', 'S', 'SS', 'S3', 'S4', 'S5' ];
  // ソート順用データ
  $scope.ORDER_BY = [
    ['-rank', '-lv'],
    ['-lv', '-rank']
  ];

  // ストレージにデフォルト値を設定
  $scope.$storage = $localStorage.$default(angular.copy(defaultSettings));

  // 道場フィルター
  $scope.dojoFilter = function(dojo) {
    // 非表示設定
    if (dojo.hidden) {
      return false;
    }

    var rank = ($localStorage.view.rankRange.min <= dojo.rank) &&
               ($localStorage.view.rankRange.max < 0 || dojo.rank <= $localStorage.view.rankRange.max);
    var level = ($localStorage.view.levelRange.min <= dojo.lv) &&
                ($localStorage.view.levelRange.max < 0 || dojo.lv <= $localStorage.view.levelRange.max);
    var defense = true;

    // 最小値/最大値が無制限の場合はminDefenseがnullでも表示する
    if ($localStorage.view.defenseRange.min > 0) {
      defense = defense && dojo.minDefense != null && $localStorage.view.defenseRange.min <= dojo.minDefense;
    }
    if ($localStorage.view.defenseRange.max > 0) {
      defense = defense && dojo.minDefense != null && dojo.minDefense <= $localStorage.view.defenseRange.max;
    }

    return rank && level && defense;
  };

  // 初期化
  $scope.init = function() {
    $scope.status = '道場データ読み込み中...';
    $http.get('http://mobamas-dojo-server.herokuapp.com/dojos').
      success(function(data, status, headers, config) {
        // 最終更新日時
        $scope.lastUpdate = data.lastUpdate;
        // 道場リスト
        $scope.dojos = data.dojos;

        $scope.status = '道場データ読み込み完了！';
      }).
      error(function(data, status, headers, config) {
        $scope.status = 'エラー！ ステータスコード: ' + status + ' データ: ' + (data || '(無し)');
      });
  };

  // 道場のリンククリック時の処理
  $scope.onClickDojoLink = function(dojo) {
    if (dojo.visited) {
      dojo.visited++;
    }
    else {
      dojo.visited = 1;
    }
  };

  // 道場の非表示ボタンクリック時の処理
  $scope.onClickHideDojo = function(dojo) {
    dojo.hidden = true;
  };
}]);
