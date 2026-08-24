// apps/web/amplify/backend.ts
// Amplify Gen 2 backend definition: the api Lambda function (Express app)
// and its S3 upload bucket. No Amplify Auth/Data - the app has its own
// JWT auth and talks to an external RDS Postgres via Prisma, not
// Amplify-managed data.
import { defineBackend } from '@aws-amplify/backend';
import { FunctionUrlAuthType, HttpMethod } from 'aws-cdk-lib/aws-lambda';
import { Stack } from 'aws-cdk-lib';
import { apiFunction } from './functions/api/resource';
import { storage } from './storage/resource';

const backend = defineBackend({
  apiFunction,
  storage,
});

// Give the function the bucket name/region it needs to build S3 keys and
// URLs (see apps/api/src/utils/storage.ts) - IAM permissions themselves
// come from the `access` callback in amplify/storage/resource.ts.
const bucket = backend.storage.resources.bucket;
backend.apiFunction.addEnvironment('CLOUD_STORAGE_BUCKET', bucket.bucketName);
backend.apiFunction.addEnvironment('CLOUD_STORAGE_REGION', Stack.of(bucket).region);
// Bucket's own regional endpoint - swap for a CloudFront domain later if
// the client wants a CDN in front of uploads.
backend.apiFunction.addEnvironment(
  'CLOUD_STORAGE_PUBLIC_URL',
  `https://${bucket.bucketName}.s3.${Stack.of(bucket).region}.amazonaws.com`
);

// Expose the Express app over a plain HTTPS Function URL. CORS mirrors the
// app's own existing `cors({ origin: "*" })` in apps/api/src/app.ts.
const apiFunctionUrl = backend.apiFunction.resources.lambda.addFunctionUrl({
  authType: FunctionUrlAuthType.NONE,
  cors: {
    allowedOrigins: ['*'],
    allowedMethods: [HttpMethod.GET, HttpMethod.POST, HttpMethod.PUT, HttpMethod.DELETE],
    allowedHeaders: ['*'],
  },
});

backend.addOutput({
  custom: {
    apiUrl: apiFunctionUrl.url,
  },
});
