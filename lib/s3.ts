
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { createS3Client, getBucketConfig } from './aws-config';

// Lazy getter for S3 configuration
function getConfig() {
  const { bucketName, folderPrefix } = getBucketConfig();
  const region = process.env.AWS_REGION || 'us-east-1';
  return { bucketName, folderPrefix, region };
}

// Generate presigned upload URL for client-side uploads
export async function generatePresignedUploadUrl(fileName: string, contentType: string, isPublic = true): Promise<{ uploadUrl: string; cloudStoragePath: string }> {
  try {
    const { bucketName, folderPrefix } = getConfig();
    const s3Client = createS3Client();
    const timestamp = Date.now();
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const cloudStoragePath = isPublic 
      ? `${folderPrefix}public/products/${timestamp}-${sanitizedFileName}`
      : `${folderPrefix}uploads/${timestamp}-${sanitizedFileName}`;
    
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: cloudStoragePath,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    
    return { uploadUrl, cloudStoragePath };
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    throw new Error('Failed to generate upload URL');
  }
}

// Get file URL (public or signed)
export async function getFileUrl(cloudStoragePath: string, isPublic = true): Promise<string> {
  try {
    const { bucketName, region } = getConfig();
    if (isPublic) {
      // Return public URL for publicly accessible files
      return `https://${bucketName}.s3.${region}.amazonaws.com/${cloudStoragePath}`;
    } else {
      // Generate signed URL for private files
      const s3Client = createS3Client();
      const command = new GetObjectCommand({
        Bucket: bucketName,
        Key: cloudStoragePath
      });
      return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    }
  } catch (error) {
    console.error('Error getting file URL:', error);
    throw new Error('Failed to get file URL');
  }
}

// Upload file directly (for server-side uploads)
export async function uploadFile(buffer: Buffer, fileName: string, isPublic = true): Promise<string> {
  try {
    const { bucketName, folderPrefix } = getConfig();
    const s3Client = createS3Client();
    const timestamp = Date.now();
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const key = isPublic 
      ? `${folderPrefix}public/products/${timestamp}-${sanitizedFileName}`
      : `${folderPrefix}uploads/${timestamp}-${sanitizedFileName}`;
    
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: buffer,
      ContentType: 'image/jpeg'
    });

    await s3Client.send(command);
    return key;
  } catch (error) {
    console.error('Error uploading file to S3:', error);
    throw new Error('Failed to upload file');
  }
}

export async function downloadFile(key: string): Promise<string> {
  try {
    const { bucketName } = getConfig();
    const s3Client = createS3Client();
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: key
    });

    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    return signedUrl;
  } catch (error) {
    console.error('Error generating signed URL:', error);
    throw new Error('Failed to generate download URL');
  }
}

export async function deleteFile(key: string): Promise<void> {
  try {
    const { bucketName } = getConfig();
    const s3Client = createS3Client();
    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key
    });

    await s3Client.send(command);
  } catch (error) {
    console.error('Error deleting file from S3:', error);
    throw new Error('Failed to delete file');
  }
}
