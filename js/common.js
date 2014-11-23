var mobamasDojo = angular.module('mobamasDojo', ['ngStorage']);

// 道場のソート順
var DOJOS_ORDER_BY = {
  RANK: 0,
  LV: 1
};

mobamasDojo.constant('defaultSettings', {
  // 訪問回数
  visited: {},
  // 非表示にした道場
  hidden: {},
  // 最後に訪問した道場
  lastVisited: null,
  // 最終アクセス日時
  lastTime: Date.now(),
  // お知らせのバージョン
  infoVersion: -1,

  /**********************************************
   * 道場リスト設定
   **********************************************/

  // 道場リスト設定を表示する
  showViewSettings: true,
  // visitedMax回以上訪問した時、道場を訪問済とする
  visitedMax: 1,
  // 訪問済の道場を表示しない
  autoHide: true,
  // 最後に訪問した道場を残す
  keepLastVisited: true,

  // 表示の設定
  view: {
    // 一度に表示する道場数
    limitTo: 10,
    // 表示順
    orderBy: DOJOS_ORDER_BY.RANK,
    // ランク
    rankRange: {
      min: 0,
      max: -1
    },
    // レベル
    levelRange: {
      min: 0,
      max: -1
    },
    // 守発揮値
    defenseRange: {
      min: 0,
      max: -1
    }
  },

  /**********************************************
   * その他の設定
   **********************************************/

  // 道場の○○画面を開く
  dojoLinkUrl: 'http://sp.pf.mbga.jp/12008305/?url=http%3A%2F%2F125.6.169.35%2Fidolmaster%2Fprofile%2Fshow%2F',
  // 道場を別のタブ/同じタブで開く
  dojoLinkTarget: '_blank',
  // 「ようこそ」を表示する
  showWelcomeMessage: true,
  // 誕生日を表示する
  showBirthday: true,

  // モバマスのメニューを表示する
  showMobamasMenu: true,
  showMobamasMenuItem: {
    myPage: true,           // ﾏｲｽﾀｼﾞｵ
    petitCg: false,         // ぷちﾃﾞﾚﾗ
    gacha: false,           // ｶﾞﾁｬ
    cardStr: false,         // ﾚｯｽﾝ
    auction: false,         // ﾌﾘｰﾄﾚｰﾄﾞ
    quests: false,          // お仕事
    battles: false,         // LIVEﾊﾞﾄﾙ
    cardUnion: false,       // 特訓
    shop: false,            // ｼｮｯﾌﾟ
    item: false,            // ｱｲﾃﾑ
    present: false,         // 贈り物
    cardList: true,         //  ｱｲﾄﾞﾙ一覧
    tradeResponse: false,   // ﾄﾚｰﾄﾞ
    deck: false,            // 編成
    exchange: false,        // 交換
    cardStorage: true,      // 女子寮
    rareParts: false,       // 衣装
    friend: false,          // お気に入り
    wish: false,            // ﾎｼｲﾓﾉ
    archive: false,         // ｱﾙﾊﾞﾑ
    pRankingAward: true,    // PRA
    results: false,         // ﾌﾟﾛﾌｨｰﾙ
    gallery: false,         // ｱｲﾄﾞﾙｷﾞｬﾗﾘｰ
    memory: false,          // ｲﾍﾞﾝﾄﾒﾓﾘｰ
    sBooth: false,          // ｻｳﾝﾄﾞﾌﾞｰｽ
    personalOption: false,  // 設定
    advise: false,          // ﾍﾙﾌﾟ
    top: false              // ﾄｯﾌﾟ
  }
});

mobamasDojo.constant('_showToast', function($rootScope, message, classString, timeout, callback) {
  'use strict';

  var data = {
    message: message,
    class: classString,
    timeout: timeout,
    callback: callback
  };

  $rootScope.$broadcast('showToast', data);
});
