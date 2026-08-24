// apps/api/src/utils/storage.ts
// Pluggable file storage. Defaults to the existing local-disk behavior
// (production VPS / EC2) and switches to S3 only when CLOUD_STORAGE_BUCKET
// is configured (the Lambda/Amplify deployment). On Lambda, no explicit
// credentials are needed - the function's IAM execution role covers it;
// CLOUD_STORAGE_ACCESS_KEY_ID/SECRET are only for non-Lambda hosts that
// need to authenticate against S3 explicitly.
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

const bucket = process.env.CLOUD_STORAGE_BUCKET;

export const isCloudStorageEnabled = !!bucket;

const s3 = isCloudStorageEnabled
  ? new S3Client({
      region: process.env.CLOUD_STORAGE_REGION || "us-east-1",
      ...(process.env.CLOUD_STORAGE_ENDPOINT
        ? { endpoint: process.env.CLOUD_STORAGE_ENDPOINT, forcePathStyle: true }
        : {}),
      ...(process.env.CLOUD_STORAGE_ACCESS_KEY_ID && process.env.CLOUD_STORAGE_SECRET_ACCESS_KEY
        ? {
            credentials: {
              accessKeyId: process.env.CLOUD_STORAGE_ACCESS_KEY_ID,
              secretAccessKey: process.env.CLOUD_STORAGE_SECRET_ACCESS_KEY,
            },
          }
        : {}),
    })
  : null;

export async function uploadToCloud(buffer: Buffer, key: string, contentType: string): Promise<string> {
  if (!s3 || !bucket) throw new Error("Cloud storage is not configured");

  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    })
  );

  const publicBase = (process.env.CLOUD_STORAGE_PUBLIC_URL || "").replace(/\/$/, "");
  return `${publicBase}/${key}`;
}

export async function deleteFromCloud(key: string): Promise<void> {
  if (!s3 || !bucket) return;
  await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
}
