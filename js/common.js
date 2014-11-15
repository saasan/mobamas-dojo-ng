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
  showViewSettings: true,

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
