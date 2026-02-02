import { supabaseStorage } from '../../core/config/supabase.config';

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
  /**
   * Upload file to Supabase Storage
   */
  async uploadFile(options: UploadFileOptions): Promise<{ path: string; url: string }> {
    const { bucket, path, file, contentType, metadata } = options;

    const { data, error } = await supabaseStorage.from(bucket).upload(path, file, {
      contentType: contentType || 'application/octet-stream',
      upsert: true,
      metadata: metadata,
    });

    if (error) {
      throw new Error(`File upload failed: ${error.message}`);
    }

    // Get public URL
    const { data: urlData } = supabaseStorage.from(bucket).getPublicUrl(path);

    return {
      path: data.path,
      url: urlData.publicUrl,
    };
  }

  /**
   * Download file from Supabase Storage
   */
  async downloadFile(bucket: string, path: string): Promise<Buffer> {
    const { data, error } = await supabaseStorage.from(bucket).download(path);

    if (error) {
      throw new Error(`File download failed: ${error.message}`);
    }

    return Buffer.from(await data.arrayBuffer());
  }

  /**
   * Delete file from Supabase Storage
   */
  async deleteFile(bucket: string, path: string): Promise<void> {
    const { error } = await supabaseStorage.from(bucket).remove([path]);

    if (error) {
      throw new Error(`File deletion failed: ${error.message}`);
    }
  }

  /**
   * List files in a bucket
   */
  async listFiles(bucket: string, path?: string): Promise<FileMetadata[]> {
    const { data, error } = await supabaseStorage.from(bucket).list(path || '', {
      limit: 100,
      offset: 0,
    });

    if (error) {
      throw new Error(`File listing failed: ${error.message}`);
    }

    return (data || []).map((file: any) => ({
      name: file.name,
      id: file.id,
      updated_at: file.updated_at,
      created_at: file.created_at,
      last_accessed_at: file.last_accessed_at,
      metadata: file.metadata || {},
    }));
  }

  /**
   * Get public URL for a file
   */
  getPublicUrl(bucket: string, path: string): string {
    const { data } = supabaseStorage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  }
}

export const storageService = new StorageService();

