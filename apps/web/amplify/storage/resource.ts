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
  // frontend's `folder` field, at the bucket root - not nested under
  // "uploads/". Amplify's storage access paths can't start with "/" or be a
  // bare wildcard (both rejected by validation), so there's no single
  // pattern for "the whole bucket" - list every folder the frontend
  // actually sends (grep `formData.append("folder", ...)` across apps/web
  // if this list ever needs updating).
  access: (allow) => ({
    'gallery/*': [allow.resource(apiFunction).to(['read', 'write', 'delete'])],
    'packages/*': [allow.resource(apiFunction).to(['read', 'write', 'delete'])],
    'crew/*': [allow.resource(apiFunction).to(['read', 'write', 'delete'])],
    'blogs/*': [allow.resource(apiFunction).to(['read', 'write', 'delete'])],
    'locations/*': [allow.resource(apiFunction).to(['read', 'write', 'delete'])],
  }),
});
