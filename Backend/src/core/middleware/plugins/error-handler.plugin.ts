import { FastifyError, FastifyPluginAsync } from 'fastify';

const errorHandlerPlugin: FastifyPluginAsync = async (fastify) => {
  const isDevelopment = process.env.NODE_ENV !== 'production';
  
  fastify.setErrorHandler((error: FastifyError, request, reply) => {
    fastify.log.error(error);

    // Ensure CORS headers are added to error responses using raw headers
    // CRITICAL: Always set CORS headers for error responses
    const origin = request.headers.origin;
    
    if (origin) {
      // In development, allow all origins
      if (isDevelopment) {
        reply.raw.setHeader('Access-Control-Allow-Origin', origin);
    reply.raw.setHeader('Access-Control-Allow-Credentials', 'true');
    reply.raw.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
        reply.raw.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Request-ID, Accept, Origin, X-Requested-With');
      } else {
        // In production, only set if origin is allowed
        const allowedOrigins = [
          'https://app.flowversal.com',
          'https://admin.flowversal.com',
          'https://docs.flowversal.com',
          'https://marketing.flowversal.com',
          'https://flowversal.com',
          'https://www.flowversal.com',
        ];
        
        if (allowedOrigins.includes(origin) || /^https:\/\/([a-z0-9-]+\.)?flowversal\.com$/.test(origin)) {
          reply.raw.setHeader('Access-Control-Allow-Origin', origin);
          reply.raw.setHeader('Access-Control-Allow-Credentials', 'true');
          reply.raw.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
          reply.raw.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Request-ID, Accept, Origin, X-Requested-With');
        }
      }
    }

    // Handle validation errors
    if (error.validation) {
      return reply.code(400).send({
        error: 'Validation Error',
        message: error.message,
        details: error.validation,
      });
    }

    // Handle MongoDB errors
    if (error.name === 'MongoError' || error.name === 'MongooseError') {
      return reply.code(500).send({
        error: 'Database Error',
        message: 'An error occurred while accessing the database',
      });
    }

    // Handle custom errors with status code
    if (error.statusCode) {
      const isClientError = error.statusCode >= 400 && error.statusCode < 500;
      return reply.code(error.statusCode).send({
        error: error.name || 'Error',
        // Mask 5xx errors in production unless explicitly exposed
        message: (isClientError || isDevelopment) ? error.message : 'An unexpected error occurred',
        requestId: request.id,
      });
    }

    // Default error response
    return reply.code(500).send({
      error: 'Internal Server Error',
      message: isDevelopment ? error.message : 'An unexpected error occurred',
      requestId: request.id,
    });
  });
};

export default errorHandlerPlugin;

