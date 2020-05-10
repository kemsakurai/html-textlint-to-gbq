const {Storage} = require('@google-cloud/storage');
const storage = new Storage();
const path = require('path');
const filename ='./to_gbq/textlint_messages.json';


module.exports = function (bucketName) {
    let destination = process.env["destination"];
    if (!destination) {
        destination = path.basename(filename);
    }
    const bucket = storage.bucket(bucketName);
    const promise = bucket.exists().then(function(data) {
        const exists = data[0];
        if(!exists) {
            bucket.create(function(err, bucket, apiResponse) {
                console.log(err, bucket, apiResponse);
                if (!err) {
                    uploadTo(bucket, bucketName, destination);
                }
            });
        } else {
            uploadTo(bucket, bucketName, destination);
        }
    });
    return promise;
};

function uploadTo(bucket, bucketName, destination) {
    bucket.upload(filename, {destination: destination, gzip: true}).then(res => {
        console.log(res[0].metadata);
        console.log(`${filename} uploaded to ${bucketName}.`);
    }).catch(err => {
        console.error('ERROR:', err);
    });
}
