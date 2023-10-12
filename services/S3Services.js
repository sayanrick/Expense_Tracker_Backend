const AWS = require('aws-sdk');


exports.uploadToS3 = (data, filename) => {
    const BUCKET_NAME = 'expensetrackingapp99';
    const IAM_USER_KEY = 'AKIA3Z35PKBNW4P5NHVK';
    const IAM_USER_SECRET = '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';
  
    let s3bucket = new AWS.S3({
      accessKeyId: IAM_USER_KEY,
      secretAccessKey: IAM_USER_SECRET,
      Bucket: BUCKET_NAME
    })
  
      var params = {
        Bucket: BUCKET_NAME,
        Key: filename,
        Body: data,
        ACL: 'public-read'
      }
  
      return new Promise((resolve, reject) => {
        s3bucket.upload(params, (err, s3response) => {
          if(err){
            console.log('Something went wrong', err);
            reject(err);
          }else {
            console.log('success', s3response);
            resolve(s3response.Location);
          }
        })
      })
      
  }