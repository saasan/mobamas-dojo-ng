var mobamasDojo;

(function() {
  'use strict';

  mobamasDojo = angular.module('mobamasDojo', ['ngStorage', 'angularMoment', 'ngSanitize']);

  // 道場のソート順
  var DOJOS_ORDER_BY = {
    RANK: 0,
    LV: 1
  };

  // アプリケーションの設定
  mobamasDojo.constant('config', {
    // デバッグモード
    debug: (location.hostname === 'localhost'),
    // ランク表示用文字列
    rank: {
      '0': 'F',
      '1': 'E',
      '2': 'D',
      '3': 'C',
      '4': 'B',
      '5': 'A',
      '6': 'S',
      '7': 'SS',
      '8': 'S3',
      '9': 'S4',
      '10': 'S5',
      F: 0,
      E: 1,
      D: 2,
      C: 3,
      B: 4,
      A: 5,
      S: 6,
      SS: 7,
      S3: 8,
      S4: 9,
      S5: 10
    },
    url: 'http://dojo.sekai.in/api/2/query.json?length=100000&sortBy=Rank&sortDir=DESC&sortTarget=Prof',
    reset: {
      hour: 5,
      minute: 0
    },
    development: {
      url: 'http://dojo.sekai.in/api/2/query.json?length=100000&sortBy=Rank&sortDir=DESC&sortTarget=Prof',
      reset: {
        hour: 5,
        minute: 0
      }
    }
  });

  // localStorageに保存するユーザー別設定のデフォルト値
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

    // リーダー等を表示する
    extendedView: true,

    // 作業中や発揮値っぽい物を強調する
    emphasizedView: true,

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
    showBirthday: false,

    // モバマスのメニューを表示する
    showMobamasMenu: false,
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
    },

    // 「元に戻す」を消す時間
    undoTimeout: 0
  });

  // オブジェクトのキー数を返すフィルター
  mobamasDojo.filter('keyLength', function() {
    return function(input) {
      if (!angular.isObject(input)) {
        throw Error('Usage of non-objects with keylength filter!!');
      }
      return Object.keys(input).length;
    };
  });
})();