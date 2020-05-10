const {TextlintMessageRepository} = require('../database/textLintMessages.js');
const fs = require("fs");

module.exports = function () {
    const promise = TextlintMessageRepository.selectAll().then((rows) => {
        let results = [];
        for (let row of rows) {
            results.push(JSON.stringify(row, replacer));
        }
        fs.writeFileSync("./to_gbq/textlint_messages.json", results.join("\n"));
    });
    return promise;
};

const replacer = function (key, value) {
    if (this[key] instanceof Date) {
        let d = this[key];
        return (d.getFullYear() + '-' + (d.getMonth() + 1)
            + '-' + d.getDate() + ' ' + d.getHours() + ':' + d.getMinutes()
            + ':' + d.getSeconds()).replace(/(\D)(\d)(\b|(?=\D))/g, "$10$2");
    }
    return value;
}
