/* global Birthday, mobamasDojo */

(function() {
  'use strict';

  mobamasDojo.factory('util', ['config', function(config) {
    /**********************************************
     * プライベート
     **********************************************/
    var birthday = new Birthday();

    /**
     * 全角を半角に変換
     * @param {string} str 全角を含む文字列
     * @returns {string} 半角化した文字列
     */
    function fullToHalf(str) {
      var delta = '０'.charCodeAt(0) - '0'.charCodeAt(0);
      return str.replace(/[０-９ａ-ｚＡ-Ｚ]/g, function(c) {
        return String.fromCharCode(c.charCodeAt(0) - delta);
      });
    }

    /**
     * 休業、発揮値を強調する
     * @param value 強調したい文字列
     * @returns 強調した文字列
     */
    function em(value) {
      var newValue = value;

      // 休業を強調
      newValue = newValue.replace(/((作業|休業|休止|お休み|休み)中?)/g, '<em class="paused">$1</em>');
      // 発揮値を強調
      newValue = newValue.replace(/(↑*[\d０-９]+([\.,][\d０-９]+)?[kKｋＫ]?↑*)/g, '<em class="defenseValue">$1</em>');

      // 上の置換で無関係な数値まで置換されるので元に戻す
      // 数字1～2桁だけのやつは多分発揮値じゃない
      newValue = newValue.replace(/<em class="defenseValue">([\d０-９]{1,2})<\/em>/g, '$1');
      // 文字実体参照
      newValue = newValue.replace(/&#<em class="defenseValue">(\d+)<\/em>;/g, '&#$1;');
      // Twitter
      newValue = newValue.replace(/@(\w+)<em class="defenseValue">(\w+)<\/em>/g, '@$1$2');
      newValue = newValue.replace(/@<em class="defenseValue">(\w+)<\/em>(\w+)/g, '@$1$2');
      newValue = newValue.replace(/@(\w+)<em class="defenseValue">(\w+)<\/em>(\w+)/g, '@$1$2');
      // レベルとか
      newValue = newValue.replace(/(レベル|ﾚﾍﾞﾙ|Lv|LV|Ｌｖ|ＬＶ|第|S|攻|守|スタ|ｽﾀ)<em class="defenseValue">([\d０-９]+)<\/em>/g, '$1$2');
      newValue = newValue.replace(/<em class="defenseValue">([\d０-９]+)<\/em>(時間|票|レベル|番|cm|戦|勝|敗|引|回|枚|人|年|月|日|コス|ｺｽ|名|冊|%|％|st|nd|rd|th)/g, '$1$2');

      return newValue;
    }

    /**
     * 守発揮値の文字列から、最低守発揮値を数値として取り出す
     * @param {string} defence CSVから取り出した守発揮値の文字列
     * @returns {number} 最低守発揮値。数字が無い場合はnullを返す。
     */
    function getMinDefence(defence) {
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
    }

    /**
     * recordから道場のデータを作成する
     * @param record DojoList APIのrecord
     * @returns 道場のデータ
     */
    function createDojo(record) {
      var rank, rankString, unit, defense, lastUpdate;
      // 文字列の長さが0以上なら追加する物
      var checkLength = {
        leader: 'Ldr',
        comment: 'Comm'
      };

      var dojo = {
        lv: record.Prof.Lv || record.Data.Lv,
        id: record.Prof.ID || record.Data.ID
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
    }

    /**********************************************
     * パブリック
     **********************************************/

    return {
      birthdayToday: birthday.getToday(),
      birthdayNext: birthday.getNext(),

      /**
       * 前回のリセット時間を取得する
       * @return {number} リセット時間をgetTime()でミリ秒にした値
       */
      getResetTime: function() {
        var reset = (config.debug ? config.development.reset : config.reset);

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
      },

      /**
       * 値が範囲内か確認する
       * @param {number} value 調べる対象
       * @param {number} start 範囲開始値
       * @param {number} end 範囲終了値
       * @return {boolean} trueなら範囲内
       */
      betweenRange: function(value, start, end) {
        return (start < value && value <= end);
      },

      /**
       * サーバーから取得した道場データを加工して返す
       * @param {object} data サーバーから取得したデータ
       * @returns {object} 加工した道場データ
       */
      createDojos: function(data) {
        var i, records = data.data.records;
        var dojos = [];

        for (i = 0; i < records.length; i++) {
          dojos.push(createDojo(records[i]));
        }

        return dojos;
      }
    };
  }]);
})();