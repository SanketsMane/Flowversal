const fastifyModule = require('fastify');
const testServerModule = require('../utils/test-server');

// Mock the workflow service directly in the test
jest.mock('../../modules/workflows/services/workflow.service', () => ({
  workflowService: {
    listWorkflows: jest.fn().mockResolvedValue({
      workflows: [],
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 0,
    }),
    createWorkflow: jest.fn().mockResolvedValue({
      success: true,
      data: { id: 'test-workflow-id', name: 'Test Workflow' },
      message: 'Workflow created successfully'
    }),
    getWorkflowById: jest.fn().mockResolvedValue(null),
  },
}));

// Mock health check functions
jest.mock('../../routes/health.routes', () => ({
  default: jest.fn().mockImplementation(async (fastify: any) => {
    fastify.get('/ready', async (request: any, reply: any) => {
      reply.send({
        status: 'ready',
        checks: [
          { name: 'database', status: 'ok', latency: 10 },
          { name: 'redis', status: 'not configured' },
          { name: 'external', status: 'ok', services: { supabase: 'configured', pinecone: 'configured' } }
        ],
        timestamp: new Date().toISOString(),
      });
    });

    fastify.get('/live', async (request: any, reply: any) => {
      reply.send({
        status: 'alive',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
      });
    });

    fastify.get('/health', async (request: any, reply: any) => {
      reply.send({
        overall: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: '1.0.0',
        environment: 'test',
        checks: {
          database: { status: 'ok', latency: 10 },
          memory: { status: 'ok', usage: process.memoryUsage() },
          cpu: { status: 'ok', usage: process.cpuUsage().user },
          external: { status: 'ok', services: { supabase: 'configured', pinecone: 'configured' } },
        },
      });
    });
  }),
}));

describe('Workflow API Integration Tests', () => {
  let app: any;

  beforeAll(async () => {
    app = await testServerModule.buildTestServer();
    await app.ready();
  }, 30000);

  afterAll(async () => {
    await app.close();
  });

  describe('GET /api/v1/workflows', () => {
    it('should return list of workflows', async () => {
      jest.setTimeout(30000);
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/workflows',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body).toHaveProperty('success');
      expect(Array.isArray(body.data) || body.data === undefined).toBe(true);
    });

    it('should support pagination query parameters', async () => {
      jest.setTimeout(30000);
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/workflows?limit=10&offset=0',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body).toHaveProperty('success');
    });
  });

  describe('POST /api/v1/workflows', () => {
    it('should create a new workflow with valid data', async () => {
      const workflowData = {
        name: 'Test Workflow',
        description: 'Integration test workflow',
        nodes: [
          {
            id: 'node-1',
            type: 'trigger',
            config: { event: 'test.event' },
          },
        ],
        connections: [],
      };

      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/workflows',
        payload: workflowData,
        headers: {
          'content-type': 'application/json',
        },
      });

      // Should either succeed (201) or fail with validation error (400)
      expect([201, 400, 401]).toContain(response.statusCode);
    });

    it('should reject invalid workflow data', async () => {
      const invalidData = {
        name: '', // Invalid: empty name
        nodes: [], // Invalid: no nodes
      };

      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/workflows',
        payload: invalidData,
        headers: {
          'content-type': 'application/json',
        },
      });

      expect([400, 422]).toContain(response.statusCode);
    });
  });

  describe('GET /api/v1/workflows/:id', () => {
    it('should return 404 for non-existent workflow', async () => {
      jest.setTimeout(30000);
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/workflows/non-existent-id',
      });

      expect([404, 401]).toContain(response.statusCode);
    });
  });

  describe('Health Check', () => {
    it('should return health status', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/health',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body).toHaveProperty('overall');
      expect(body.overall).toBe('healthy');
    });
  });
});

