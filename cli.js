const {program} = require('commander');
const initialize = require('./libs/commands/initialize.js');
const saveSitemap = require('./libs/commands/saveSitemap.js');
const htmlLintFromSitemap = require('./libs/commands/htmlLintFromSitemap.js');
const htmlLintFromUrl = require('./libs/commands/htmlLintFromUrl.js');
const dumpHtmlLintMessages = require('./libs/commands/dumpHtmlLintMessages.js');
const uploadDataToGcs = require('./libs/commands/uploadDataToGcs.js');
const loadDataToGbq = require('./libs/commands/loadDataToGbq');

program.command('init')
    .description('Initialize a sqlite database.')
    .action(initialize);

program.command('saveSitemap <url>')
    .description('Save Sitemap specified by argument to database.')
    .action(saveSitemap);

program.command('htmlLintFromSitemap')
    .description('Lint HTML from saved sitemap\'s data.')
    .action(htmlLintFromSitemap);

program.command('htmlLintFromUrl <url>')
    .description('Lint HTML specified by argument.')
    .action(htmlLintFromUrl);

program.command('dumpHtmlLintMessages')
    .description('Dump json HTML lint messages.')
    .action(dumpHtmlLintMessages);

program.command('uploadDataToGcs <bucketName>')
    .description('Upload HTML lint messages json to Google CLoud Storage.')
    .option('-d, --destination <destination>', 'Upload file destination')
    .on('option:destination', (destination) => {
      process.env['destination'] = destination;
    })
    .action(uploadDataToGcs);

program.command('loadDataToGbq <bucketName> <filename>, <datasetId>, <tableId>')
    .description('Load HTML lint messages json to Google BigQuery.')
    .action(loadDataToGbq);

program.parse(process.argv);
