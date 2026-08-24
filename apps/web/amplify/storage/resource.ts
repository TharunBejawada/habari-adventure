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
  access: (allow) => ({
    'uploads/*': [allow.resource(apiFunction).to(['read', 'write', 'delete'])],
  }),
});
