const https = require('https');
const beautify = require('js-beautify');
const {TextlintMessageRepository} = require('../database/textLintMessages.js');
const {Utils} = require('../utils');
const TextLintEngine = require('textlint').TextLintEngine;
const engine = new TextLintEngine();

module.exports = function(url) {
  // check
  Utils.stringIsAValidUrl(url);
  // html 取得、html 整形
  const promise = getBeautifiedHtmlFromUrl(url);
  promise.then((html) => {
    engine.executeOnText(html, '.html').then((results) => {
      return saveTextLintResults(url, results);
    });
  }).catch((e) => console.log(e));
  return promise;
};

async function saveTextLintResults(url, results) {
  const promises = [];
  const decodedUrl = decodeURI(url);
  // 検証対象のURLの紐づくエラーの削除
  await TextlintMessageRepository.deleteByLoc(decodedUrl);
  if (engine.isErrorResults(results)) {
    // エラーが検出されていれば登録
    for (const message of results[0].messages) {
      promises.push(await TextlintMessageRepository.save(decodedUrl, message));
    }
  }
  return promises;
}

const beautifyOptions = {
  indent_size: 2,
  end_with_newline: true,
  preserve_newlines: false,
  max_preserve_newlines: 0,
  wrap_line_length: 0,
  wrap_attributes_indent_size: 0,
  unformatted: ['b', 'em'],
};

function getBeautifiedHtmlFromUrl(url) {
  const promise = new Promise((resolve, reject) => {
    https.get(url, function(res) {
      let data = '';
      res.on('data', function(stream) {
        data += stream;
      });
      res.on('end', function() {
        resolve(beautify.html(data, beautifyOptions));
      });
    });
  });
  return promise;
}
