
import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import type { FastifyInstance } from 'fastify';
import mongoose from 'mongoose';

/**
 * Integration Test: Workflow API
 * Author: Sanket
 */

describe('Workflow API Integration Tests', () => {
  let server: FastifyInstance;
  let buildServer: any;
  let workflowService: any;
  let neonAuthService: any;
  let userService: any;

  beforeAll(async () => {
    const mongoMod = await import('../../core/database/mongodb');
    const serverMod = await import('../../server');
    const workflowMod = await import('../../modules/workflows/services/workflow.service');
    const authMod = await import('../../modules/auth/services/neon-auth.service');
    const userMod = await import('../../modules/users/services/user.service');
    
    buildServer = serverMod.buildServer;
    workflowService = workflowMod.workflowService;
    neonAuthService = authMod.neonAuthService;
    userService = userMod.userService;
    
    await mongoMod.connectMongoDB();
    server = await buildServer();
    await server.ready();

    // Default mocks
    (neonAuthService.getUser as any).mockResolvedValue({
      id: 'test-user-id',
      email: 'test@example.com',
      user_metadata: { name: 'Test User' }
    });

    (userService.findById as any).mockResolvedValue({
      _id: new mongoose.Types.ObjectId('65cc7f8d7f8d7f8d7f8d7f8d'),
      id: 'test-user-id',
      email: 'test@example.com'
    });
  });

  afterAll(async () => {
    await server.close();
    await mongoose.disconnect();
  });

  const getResponseBody = (res: any) => {
    try {
      return JSON.parse(res.body || res.payload);
    } catch (e) {
      return res.body || res.payload;
    }
  };

  describe('GET /api/v1/workflows', () => {
    it('should return list of workflows', async () => {
      (workflowService.listWorkflows as any).mockResolvedValueOnce({
        workflows: [],
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
      });

      const response = await server.inject({
        method: 'GET',
        url: '/api/v1/workflows',
        headers: { authorization: 'Bearer valid-token' }
      });

      const body = getResponseBody(response);
      if (response.statusCode !== 200) {
        console.log('GET /workflows failure:', body);
      }

      expect(response.statusCode).toBe(200);
      expect(body.success).toBe(true);
    });
  });

  describe('POST /api/v1/workflows', () => {
    it('should create a new workflow with valid data', async () => {
      const workflowData = {
        name: 'Test Workflow',
        description: 'Integration test',
        triggers: [],
        containers: [],
        formFields: [],
        status: 'draft',
      };

      (workflowService.createWorkflow as any).mockResolvedValueOnce({
        id: 'test-workflow-id',
        ...workflowData
      });

      const response = await server.inject({
        method: 'POST',
        url: '/api/v1/workflows',
        payload: workflowData,
        headers: {
          'content-type': 'application/json',
          authorization: 'Bearer valid-token'
        },
      });

      const body = getResponseBody(response);
      if (response.statusCode !== 201) {
        console.log('POST /workflows failure:', body);
      }

      expect(response.statusCode).toBe(201);
      expect(body.success).toBe(true);
      expect(body.data).toBeDefined();
    });
  });

  describe('GET /api/v1/workflows/:id', () => {
    it('should return 404 for non-existent workflow', async () => {
      (workflowService.getWorkflowById as any).mockResolvedValueOnce(null);

      const response = await server.inject({
        method: 'GET',
        url: '/api/v1/workflows/65cc7f8d7f8d7f8d7f8d7f8d',
        headers: { authorization: 'Bearer valid-token' }
      });

      expect(response.statusCode).toBe(404);
    });
  });
});
