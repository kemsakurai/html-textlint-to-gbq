const {SitemapsRepository} = require('../database/sitemaps.js');
const {TextlintMessageRepository} = require('../database/textLintMessages.js');

module.exports = function() {
  const promise = SitemapsRepository.dropTableIfNotExists().then(() => {
    SitemapsRepository.createTableIfNotExists();
    TextlintMessageRepository.dropTableIfNotExists().then(() => {
      TextlintMessageRepository.createTableIfNotExists();
    });
  });
  return promise;
};
