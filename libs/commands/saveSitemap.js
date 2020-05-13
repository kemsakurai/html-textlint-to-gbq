const https = require('https');
const xml2js = require('xml2js');
const parser = new xml2js.Parser({attrkey: 'ATTR'});
const {Sitemap, SitemapsRepository} = require('../database/sitemaps.js');
const {Utils} = require('../utils');

/**
 * メインメソッド
 * @param  {string} url 登録対象のsitemap.xml の url
 * @return {Promise<unknown>}
 */
module.exports = function(url) {
  Utils.stringIsAValidUrl(url);
  const promise = getUrlsFromSitemap(url);
  promise.then((siteMapResults) => {
    const promiseFilterTargetSave = filterTargetSave(siteMapResults);
    promiseFilterTargetSave.then((targets) => {
      for (const target of targets) {
        SitemapsRepository.save(target);
      }
    }).catch((e) => console.log(e));
  }).catch((e) => console.log(e));
  return promise;
};

/**
 * 指定したURLのsitemap.xml をparseし、内容を取得する
 * @param url String SitemapのURL
 * @return {Promise<unknown>}
 */
function getUrlsFromSitemap(url) {
  const promise = new Promise((resolve, reject) => {
    https.get(url, function(res) {
      let data = '';
      res.on('data', function(stream) {
        data += stream;
      });
      res.on('end', function() {
        parser.parseString(data, function(error, result) {
          if (error === null) {
            const results = [];
            for (const elem of result.urlset.url) {
              const sitemap = new Sitemap();
              sitemap.loc = decodeURI(elem.loc[0]);
              const url = new URL(sitemap.loc);
              sitemap.domain = url.host;
              sitemap.path = decodeURI(url.pathname);
              if (elem.lastmod) {
                sitemap.lastmod = elem.lastmod[0];
              } else {
                sitemap.lastmod = elem.lastmod;
              }
              results.push(sitemap);
            }
            resolve(results);
          } else {
            reject(error);
          }
        });
      });
    });
  });
  return promise;
}

async function filterTargetSave(siteMapResults) {
  const results = [];
  for (const siteMapResult of siteMapResults) {
    const sitemap = await SitemapsRepository.selectByLoc(siteMapResult.loc);

    if (!isTargetSave(siteMapResult, sitemap)) {
      continue;
    }
    results.push(Sitemap.constructBeforeHtmlLint(siteMapResult.loc,
        siteMapResult.domain,
        siteMapResult.path,
        siteMapResult.lastmod));
  }
  return results;
}

function isTargetSave(fromSitemap, fromDatabase) {
  if (fromDatabase == null) {
    return true;
  }
  if (fromDatabase.lastmod == null) {
    return true;
  }
  return !(fromSitemap.loc == fromDatabase.loc &&
        fromSitemap.lastmod.getTime() == fromDatabase.lastmod.getTime());
}
