// apps/web/amplify/backend.ts
// Amplify Gen 2 backend definition: the api Lambda function (Express app)
// and its S3 upload bucket. No Amplify Auth/Data - the app has its own
// JWT auth and talks to an external RDS Postgres via Prisma, not
// Amplify-managed data.
import { defineBackend, secret } from '@aws-amplify/backend';
import { FunctionUrlAuthType } from 'aws-cdk-lib/aws-lambda';
import { Stack } from 'aws-cdk-lib';
import { AnyPrincipal, Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { CfnBucket } from 'aws-cdk-lib/aws-s3';
import { apiFunction } from './functions/api/resource';
import { storage } from './storage/resource';

const backend = defineBackend({
  apiFunction,
  storage,
});

// The api function is a provided (raw CDK) function - see the comment in
// functions/api/resource.ts for why - so its environment/secrets are wired
// here via addEnvironment instead of a `defineFunction({ environment })`
// prop. Set each of these once per branch with `npx ampx sandbox secret set
// <NAME>` (sandbox) or in the Amplify Console under App settings > Secrets
// (deployed branches) before the first deploy.
backend.apiFunction.addEnvironment('DATABASE_URL', secret('DATABASE_URL'));
backend.apiFunction.addEnvironment('JWT_SECRET', secret('JWT_SECRET'));
backend.apiFunction.addEnvironment('SMTP_HOST', secret('SMTP_HOST'));
backend.apiFunction.addEnvironment('SMTP_PORT', secret('SMTP_PORT'));
backend.apiFunction.addEnvironment('SMTP_USER', secret('SMTP_USER'));
backend.apiFunction.addEnvironment('SMTP_PASSWORD', secret('SMTP_PASSWORD'));
backend.apiFunction.addEnvironment('SMTP_SENDER_NAME', secret('SMTP_SENDER_NAME'));
backend.apiFunction.addEnvironment('SMTP_SENDER_EMAIL', secret('SMTP_SENDER_EMAIL'));
backend.apiFunction.addEnvironment('ADMIN_RECIPIENT_EMAIL', secret('ADMIN_RECIPIENT_EMAIL'));

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

// The frontend renders uploaded images (gallery, packages, crew, blogs,
// locations) via that direct public S3 URL - same as the VPS, where
// /uploads is served publicly with no auth. defineStorage's bucket is
// private by default (Block Public Access on), which only lets the api
// Lambda itself read/write it, so uploaded images 403 for anyone else.
// Allow public GetObject on the same folders the Lambda has write access to
// (see storage/resource.ts), and relax the bucket's public-access-block
// settings just enough for that policy to take effect - object ACLs stay
// blocked since we don't use them, only this bucket policy.
const cfnBucket = bucket.node.defaultChild as CfnBucket;
cfnBucket.publicAccessBlockConfiguration = {
  blockPublicAcls: true,
  ignorePublicAcls: true,
  blockPublicPolicy: false,
  restrictPublicBuckets: false,
};
const publicUploadFolders = ['gallery', 'packages', 'crew', 'blogs', 'locations'];
bucket.addToResourcePolicy(
  new PolicyStatement({
    sid: 'PublicReadUploads',
    effect: Effect.ALLOW,
    principals: [new AnyPrincipal()],
    actions: ['s3:GetObject'],
    resources: publicUploadFolders.map((folder) => bucket.arnForObjects(`${folder}/*`)),
  })
);

// Expose the Express app over a plain HTTPS Function URL. No CORS config
// here on purpose: the app already sets its own CORS headers via
// `cors({ origin: "*" })` in apps/api/src/app.ts (same as the VPS). Setting
// CORS at both the Function URL and the app layer makes API Gateway/Lambda
// merge both Access-Control-Allow-Origin headers into one comma-separated
// value, which browsers reject outright.
const apiFunctionUrl = backend.apiFunction.resources.lambda.addFunctionUrl({
  authType: FunctionUrlAuthType.NONE,
});

backend.addOutput({
  custom: {
    apiUrl: apiFunctionUrl.url,
  },
});
