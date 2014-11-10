/* jshint indent: 2 */
/* global S2Storage */

var Config;

(function(){
  'use strict';

  /**
   * 設定クラス
   * @param {object} [optDefaultValues] 設定のデフォルト値
   * @param {string} [optStorageNamespace] S2Storageの名前空間
   * @param {string} [optStorageKey] S2Storageのキー
   * @param {function} [optReviver] 設定値の特殊な変換を行う関数
   * @constructor
   */
  Config = function(optDefaultValues, optStorageNamespace, optStorageKey, optReviver) {
    if (!S2Storage) {
      throw new Error('S2Storage Class needed');
    }

    if (arguments.length >= 1) {
      this._defaultValues = optDefaultValues;
      this._importValues(optDefaultValues);
    }

    this._storage = new S2Storage(true, optStorageNamespace);

    if (arguments.length >= 3) {
      this.storageKey = optStorageKey;
    }

    if (arguments.length >= 4) {
      this._reviver = optReviver;
    }
  };

  Object.defineProperty(Config.prototype, '_storage', {
    enumerable: false,
    writable: true,
    value: null
  });

  Object.defineProperty(Config.prototype, '_reviver', {
    enumerable: false,
    writable: true,
    value: null
  });

  Object.defineProperty(Config.prototype, '_defaultValues', {
    enumerable: false,
    writable: true,
    value: {}
  });

  Object.defineProperty(Config.prototype, '_importValues', {
    enumerable: false,
    value: function(sourceObject) {
      for (var i in sourceObject) {
        this[i] = sourceObject[i];
      }
    }
  });

  /**
   * S2Storageのキー
   * @type {string}
   */
  Object.defineProperty(Config.prototype, 'storageKey', {
    enumerable: false,
    writable: true,
    value: 'config'
  });

  /**
   * 全ての設定を消去する
   */
  Object.defineProperty(Config.prototype, 'clear', {
    enumerable: false,
    value: function() {
      for (var i in this) {
        delete this[i];
      }
    }
  });

  /**
   * 全ての設定を消去し、デフォルト値にする
   */
  Object.defineProperty(Config.prototype, 'reset', {
    enumerable: false,
    value: function() {
      this.clear();
      this._importValues(this._defaultValues);
    }
  });

  /**
   * 設定を保存する
   */
  Object.defineProperty(Config.prototype, 'save', {
    enumerable: false,
    value: function() {
      this._storage.set(this.storageKey, this);
    }
  });

  /**
   * 設定を読み込む
   * @param {boolean} [optClear] true: 設定を初期化する
   *                              false: 設定を初期化しない
   */
  Object.defineProperty(Config.prototype, 'load', {
    enumerable: false,
    value: function(optClear) {
      var newValues = this._storage.get(this.storageKey, {}, this._reviver);

      if (optClear) {
        this.clear();
      }

      this._importValues(newValues);
    }
  });

  /**
   * 生データを取得する
   * @return {string} 設定のJSON文字列
   */
  Object.defineProperty(Config.prototype, 'getRawData', {
    enumerable: false,
    value: function() {
      return this._storage.getRawData(this.storageKey);
    }
  });

  /**
   * 生データを保存する
   * @param {string} value 設定のJSON文字列
   */
  Object.defineProperty(Config.prototype, 'setRawData', {
    enumerable: false,
    value: function(value) {
      this._storage.setRawData(this.storageKey, value);
    }
  });
})();
