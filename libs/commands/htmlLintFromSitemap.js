const {SitemapsRepository, Status} = require('../database/sitemaps.js');
const htmlLintFromUrl = require('./htmlLintFromUrl.js');


module.exports = function() {
    const promise = SitemapsRepository.selectByStatusBeforeHtmlLint();
    // Data更新
    promise.then((results) => htmlLintBulk(results));
    return promise;
}

async function htmlLintOne(elem) {
    let result;
    try {
        await htmlLintFromUrl(new URL(elem.loc).href);
        elem.status = Status.DONE;
        result = await SitemapsRepository.save(elem);
    } catch (err) {
        console.log(err);
        elem.status = Status.FAILED_HTML_LINT;
        result  = await SitemapsRepository.save(elem);
    }
    return result;
}

async function htmlLintBulk(results) {
    for (let elem of results) {
        await htmlLintOne(elem);
    }
}
