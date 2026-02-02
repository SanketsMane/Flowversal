import { FastifyPluginAsync } from 'fastify';

const v2Routes: FastifyPluginAsync = async (fastify) => {
  // V2 routes will be implemented here
  // For now, this is a placeholder for future API version

  fastify.get('/status', async (request, reply) => {
    return reply.send({
      version: '2.0.0',
      status: 'active',
      message: 'API v2 is available',
    });
  });
};

export default v2Routes;

