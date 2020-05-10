const Sequelize = require('sequelize');
const {DataTypes} = require('sequelize');
const Model = Sequelize.Model;
const {getSequelize} = require('./dbUtils.js');
const sequelize = getSequelize();

class TextlintMessageModel extends Model {}
TextlintMessageModel.init({
  loc: {type: DataTypes.STRING, primaryKey: true},
  type: {type: DataTypes.STRING, primaryKey: true},
  ruleId: {type: DataTypes.STRING, primaryKey: true},
  message: {type: DataTypes.STRING},
  data: {type: DataTypes.TEXT, allowNull: true},
  line: {type: DataTypes.INTEGER},
  column: {type: DataTypes.INTEGER},
  index: {type: DataTypes.INTEGER, primaryKey: true},
  severity: {type: DataTypes.INTEGER},
  fix_text: {type: DataTypes.STRING, allowNull: true},
  fix_range_start: {type: DataTypes.INTEGER, allowNull: true},
  fix_range_end: {type: DataTypes.INTEGER, allowNull: true},
}, {sequelize,
  indexes: [
    {
      fields: ['loc'],
    },
  ],
  modelName: 'textlint_messages'});

class TextlintMessageRepository {
  static async dropTableIfNotExists() {
    return TextlintMessageModel.drop();
  }

  static async createTableIfNotExists() {
    return TextlintMessageModel.sync();
  }

  static async selectAll() {
    return TextlintMessageModel.findAll();
  }

  static async save(loc, textlintMessage) {
    return TextlintMessageModel.upsert({
      loc: loc,
      type: textlintMessage.type,
      ruleId: textlintMessage.ruleId,
      message: textlintMessage.message,
      data: JSON.stringify(textlintMessage.data),
      line: textlintMessage.line,
      column: textlintMessage.column,
      index: textlintMessage.index,
      severity: textlintMessage.severity,
      fix_text: textlintMessage.fix ? textlintMessage.fix.text : null,
      fix_range_start: textlintMessage.fix ? textlintMessage.fix.range[0] : null,
      fix_range_end: textlintMessage.fix ? textlintMessage.fix.range[1] : null,
    });
  }

  static async deleteByLoc(loc) {
    return TextlintMessageModel.destroy({
      where: {
        loc: loc,
      },
    });
  }
}

exports.TextlintMessageRepository = TextlintMessageRepository;
