import { FastifyReply, FastifyRequest } from 'fastify';
import { getSignedUrl, gcsEnabled } from './gcs.service';

export class StorageController {
  async signUpload(request: FastifyRequest, reply: FastifyReply) {
    if (!gcsEnabled) {
      return reply.code(400).send({ success: false, error: 'GCS storage not configured' });
    }

    const userId = (request as any).user?.id;
    if (!userId) {
      return reply.code(401).send({ success: false, error: 'Unauthorized' });
    }

    const body = request.body as {
      fileName: string;
      contentType?: string;
      expiresInSeconds?: number;
      folder?: string;
    };

    if (!body?.fileName) {
      return reply.code(400).send({ success: false, error: 'fileName is required' });
    }

    const objectKey = `${userId}/${body.folder || 'uploads'}/${Date.now()}-${body.fileName}`;

    try {
      const url = await getSignedUrl({
        objectKey,
        contentType: body.contentType,
        expiresInSeconds: body.expiresInSeconds || 900,
        method: 'PUT',
      });

      return reply.send({
        success: true,
        uploadUrl: url,
        objectKey,
      });
    } catch (error: any) {
      return reply.code(500).send({ success: false, error: error.message || 'Failed to sign upload URL' });
    }
  }

  async signDownload(request: FastifyRequest, reply: FastifyReply) {
    if (!gcsEnabled) {
      return reply.code(400).send({ success: false, error: 'GCS storage not configured' });
    }

    const userId = (request as any).user?.id;
    if (!userId) {
      return reply.code(401).send({ success: false, error: 'Unauthorized' });
    }

    const query = request.query as { objectKey?: string; expiresInSeconds?: string };
    if (!query.objectKey) {
      return reply.code(400).send({ success: false, error: 'objectKey is required' });
    }

    // Optional: enforce that objectKey is under user's prefix
    if (!query.objectKey.startsWith(`${userId}/`)) {
      return reply.code(403).send({ success: false, error: 'Forbidden' });
    }

    try {
      const url = await getSignedUrl({
        objectKey: query.objectKey,
        expiresInSeconds: query.expiresInSeconds ? parseInt(query.expiresInSeconds, 10) : 900,
        method: 'GET',
      });

      return reply.send({
        success: true,
        downloadUrl: url,
      });
    } catch (error: any) {
      return reply.code(500).send({ success: false, error: error.message || 'Failed to sign download URL' });
    }
  }
}

export const storageController = new StorageController();

