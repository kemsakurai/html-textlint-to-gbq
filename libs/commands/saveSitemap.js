const https = require('https');
const xml2js = require('xml2js');
const parser = new xml2js.Parser({attrkey: 'ATTR'});
const {Sitemap, SitemapsRepository} = require('../database/sitemaps.js');
const {Utils} = require('../utils');

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
              const sitemapElement = {};
              sitemapElement.loc = decodeURI(elem.loc[0]);
              const url = new URL(sitemapElement.loc);
              sitemapElement.domain = url.host;
              sitemapElement.path = decodeURI(url.pathname);
              if (elem.lastmod) {
                sitemapElement.lastmod = elem.lastmod[0];
              } else {
                sitemapElement.lastmod = elem.lastmod;
              }
              results.push(sitemapElement);
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
    if (sitemap && sitemap.loc === siteMapResult.loc &&
        (!sitemap.lastmod || sitemap.lastmod === siteMapResult.lastmod)) {
      continue;
    }
    results.push(Sitemap.constructBeforeHtmlLint(siteMapResult.loc,
        siteMapResult.domain,
        siteMapResult.path,
        siteMapResult.lastmod));
  }
  return results;
}
