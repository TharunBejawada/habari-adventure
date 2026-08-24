// apps/web/amplify/functions/api/resource.ts
// Defines the Lambda function that runs the Express API (apps/api), wrapped
// with serverless-http (see apps/api/src/lambda.ts). DATABASE_URL and
// JWT_SECRET are pulled from Amplify secrets - set them once per branch
// with `npx ampx sandbox secret set <NAME>` (sandbox) or in the Amplify
// Console under App settings > Secrets (deployed branches) before the
// first deploy. CLOUD_STORAGE_* variables are wired in from the storage
// resource in backend.ts, not set here.
import { defineFunction, secret } from '@aws-amplify/backend';

export const apiFunction = defineFunction({
  name: 'api',
  // Points at the Express app in the separate `api` workspace so the
  // existing controllers/routes/prisma setup are reused as-is.
  entry: '../../../../apps/api/src/lambda.ts',
  timeoutSeconds: 30,
  memoryMB: 512,
  environment: {
    DATABASE_URL: secret('DATABASE_URL'),
    JWT_SECRET: secret('JWT_SECRET'),
    SMTP_HOST: secret('SMTP_HOST'),
    SMTP_PORT: secret('SMTP_PORT'),
    SMTP_USER: secret('SMTP_USER'),
    SMTP_PASSWORD: secret('SMTP_PASSWORD'),
    SMTP_SENDER_NAME: secret('SMTP_SENDER_NAME'),
    SMTP_SENDER_EMAIL: secret('SMTP_SENDER_EMAIL'),
    ADMIN_RECIPIENT_EMAIL: secret('ADMIN_RECIPIENT_EMAIL'),
  },
});
