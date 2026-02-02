import { FastifyPluginAsync } from 'fastify';
import { storageController } from './storage.controller';
import { storageService } from './storage.service';

const storageRoutes: FastifyPluginAsync = async (fastify) => {
  // Upload file
  fastify.post<{
    Body: {
      bucket: string;
      path: string;
      contentType?: string;
    };
  }>('/upload', async (request, reply) => {
    if (!request.user) {
      return reply.code(401).send({
        error: 'Unauthorized',
        message: 'User not authenticated',
      });
    }

    try {
      // Get file from multipart/form-data
      const data = await request.file();
      if (!data) {
        return reply.code(400).send({
          error: 'Bad Request',
          message: 'No file provided',
        });
      }

      const buffer = await data.toBuffer();

      const result = await storageService.uploadFile({
        bucket: request.body.bucket || 'uploads',
        path: request.body.path || `${request.user.id}/${data.filename}`,
        file: buffer,
        contentType: request.body.contentType || data.mimetype,
      });

      return reply.send({
        success: true,
        data: result,
      });
    } catch (error: any) {
      fastify.log.error('Error uploading file:', error);
      return reply.code(500).send({
        error: 'Internal Server Error',
        message: error.message || 'Failed to upload file',
      });
    }
  });

  // Get file URL
  fastify.get<{
    Querystring: {
      bucket: string;
      path: string;
    };
  }>('/url', async (request, reply) => {
    if (!request.user) {
      return reply.code(401).send({
        error: 'Unauthorized',
        message: 'User not authenticated',
      });
    }

    try {
      const url = storageService.getPublicUrl(request.query.bucket, request.query.path);

      return reply.send({
        success: true,
        data: { url },
      });
    } catch (error: any) {
      fastify.log.error('Error getting file URL:', error);
      return reply.code(500).send({
        error: 'Internal Server Error',
        message: 'Failed to get file URL',
      });
    }
  });

  // List files
  fastify.get<{
    Querystring: {
      bucket: string;
      path?: string;
    };
  }>('/list', async (request, reply) => {
    if (!request.user) {
      return reply.code(401).send({
        error: 'Unauthorized',
        message: 'User not authenticated',
      });
    }

    try {
      const files = await storageService.listFiles(request.query.bucket, request.query.path);

      return reply.send({
        success: true,
        data: files,
      });
    } catch (error: any) {
      fastify.log.error('Error listing files:', error);
      return reply.code(500).send({
        error: 'Internal Server Error',
        message: 'Failed to list files',
      });
    }
  });

  // Delete file
  fastify.delete<{
    Querystring: {
      bucket: string;
      path: string;
    };
  }>('/delete', async (request, reply) => {
    if (!request.user) {
      return reply.code(401).send({
        error: 'Unauthorized',
        message: 'User not authenticated',
      });
    }

    try {
      await storageService.deleteFile(request.query.bucket, request.query.path);

      return reply.send({
        success: true,
        message: 'File deleted successfully',
      });
    } catch (error: any) {
      fastify.log.error('Error deleting file:', error);
      return reply.code(500).send({
        error: 'Internal Server Error',
        message: error.message || 'Failed to delete file',
      });
    }
  });

  // Signed upload URL (GCS)
  fastify.post('/sign-upload', async (request, reply) => {
    return storageController.signUpload(request, reply);
  });

  // Signed download URL (GCS)
  fastify.get('/sign-download', async (request, reply) => {
    return storageController.signDownload(request, reply);
  });
};

export default storageRoutes;

