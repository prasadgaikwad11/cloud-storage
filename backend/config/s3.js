const { S3Client } = require('@aws-sdk/client-s3');

/**
 * Initialize and export the AWS S3 client
 * Uses credentials from environment variables for security
 */
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

module.exports = s3Client;
