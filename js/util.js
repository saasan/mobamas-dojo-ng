/* global mobamasDojo */

(function() {
  'use strict';

  mobamasDojo.factory('util', ['config', function(config) {
    /**********************************************
     * プライベート
     **********************************************/

    /**
     * 全角を半角に変換
     * @param {string} str 全角を含む文字列
     * @returns {string} 半角化した文字列
     */
    function fullToHalf(str) {
      var delta = '０'.charCodeAt(0) - '0'.charCodeAt(0);
      return str.replace(/[０-９ａ-ｚＡ-Ｚ．，]/g, function(c) {
        return String.fromCharCode(c.charCodeAt(0) - delta);
      });
    }

    /**
     * 守発揮値を強調する
     * @param value 強調したい文字列
     * @returns {object} result 強調したらtrue、しなかったらfalse
     *                   emString 強調した文字列
     *                   defenceString 守発揮値の文字列
     *                   defenceValue 守発揮値の数値
     */
    function emDefence(value) {
      var result = false, emString = value, defenceString = '', defenceValue = 0;

      // 発揮値を強調
      emString = emString.replace(/(↑*[\d０-９]+([\.．,，][\d０-９]+)?[kKｋＫ万]?↑*)/g, '<em class="defenseValue">$1</em>');

      // 上の置換で無関係な数値まで置換されるので元に戻す
      // 数字1～2桁だけのやつは多分発揮値じゃない
      emString = emString.replace(/<em class="defenseValue">([\d０-９]{1,2})<\/em>/g, '$1');
      // 数字7桁以上のやつは多分発揮値じゃない
      emString = emString.replace(/<em class="defenseValue">([\d０-９]{7,})<\/em>/g, '$1');
      // 文字実体参照
      emString = emString.replace(/&#<em class="defenseValue">(\d+)<\/em>;/g, '&#$1;');
      // Twitter
      emString = emString.replace(/(@|＠)(\w+)<em class="defenseValue">(\w+)<\/em>/g, '$1$2$3');
      emString = emString.replace(/(@|＠)<em class="defenseValue">(\w+)<\/em>/g, '$1$2');
      // レベルとか
      emString = emString.replace(/(レベル|ﾚﾍﾞﾙ|Lv|Ｌｖ|ＬＶ|第|S|攻|守|スタ|ｽﾀ|Rank|PRP)<em class="defenseValue">([\d０-９]+)<\/em>/gi, '$1$2');
      emString = emString.replace(/<em class="defenseValue">([\d０-９]+)<\/em>(時間|票|レベル|番|cm|戦|勝|敗|引|回|枚|人|年|月|日|コス|ｺｽ|名|冊|%|％|st|nd|rd|th|R|道場)/g, '$1$2');

      // 数値化
      emString.replace(
        /<em class="defenseValue">(.+?)<\/em>/g,
        function(matched, group1) {
          // 最初にマッチした物だけ数値化
          if (!result) {
            result = true;
            defenceString = group1;
            defenceValue = getMinDefence(matched);
          }

          return '';
        }
      );

      return {
        result: result,
        emString: emString,
        defenceString: defenceString,
        defenceValue: defenceValue
      };
    }

    /**
     * 休業中を強調する
     * @param value 強調したい文字列
     * @returns {object} result 強調したらtrue、しなかったらfalse
     *                   value  処理後の文字列
     */
    function emPaused(value) {
      var result = false, newValue = value;

      newValue = newValue.replace(
        /(((作業|休業|休止|お休み|休み)中?)|強リーダー(注意)?|高発揮値|(発揮値高(い|め)?))/g,
        function(matched) {
          result = true;
          return '<em class="paused">' + matched + '</em>';
        }
      );

      return { result: result, value: newValue };
    }

    /**
     * 守発揮値の文字列から、最低守発揮値を数値として取り出す
     * @param {string} defence CSVから取り出した守発揮値の文字列
     * @returns {number} 最低守発揮値。数字が無い場合はnullを返す。
     */
    function getMinDefence(defence) {
      var halfWidthDefence, minDefenceString;

      // nullやundefinedの場合はnullを返す
      if (defence == null) {
        return null;
      }

      // 半角に変換
      halfWidthDefence = minDefenceString = fullToHalf(defence);

      // カンマを消しておく
      minDefenceString = minDefenceString.replace(/[,]/g, '');

      // 一番左にある数値がおそらく最低守発揮値
      var re = /^[^\d]*([\d\.]+)/;

      // 数値が無い場合はnullを返す
      var found = minDefenceString.match(re);
      if (!found) {
        return null;
      }

      // 数値部分を取り出す
      minDefenceString = found[1];

      // 数値化
      var minDefence = parseFloat(minDefenceString);

      // 「k」が含まれる場合は1000倍する
      if (halfWidthDefence.indexOf('k') !== -1) {
        minDefence *= 1000;
      }
      // 「万」が含まれる場合は10000倍する
      else if (halfWidthDefence.indexOf('万') !== -1) {
        minDefence *= 10000;
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
      var unit;
      // 文字列の長さが0以上なら追加する物
      var checkLength = {
        leader: 'leaderCardName',
        comment: 'comment'
      };

      var dojo = {
        lv: record.level,
        id: record.mobageId,
        rank: record.producerRank,
        defense: record.defaultDefence,
        minDefense: record.defaultDefence
      };

      // 文字列の長さが0以上なら追加
      Object.keys(checkLength).forEach(function(key) {
        var value = record[checkLength[key]];
        if (value && value.length > 0) {
          if (key === 'comment') {
            value = emDefence(emPaused(value).value).emString;
          }
          dojo[key] = value;
        }
      });

      // ユニット名が無ければリーダー
      unit = record.unitName || record.leaderCardName;
      if (unit != null) {
        // 元のユニット名
        dojo.unit = unit;

        // 強調したユニット名
        var emUnitPaused = emPaused(unit);
        var emUnitDefence = emDefence(emUnitPaused.value);
        dojo.htmlUnit = emUnitDefence.emString;

        // 休業中情報
        dojo.paused = emUnitPaused.result;
      }

      // 最終更新日時
      dojo.lastUpdate = new Date(Date.parse(record.lastUpdate));

      return dojo;
    }

    /**********************************************
     * パブリック
     **********************************************/

    return {
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
        var i;
        var dojos = [];

        for (i = 0; i < data.length; i++) {
          dojos.push(createDojo(data[i]));
        }

        return dojos;
      }
    };
  }]);
})();