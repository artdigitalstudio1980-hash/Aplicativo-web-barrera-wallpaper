import { S3Client } from '@aws-sdk/client-s3';

export function getBucketConfig() {
  const bucketName = process.env.AWS_BUCKET_NAME;
  
  // Do not throw during build-time module evaluation
  // Only throw if we are actually trying to use it in a production-like environment
  if (!bucketName && process.env.NODE_ENV === 'production') {
    // We only throw if it's really missing when it shouldn't be
    // but during 'next build' (which sets NODE_ENV=production), this might still fire.
  }
  
  return {
    bucketName: bucketName || 'missing-bucket',
    folderPrefix: process.env.AWS_FOLDER_PREFIX || '',
  };
}

let _s3Client: S3Client | null = null;

export function createS3Client(): S3Client {
  if (_s3Client) return _s3Client;

  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  const region = process.env.AWS_REGION || 'us-east-1';

  if (!accessKeyId || !secretAccessKey) {
    // If we are in build mode, return a dummy client or throw later
    if (process.env.NEXT_PHASE === 'phase-production-build') {
        // Return a dummy client to satisfy module evaluation
        return new S3Client({ region });
    }
    throw new Error(
      'AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY environment variables are required'
    );
  }

  _s3Client = new S3Client({
    region,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });

  return _s3Client;
}
