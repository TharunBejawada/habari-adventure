// apps/web/amplify/storage/resource.ts
// S3 bucket for uploaded assets (packages, locations, blogs, gallery, crew
// images/videos). Only the api Lambda function needs direct access - the
// frontend never talks to S3 directly, it goes through the API's /upload
// endpoint, same as the local-disk flow on the VPS today.
import { defineStorage } from '@aws-amplify/backend';
import { apiFunction } from '../functions/api/resource';

export const storage = defineStorage({
  name: 'habariUploads',
  isDefault: true,
  // uploadController.ts writes to folders named directly after the
  // frontend's `folder` field (gallery/, packages/, crew/, blogs/, ...) at
  // the bucket root, not nested under "uploads/" - so scope this to the
  // whole bucket rather than a prefix that doesn't match any real key.
  access: (allow) => ({
    '*': [allow.resource(apiFunction).to(['read', 'write', 'delete'])],
  }),
});
