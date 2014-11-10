///<reference path='../typings/angularjs/angular.d.ts'/>
var mobamasDojo = angular.module('mobamasDojo', []);

mobamasDojo.controller('SettingsController', ['$scope', function($scope) {
  'use strict';

  $scope.settings = {
    otherTab: true,
    visitedMax: 1,
    autoHide: true,
    keepLastVisited: true,
    numberOfShownDojos: 20,
    maxDefence: 0,
    showBirthday: true,
    showMobamasMenu: true,
    showMenuMyPage: true,
    showMenuGacha: false,
    showMenuCardStr: false,
    showMenuAuction: false,
    showMenuQuests: false,
    showMenuBattles: false,
    showMenuCardUnion: false,
    showMenuShop: false,
    showMenuItem: false,
    showMenuPresent: false,
    showMenuCardList: true,
    showMenuTradeResponse: false,
    showMenuDeck: false,
    showMenuExchange: false,
    showMenuCardStorage: true,
    showMenuRareParts: false,
    showMenuFriend: false,
    showMenuWish: false,
    showMenuArchive: false,
    showMenuPRankingAward: true,
    showMenuResults: false,
    showMenuGallery: false,
    showMenuMemory: false,
    showMenuSBooth: false,
    showMenuPersonalOption: false,
    showMenuAdvise: false,
    showMenuTop: false
  };

  $scope.save = function() {
  };

  $scope.cancel = function() {
  };

  $scope.resetVisited = function() {
  };

  $scope.resetHiddenDojos = function() {
  };

  $scope.resetAll = function() {
  };

  $scope.inputData = function() {
  };

  $scope.clearDataOutput = function() {
    $scope.dataOutput = '';
  };
}]);
