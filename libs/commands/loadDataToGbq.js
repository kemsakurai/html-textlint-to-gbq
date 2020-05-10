const {BigQuery} = require('@google-cloud/bigquery');
const {Storage} = require('@google-cloud/storage');
const bigquery = new BigQuery();
const storage = new Storage();

module.exports = function(bucketName, filename, datasetId, tableId) {
  return loadJSONFromGCS(bucketName, filename, datasetId, tableId);
};

function loadInternal(dataset, tableId, bucketName, filename, metadata) {
  return dataset.table(tableId)
      .load(storage.bucket(bucketName)
          .file(filename), metadata);
}

async function loadJSONFromGCS(bucketName, filename, datasetId, tableId) {
  // https://cloud.google.com/bigquery/docs/reference/rest/v2/Job#JobConfigurationLoad
  const metadata = {
    sourceFormat: 'NEWLINE_DELIMITED_JSON',
    schema: {
      fields: [
        {name: 'loc', type: 'STRING'},
        {name: 'type', type: 'STRING'},
        {name: 'ruleId', type: 'STRING'},
        {name: 'message', type: 'STRING'},
        {name: 'data', type: 'STRING'},
        {name: 'line', type: 'INT64'},
        {name: 'column', type: 'INT64'},
        {name: 'index', type: 'INT64'},
        {name: 'severity', type: 'INT64'},
        {name: 'fix_text', type: 'STRING'},
        {name: 'fix_range_start', type: 'INT64'},
        {name: 'fix_range_end', type: 'INT64'},
        {name: 'createdAt', type: 'DATETIME'},
        {name: 'updatedAt', type: 'DATETIME'},
      ],
    },
    location: 'US',
  };
    // Load data from a Google Cloud Storage file into the table
  const dataset = bigquery.dataset(datasetId);
  const exists = await dataset.exists().then((data) => {
    const exists = data[0];
    return exists;
  });

  let job;

  if (!exists) {
    job = await dataset.create(function(err, dataset, apiResponse) {
      console.log(err, dataset, apiResponse);
      if (!err) {
        return loadInternal(dataset, tableId, bucketName, filename, metadata);
      }
      throw err;
    });
  } else {
    [job] = await loadInternal(dataset, tableId, bucketName, filename, metadata);
  }
  console.log(`Job ${job.id} completed.`);

  // Check the job's status for errors
  const errors = job.status.errors;
  if (errors && errors.length > 0) {
    for (const error of errors) {
      console.log(error);
    }
    throw errors;
  }
}
