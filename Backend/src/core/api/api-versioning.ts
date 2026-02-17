import { FastifyPluginAsync, FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';
import { metrics, ObservableGauge, Meter, Counter, Histogram, MetricOptions } from '@opentelemetry/api';

// Re-export OpenTelemetry metrics types for convenience
export { Counter, Histogram, MetricOptions, ObservableGauge, Meter } from '@opentelemetry/api';

export interface ApiVersioningConfig {
  defaultVersion: string;
  supportedVersions: string[];
  headerName?: string;
  queryParamName?: string;
}

const apiVersioning: FastifyPluginAsync<ApiVersioningConfig> = async (
  fastify,
  options = { defaultVersion: 'v1', supportedVersions: ['v1'] }
) => {
  const config: Required<ApiVersioningConfig> = {
    headerName: 'Accept-Version',
    queryParamName: 'api-version',
    ...options,
  };

  // Add version constraint to route options
  fastify.addConstraintStrategy({
    name: 'version',
    storage: function () {
      const versions = new Map<string, any>();
      return {
        get: (version: any) => {
          return versions.get(version) || null;
        },
        set: (version: any, store: any) => {
          versions.set(version, store);
        },
      };
    },
    deriveConstraint: (request: any, context: any) => {
      // Extract version from header
      let version = request.headers[config.headerName.toLowerCase()] as string;

      // If not in header, check query parameter
      if (!version) {
        version = (request as any).query?.[config.queryParamName];
      }

      // If still no version, use default
      if (!version) {
        version = config.defaultVersion;
      }

      // Validate version
      if (!config.supportedVersions.includes(version)) {
        throw new Error(`Unsupported API version: ${version}. Supported versions: ${config.supportedVersions.join(', ')}`);
      }

      return version;
    },

  });

  // Middleware to add version information to requests
  fastify.addHook('preHandler', async (request: FastifyRequest, reply: FastifyReply) => {
    let version = request.headers[config.headerName.toLowerCase()] as string;

    if (!version) {
      version = (request.query as any)?.[config.queryParamName];
    }

    if (!version) {
      version = config.defaultVersion;
    }

    // Add version to request object
    (request as any).apiVersion = version;

    // Add version header to response
    reply.header('X-API-Version', version);
  });

  // Version info endpoint
  fastify.get('/api/versions', {
    schema: {
      description: 'Get API version information',
      tags: ['API', 'Versioning'],
      response: {
        200: {
          type: 'object',
          properties: {
            currentVersion: { type: 'string' },
            defaultVersion: { type: 'string' },
            supportedVersions: {
              type: 'array',
              items: { type: 'string' },
            },
            headerName: { type: 'string' },
            queryParamName: { type: 'string' },
          },
        },
      },
    },
  }, async (request, reply) => {
    return reply.send({
      currentVersion: (request as any).apiVersion,
      defaultVersion: config.defaultVersion,
      supportedVersions: config.supportedVersions,
      headerName: config.headerName,
      queryParamName: config.queryParamName,
    });
  });
};

export default fp(apiVersioning, {
  name: 'api-versioning',
  fastify: '4.x',
});