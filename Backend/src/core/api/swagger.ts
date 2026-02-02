import { FastifyPluginAsync } from 'fastify';
import swagger from '@fastify/swagger';
import swaggerUI from '@fastify/swagger-ui';
import { env } from '../config/env';

const swaggerConfig: FastifyPluginAsync = async (fastify) => {
  // Register Swagger/OpenAPI documentation
  await fastify.register(swagger, {
    openapi: {
      openapi: '3.0.3',
      info: {
        title: 'FlowversalAI API',
        description: 'Enterprise workflow automation platform API',
        version: '2.0.0',
        contact: {
          name: 'FlowversalAI Support',
          email: 'support@flowversal.ai',
          url: 'https://flowversal.ai',
        },
        license: {
          name: 'MIT',
          url: 'https://opensource.org/licenses/MIT',
        },
      },
      servers: [
        {
          url: env.NODE_ENV === 'production' ? 'https://api.flowversal.ai' : `http://localhost:${env.PORT}`,
          description: env.NODE_ENV === 'production' ? 'Production server' : 'Development server',
        },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            description: 'JWT token obtained from /api/v1/auth/login',
          },
          apiKeyAuth: {
            type: 'apiKey',
            in: 'header',
            name: 'X-API-Key',
            description: 'API key for service-to-service authentication',
          },
        },
      },
      security: [
        { bearerAuth: [] },
        { apiKeyAuth: [] },
      ],
      tags: [
        {
          name: 'Workflows',
          description: 'Workflow management endpoints',
        },
        {
          name: 'Tasks',
          description: 'Task management endpoints',
        },
        {
          name: 'Projects',
          description: 'Project management endpoints',
        },
        {
          name: 'Health',
          description: 'Health check and monitoring endpoints',
        },
      ],
    },
  });

  // Register Swagger UI
  await fastify.register(swaggerUI, {
    routePrefix: '/documentation',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: false,
      defaultModelsExpandDepth: 2,
      defaultModelExpandDepth: 2,
    },
    staticCSP: true,
    transformStaticCSP: (header) => header,
    uiHooks: {
      onRequest: function (request, reply, next) {
        next();
      },
      preHandler: function (request, reply, next) {
        next();
      },
    },
  });
};

export default swaggerConfig;

