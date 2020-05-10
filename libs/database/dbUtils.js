const Sequelize = require('sequelize');
let sequelize;
class DBCommon {
  static getSequelize() {
    if (!sequelize) {
      sequelize = new Sequelize({
        dialect: 'sqlite',
        storage: 'db.sqlite',
      });
    }
    return sequelize;
  }
}
exports.getSequelize = DBCommon.getSequelize;
