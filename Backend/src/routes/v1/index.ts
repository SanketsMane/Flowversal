import { FastifyPluginAsync } from 'fastify';

const v1Routes: FastifyPluginAsync = async (fastify) => {
  // V1 routes are registered in the main routes/index.ts file
  // This file exists for future API versioning structure
  // Individual route modules are registered directly in routes/index.ts
};

export default v1Routes;

