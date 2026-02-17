import { env } from '../../core/config/env';

export interface UploadFileOptions {
  bucket: string;
  path: string;
  file: Buffer | Uint8Array;
  contentType?: string;
  metadata?: Record<string, string>;
}

export interface FileMetadata {
  name: string;
  id: string;
  updated_at: string;
  created_at: string;
  last_accessed_at: string;
  metadata: Record<string, any>;
}

export class StorageService {
  private storage: any = null;
  private gcsBucket: any = null;
  private enabled: boolean = false;

  constructor() {
    const hasGcsCreds = !!(env.GCS_BUCKET && env.GCS_PROJECT_ID && env.GCS_CLIENT_EMAIL && env.GCS_PRIVATE_KEY);
    if (hasGcsCreds) {
      try {
        const { Storage } = require('@google-cloud/storage');
        this.storage = new Storage({
          projectId: env.GCS_PROJECT_ID,
          credentials: {
            client_email: env.GCS_CLIENT_EMAIL,
            private_key: env.GCS_PRIVATE_KEY.replace(/\\n/g, '\n'),
          },
        });
        this.gcsBucket = this.storage.bucket(env.GCS_BUCKET);
        this.enabled = true;
      } catch (error) {
        console.warn('[StorageService] GCS initialization failed:', error);
      }
    }
  }

  /**
   * Upload file to GCS
   * Author: Sanket - Moved from Supabase to GCS 🛡️
   */
  async uploadFile(options: UploadFileOptions): Promise<{ path: string; url: string }> {
    if (!this.enabled) {
      throw new Error('Storage service not configured (GCS)');
    }

    const { bucket: _bucket, path, file, contentType, metadata } = options;
    const fileHandle = this.gcsBucket.file(path);

    await fileHandle.save(file, {
      contentType: contentType || 'application/octet-stream',
      metadata: metadata,
      resumable: false,
    });

    return {
      path,
      url: `https://storage.googleapis.com/${env.GCS_BUCKET}/${path}`,
    };
  }

  /**
   * Download file from GCS
   */
  async downloadFile(bucket: string, path: string): Promise<Buffer> {
    if (!this.enabled) throw new Error('Storage service not configured');
    const [content] = await this.gcsBucket.file(path).download();
    return content;
  }

  /**
   * Delete file from GCS
   */
  async deleteFile(bucket: string, path: string): Promise<void> {
    if (!this.enabled) throw new Error('Storage service not configured');
    await this.gcsBucket.file(path).delete();
  }

  /**
   * List files in a bucket (GCS implementation)
   */
  async listFiles(bucket: string, prefix?: string): Promise<FileMetadata[]> {
    if (!this.enabled) throw new Error('Storage service not configured');
    const [files] = await this.gcsBucket.getFiles({ prefix });
    
    return files.map((file: any) => ({
      name: file.name,
      id: file.id || file.name,
      updated_at: file.metadata.updated,
      created_at: file.metadata.timeCreated,
      last_accessed_at: file.metadata.updated,
      metadata: file.metadata || {},
    }));
  }

  /**
   * Get public URL for a file
   */
  getPublicUrl(bucket: string, path: string): string {
    return `https://storage.googleapis.com/${env.GCS_BUCKET}/${path}`;
  }
}

export const storageService = new StorageService();
