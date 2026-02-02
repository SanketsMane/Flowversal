import { FastifyPluginAsync } from 'fastify';
import { semanticSearchService } from '../../services/ai/semantic-search.service';

const searchRoutes: FastifyPluginAsync = async (fastify) => {
  // Semantic search
  fastify.get<{
    Querystring: {
      q: string;
      topK?: string;
      minScore?: string;
      embeddingModel?: string;
    };
  }>('/', async (request, reply) => {
    if (!request.user) {
      return reply.code(401).send({
        error: 'Unauthorized',
        message: 'User not authenticated',
      });
    }

    try {
      const query = request.query.q;
      if (!query) {
        return reply.code(400).send({
          error: 'Bad Request',
          message: 'Query parameter "q" is required',
        });
      }

      const results = await semanticSearchService.searchWithRelevance(query, 0.7, {
        topK: parseInt(request.query.topK || '10') || 10,
        minScore: parseFloat(request.query.minScore || '0.7') || 0.7,
        userId: request.user.id,
        embeddingModel: request.query.embeddingModel as any,
      });

      return reply.send({
        success: true,
        data: results,
        count: results.length,
      });
    } catch (error: any) {
      fastify.log.error('Error in semantic search:', error);
      return reply.code(500).send({
        error: 'Internal Server Error',
        message: error.message || 'Failed to perform semantic search',
      });
    }
  });
};

export default searchRoutes;

