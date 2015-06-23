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
    // 道場データのキャッシュを保存するキー
    cacheKey: 'mobamasDojo.dataCache',
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
    },
    // UI用データ
    ui: {
      mobamasMenu: [
        { key: 'myPage', url: '?url=http%3A%2F%2F125.6.169.35%2Fidolmaster%2Fmypage', label: 'ﾏｲｽﾀｼﾞｵ' },
        { key: 'petitCg', url: '?url=http%3A%2F%2F125.6.169.35%2Fidolmaster%2Fpetit_cg', label: 'ぷちﾃﾞﾚﾗ' },
        { key: 'gacha', url: '?url=http%3A%2F%2F125.6.169.35%2Fidolmaster%2Fgacha', label: 'ｶﾞﾁｬ' },
        { key: 'cardStr', url: '?url=http%3A%2F%2F125.6.169.35%2Fidolmaster%2Fcard_str', label: 'ﾚｯｽﾝ' },
        { key: 'auction', url: '?url=http%3A%2F%2F125.6.169.35%2Fidolmaster%2Fauction%2Fauction_top', label: 'ﾌﾘｰﾄﾚｰﾄﾞ' },
        { key: 'quests', url: '?url=http%3A%2F%2F125.6.169.35%2Fidolmaster%2Fquests', label: 'お仕事' },
        { key: 'battles', url: '?url=http%3A%2F%2F125.6.169.35%2Fidolmaster%2Fbattles', label: 'LIVEﾊﾞﾄﾙ' },
        { key: 'cardUnion', url: '?url=http%3A%2F%2F125.6.169.35%2Fidolmaster%2Fcard_union', label: '特訓' },
        { key: 'shop', url: '?url=http%3A%2F%2F125.6.169.35%2Fidolmaster%2Fshop%2Findex', label: 'ｼｮｯﾌﾟ' },
        { key: 'item', url: '?url=http%3A%2F%2F125.6.169.35%2Fidolmaster%2Fitem%2Findex', label: 'ｱｲﾃﾑ' },
        { key: 'present', url: '?url=http%3A%2F%2F125.6.169.35%2Fidolmaster%2Fpresent%2Frecieve%2F%3Fview_auth_type%3D1%26cache%3D1', label: '贈り物' },
        { key: 'cardList', url: '?url=http%3A%2F%2F125.6.169.35%2Fidolmaster%2Fcard_list%2Findex', label: 'ｱｲﾄﾞﾙ一覧' },
        { key: 'tradeResponse', url: '?url=http%3A%2F%2F125.6.169.35%2Fidolmaster%2Ftrade_response%2Ftrade_list_advance', label: 'ﾄﾚｰﾄﾞ' },
        { key: 'deck', url: '?url=http%3A%2F%2F125.6.169.35%2Fidolmaster%2Fdeck%2Findex', label: '編成' },
        { key: 'exchange', url: '?url=http%3A%2F%2F125.6.169.35%2Fidolmaster%2Fexchange%2Fmedal_list%2F999999', label: '交換' },
        { key: 'cardStorage', url: '?url=http%3A%2F%2F125.6.169.35%2Fidolmaster%2Fcard_storage%2Findex', label: '女子寮' },
        { key: 'rareParts', url: '?url=http%3A%2F%2F125.6.169.35%2Fidolmaster%2Frareparts%2Findex', label: '衣装' },
        { key: 'friend', url: '?url=http%3A%2F%2F125.6.169.35%2Fidolmaster%2Ffriend%2Findex', label: 'お気に入り' },
        { key: 'wish', url: '?url=http%3A%2F%2F125.6.169.35%2Fidolmaster%2Fwish%2Findex', label: 'ﾎｼｲﾓﾉ' },
        { key: 'archive', url: '?url=http%3A%2F%2F125.6.169.35%2Fidolmaster%2Farchive%2Findex', label: 'ｱﾙﾊﾞﾑ' },
        { key: 'pRankingAward', url: '?url=http%3A%2F%2F125.6.169.35%2Fidolmaster%2Fp_ranking_award', label: 'PRA' },
        { key: 'results', url: '?url=http%3A%2F%2F125.6.169.35%2Fidolmaster%2Fresults', label: 'ﾌﾟﾛﾌｨｰﾙ' },
        { key: 'gallery', url: '?url=http%3A%2F%2F125.6.169.35%2Fidolmaster%2Fgallery', label: 'ｱｲﾄﾞﾙｷﾞｬﾗﾘｰ' },
        { key: 'memory', url: '?url=http%3A%2F%2F125.6.169.35%2Fidolmaster%2Fmemory', label: 'ｲﾍﾞﾝﾄﾒﾓﾘｰ' },
        { key: 'sBooth', url: '?url=http%3A%2F%2F125.6.169.35%2Fidolmaster%2Fs_booth', label: 'ｻｳﾝﾄﾞﾌﾞｰｽ' },
        { key: 'personalOption', url: '?url=http%3A%2F%2F125.6.169.35%2Fidolmaster%2Fpersonal_option', label: '設定' },
        { key: 'advise', url: '?url=http%3A%2F%2F125.6.169.35%2Fidolmaster%2Fadvise%2Findex%2Ftop', label: 'ﾍﾙﾌﾟ' },
        { key: 'top', url: '', label: 'ﾄｯﾌﾟ' }
      ],
      limitTo: [ 5, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 200, 300, 400, 500 ],
      rankRangeMin: [
        { label: 'S5', value: 10 },
        { label: 'S4', value: 9 },
        { label: 'S3', value: 8 },
        { label: 'SS', value: 7 },
        { label: 'S', value: 6 },
        { label: 'A', value: 5 },
        { label: 'B', value: 4 },
        { label: 'C', value: 3 },
        { label: 'D', value: 2 },
        { label: 'E', value: 1 },
        { label: '無制限', value: 0 }
      ],
      rankRangeMax: [
        { label: '無制限', value: -1 },
        { label: 'S5', value: 10 },
        { label: 'S4', value: 9 },
        { label: 'S3', value: 8 },
        { label: 'SS', value: 7 },
        { label: 'S', value: 6 },
        { label: 'A', value: 5 },
        { label: 'B', value: 4 },
        { label: 'C', value: 3 },
        { label: 'D', value: 2 },
        { label: 'E', value: 1 },
        { label: 'F', value: 0 }
      ],
      levelRangeMin: [
        { label: '350', value: 350 },
        { label: '300', value: 300 },
        { label: '250', value: 250 },
        { label: '200', value: 200 },
        { label: '150', value: 150 },
        { label: '100', value: 100 },
        { label: '50', value: 50 },
        { label: '無制限', value: 0 }
      ],
      levelRangeMax: [
        { label: '無制限', value: -1 },
        { label: '350', value: 350 },
        { label: '300', value: 300 },
        { label: '250', value: 250 },
        { label: '200', value: 200 },
        { label: '150', value: 150 },
        { label: '100', value: 100 },
        { label: '50', value: 50 },
        { label: '0', value: 0 }
      ],
      defenseRangeMin: [
        { label: '7000', value: 7000 },
        { label: '6000', value: 6000 },
        { label: '5000', value: 5000 },
        { label: '4000', value: 4000 },
        { label: '3000', value: 3000 },
        { label: '2000', value: 2000 },
        { label: '1700', value: 1700 },
        { label: '1600', value: 1600 },
        { label: '1500', value: 1500 },
        { label: '無制限', value: 0 }
      ],
      defenseRangeMax: [
        { label: '無制限', value: -1 },
        { label: '7000', value: 7000 },
        { label: '6000', value: 6000 },
        { label: '5000', value: 5000 },
        { label: '4000', value: 4000 },
        { label: '3000', value: 3000 },
        { label: '2000', value: 2000 },
        { label: '1700', value: 1700 },
        { label: '1600', value: 1600 },
        { label: '1500', value: 1500 }
      ]
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

    // 休業中や発揮値っぽい物を強調する
    emphasizedView: true,

    // 休業中っぽい道場を表示しない
    hidePausedDojo: false,

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