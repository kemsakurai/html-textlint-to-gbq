/**
 * Utils ツールで使用するUtility関数クラス
 */
class Utils {
  /**
   * @param {string} url チェック対象のURL
   * @return {boolean}
   */
  static stringIsAValidUrl(url) {
    try {
      new URL(url);
      return true;
    } catch (err) {
      throw new Error(`The Url format is invalid. ${url}`);
    }
  };
}
exports.Utils = Utils;
