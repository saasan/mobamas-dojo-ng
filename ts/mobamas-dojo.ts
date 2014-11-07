class Greeter {
    greeting: string;
    constructor(message: string) {
        this.greeting = message;
    }
    greet() {
        return "Hello, " + this.greeting;
    }
}

var greeter = new Greeter("world");

var button = document.createElement('button');
button.textContent = "Say Hello";
button.onclick = function() {
    alert(greeter.greet());
}

document.body.appendChild(button);


    _settingsMobamasMenuItems: [
      { settingsId: 'showMobamasMenu', menuId: 'mobamasMenu' },
      { settingsId: 'showMenuMyPage', menuId: 'menuMyPage' },
      { settingsId: 'showMenuGacha', menuId: 'menuGacha' },
      { settingsId: 'showMenuCardStr', menuId: 'menuCardStr' },
      { settingsId: 'showMenuAuction', menuId: 'menuAuction' },
      { settingsId: 'showMenuQuests', menuId: 'menuQuests' },
      { settingsId: 'showMenuBattles', menuId: 'menuBattles' },
      { settingsId: 'showMenuCardUnion', menuId: 'menuCardUnion' },
      { settingsId: 'showMenuShop', menuId: 'menuShop' },
      { settingsId: 'showMenuItem', menuId: 'menuItem' },
      { settingsId: 'showMenuPresent', menuId: 'menuPresent' },
      { settingsId: 'showMenuCardList', menuId: 'menuCardList' },
      { settingsId: 'showMenuTradeResponse', menuId: 'menuTradeResponse' },
      { settingsId: 'showMenuDeck', menuId: 'menuDeck' },
      { settingsId: 'showMenuExchange', menuId: 'menuExchange' },
      { settingsId: 'showMenuCardStorage', menuId: 'menuCardStorage' },
      { settingsId: 'showMenuRareParts', menuId: 'menuRareParts' },
      { settingsId: 'showMenuFriend', menuId: 'menuFriend' },
      { settingsId: 'showMenuWish', menuId: 'menuWish' },
      { settingsId: 'showMenuArchive', menuId: 'menuArchive' },
      { settingsId: 'showMenuPRankingAward', menuId: 'menuPRankingAward' },
      { settingsId: 'showMenuResults', menuId: 'menuResults' },
      { settingsId: 'showMenuGallery', menuId: 'menuGallery' },
      { settingsId: 'showMenuMemory', menuId: 'menuMemory' },
      { settingsId: 'showMenuSBooth', menuId: 'menuSBooth' },
      { settingsId: 'showMenuPersonalOption', menuId: 'menuPersonalOption' },
      { settingsId: 'showMenuAdvise', menuId: 'menuAdvise' },
      { settingsId: 'showMenuTop', menuId: 'menuTop' }
    ],

      var defaultValues = {
        visited: {},
        hide: {},
        sameTab: false,
        visitedMax: 1,
        autoHide: true,
        keepLastVisited: true,
        lastVisited: null,
        hideBirthday: false,
        infoClosed: false,
        lastTime: now
      };

      // モバマスのメニュー
      for (var i = 0; i < this._settingsMobamasMenuItems.length; i++) {
        defaultValues[this._settingsMobamasMenuItems[i].settingsId] = false;
      }
      defaultValues.showMobamasMenu = true;       // モバマスのメニュー
      defaultValues.showMenuMyPage = true;        // ﾏｲｽﾀｼﾞｵ
      defaultValues.showMenuCardList = true;      // ｱｲﾄﾞﾙ一覧
      defaultValues.showMenuCardStorage = true;   // 女子寮
      defaultValues.showMenuPRankingAward = true; // PRA


angular.module('dojoApp', [])
  .controller('TodoController', ['$scope', function($scope) {
    $scope.todos = [
      {text:'learn angular', done:true},
      {text:'build an angular app', done:false}];

    $scope.addTodo = function() {
      $scope.todos.push({text:$scope.todoText, done:false});
      $scope.todoText = '';
    };

    $scope.remaining = function() {
      var count = 0;
      angular.forEach($scope.todos, function(todo) {
        count += todo.done ? 0 : 1;
      });
      return count;
    };

    $scope.archive = function() {
      var oldTodos = $scope.todos;
      $scope.todos = [];
      angular.forEach(oldTodos, function(todo) {
        if (!todo.done) $scope.todos.push(todo);
      });
    };
  }]);
