import { env } from '../../core/config/env';

const hasGcsCreds = !!(env.GCS_BUCKET && env.GCS_PROJECT_ID && env.GCS_CLIENT_EMAIL && env.GCS_PRIVATE_KEY);

export const gcsEnabled = hasGcsCreds;

let storage: any = null;
let bucket: any = null;

// Only initialize GCS if credentials are available
if (hasGcsCreds) {
  try {
    // Dynamic import to avoid requiring the package when not configured
    const { Storage } = require('@google-cloud/storage');
    storage = new Storage({
      projectId: env.GCS_PROJECT_ID,
      credentials: {
        client_email: env.GCS_CLIENT_EMAIL,
        private_key: env.GCS_PRIVATE_KEY.replace(/\\n/g, '\n'),
      },
    });
    bucket = storage.bucket(env.GCS_BUCKET);
  } catch (error) {
    console.warn('GCS package not available, GCS features will be disabled');
  }
}

export interface SignedUrlParams {
  objectKey: string;
  contentType?: string;
  expiresInSeconds?: number;
  method?: 'GET' | 'PUT';
}

export async function getSignedUrl(params: SignedUrlParams): Promise<string> {
  if (!bucket || !storage) {
    throw new Error('GCS not configured');
  }

  const { objectKey, contentType, expiresInSeconds = 900, method = 'PUT' } = params; // default 15 minutes

  const [url] = await bucket.file(objectKey).getSignedUrl({
    version: 'v4',
    action: method === 'GET' ? 'read' : 'write',
    expires: Date.now() + expiresInSeconds * 1000,
    contentType,
  });

  return url;
}

export async function objectExists(objectKey: string): Promise<boolean> {
  if (!bucket) return false;
  const [exists] = await bucket.file(objectKey).exists();
  return exists;
}

