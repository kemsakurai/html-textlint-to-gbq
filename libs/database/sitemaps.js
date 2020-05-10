const Sequelize = require('sequelize');
const {DataTypes} = require('sequelize');
const Model = Sequelize.Model;
const {getSequelize} = require('./dbUtils.js');
const sequelize = getSequelize();

const Status = {
  BEFORE_HTML_LINT: 'BEFORE_HTML_LINT',
  FAILED_HTML_LINT: 'FAILED_HTML_LINT',
  DONE: 'DONE',
};
exports.Status = Status;

class Sitemap {
  constructor(loc, domain, path, lastmod, status) {
    this.loc = loc;
    this.domain = domain;
    this.path = path;
    this.lastmod = lastmod;
    this.status = status;
  }

  static constructBeforeHtmlLint(loc, domain, path, lastmod) {
    return new Sitemap(loc, domain, path, lastmod, Status.BEFORE_HTML_LINT);
  }

  static constructBySitemapModel(sitemapModel) {
    if (!sitemapModel) {
      return null;
    }
    return new Sitemap(sitemapModel.loc,
        sitemapModel.domain, sitemapModel.path,
        sitemapModel.lastmod, sitemapModel.status);
  }
}

exports.Sitemap = Sitemap;

class SitemapModel extends Model {
}

SitemapModel.init({
  loc: {type: DataTypes.STRING, primaryKey: true},
  domain: {type: DataTypes.STRING},
  path: {type: DataTypes.STRING},
  lastmod: {type: DataTypes.DATE},
  status: {type: Sequelize.ENUM, values: Object.values(Status)},
}, {sequelize, modelName: 'sitemaps'});

class SitemapsRepository {
  static async dropTableIfNotExists() {
    return SitemapModel.drop();
  }

  static async createTableIfNotExists() {
    return SitemapModel.sync();
  }

  static async save(sitemap) {
    return SitemapModel.upsert({
      loc: sitemap.loc,
      domain: sitemap.domain,
      path: sitemap.path,
      lastmod: sitemap.lastmod,
      status: sitemap.status,
    });
  }

  static async selectByLoc(loc) {
    return SitemapModel.findByPk(loc).then((siteMap) => {
      return Sitemap.constructBySitemapModel(siteMap);
    });
  }

  static async selectByStatusBeforeHtmlLint() {
    return this.selectByStatus(Status.BEFORE_HTML_LINT);
  }

  static async selectByStatus(status) {
    const results = [];
    return SitemapModel.findAll({
      where: {
        status: status,
      },
    }).then((sitemapModels) => {
      for (const elem of sitemapModels) {
        results.push(Sitemap.constructBySitemapModel(elem));
      }
      return results;
    });
  }
}

exports.SitemapsRepository = SitemapsRepository;
