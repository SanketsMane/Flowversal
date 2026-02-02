import { FastifyPluginAsync } from 'fastify';
import { retrievalService } from '../../../../services/rag/retrieval.service';
import { documentService } from '../../../../services/rag/document.service';

const ragRoutes: FastifyPluginAsync = async (fastify) => {
  // RAG: Retrieve and generate
  fastify.post<{
    Body: {
      query: string;
      topK?: number;
      minScore?: number;
      modelType?: string;
      remoteModel?: string;
    };
  }>('/query', async (request, reply) => {
    if (!request.user) {
      return reply.code(401).send({
        error: 'Unauthorized',
        message: 'User not authenticated',
      });
    }

    try {
      const response = await retrievalService.retrieveAndGenerate(request.body.query, {
        topK: request.body.topK || 10,
        minScore: request.body.minScore || 0.7,
        userId: request.user.id,
        modelType: request.body.modelType as any,
        remoteModel: request.body.remoteModel as any,
      });

      return reply.send({
        success: true,
        data: response,
      });
    } catch (error: any) {
      fastify.log.error('Error in RAG query:', error);
      return reply.code(500).send({
        error: 'Internal Server Error',
        message: error.message || 'Failed to process RAG query',
      });
    }
  });

  // Process document for RAG
  fastify.post<{
    Body: {
      id: string;
      title: string;
      content: string;
      source?: string;
      metadata?: Record<string, any>;
    };
  }>('/documents', async (request, reply) => {
    if (!request.user) {
      return reply.code(401).send({
        error: 'Unauthorized',
        message: 'User not authenticated',
      });
    }

    try {
      await documentService.processDocument({
        id: request.body.id,
        title: request.body.title,
        content: request.body.content,
        userId: request.user.id,
        source: request.body.source,
        metadata: request.body.metadata,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return reply.code(201).send({
        success: true,
        message: 'Document processed and stored',
      });
    } catch (error: any) {
      fastify.log.error('Error processing document:', error);
      return reply.code(500).send({
        error: 'Internal Server Error',
        message: error.message || 'Failed to process document',
      });
    }
  });

  // Delete document
  fastify.delete<{ Params: { id: string } }>('/documents/:id', async (request, reply) => {
    if (!request.user) {
      return reply.code(401).send({
        error: 'Unauthorized',
        message: 'User not authenticated',
      });
    }

    try {
      await documentService.deleteDocument(request.params.id);

      return reply.send({
        success: true,
        message: 'Document deleted',
      });
    } catch (error: any) {
      fastify.log.error('Error deleting document:', error);
      return reply.code(500).send({
        error: 'Internal Server Error',
        message: error.message || 'Failed to delete document',
      });
    }
  });
};

export default ragRoutes;

