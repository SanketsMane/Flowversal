// Mock user service BEFORE any other imports
jest.mock('../../modules/users/services/user.service', () => ({
  userService: {
    findById: jest.fn().mockResolvedValue({
      _id: 'test-user-id',
      email: 'test@example.com',
      name: 'Test User'
    }),
    getUserModel: jest.fn().mockResolvedValue({
      _id: 'test-user-id',
      email: 'test@example.com',
      name: 'Test User'
    }),
  },
}));

const Fastify = require('fastify');
const { env } = require('../../core/config/env');
const corsPlugin = require('../../core/middleware/plugins/cors.plugin');
const { registerRoutes } = require('../../routes');

/**
 * Build a lightweight test server for integration tests
 * This server mocks external dependencies and focuses on API testing
 */
async function buildTestServer() {
  const fastify = Fastify({
    logger: false, // Disable logging in tests for cleaner output
    disableRequestLogging: true,
  });

  // ============================================================================
  // MOCK EXTERNAL DEPENDENCIES
  // ============================================================================

  // Mock database connections
  jest.mock('../../core/database/mongodb', () => ({
    connectMongoDB: jest.fn().mockResolvedValue(undefined),
  }));

  jest.mock('../../core/database/pinecone', () => ({
    connectPinecone: jest.fn().mockResolvedValue(undefined),
  }));

  // Mock external services
  jest.mock('@supabase/supabase-js', () => ({
    createClient: jest.fn(() => ({
      auth: {
        signUp: jest.fn(),
        signInWithPassword: jest.fn(),
        signOut: jest.fn(),
        getUser: jest.fn(),
      },
      from: jest.fn(() => ({
        select: jest.fn().mockReturnThis(),
        insert: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: null }),
      })),
    })),
  }));

  jest.mock('stripe', () => {
    return jest.fn().mockImplementation(() => ({
      checkout: {
        sessions: { create: jest.fn() },
      },
      billingPortal: {
        sessions: { create: jest.fn() },
      },
      subscriptions: { list: jest.fn() },
      webhooks: { constructEvent: jest.fn() },
    }));
  });

  jest.mock('inngest', () => ({
    Inngest: jest.fn().mockImplementation(() => ({
      createFunction: jest.fn(),
      send: jest.fn(),
    })),
  }));

  // Mock Mongoose models and connection
  jest.mock('mongoose', () => ({
    connect: jest.fn(),
    connection: {
      readyState: 1,
      db: {
        admin: jest.fn(() => ({
          ping: jest.fn().mockResolvedValue({ ok: 1 }),
        })),
      },
    },
    Types: {
      ObjectId: jest.fn().mockImplementation((id) => id || 'test-object-id'),
    },
    Schema: jest.fn(),
    model: jest.fn(() => ({
      find: jest.fn().mockReturnThis(),
      findById: jest.fn().mockReturnThis(),
      findOne: jest.fn().mockReturnThis(),
      create: jest.fn(),
      save: jest.fn(),
      populate: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue([]),
      countDocuments: jest.fn().mockResolvedValue(0),
    })),
  }));

  // Mock workflow models specifically
  jest.mock('../../modules/workflows/models/Workflow.model', () => ({
    WorkflowModel: {
      find: jest.fn().mockReturnThis(),
      findById: jest.fn().mockResolvedValue(null),
      create: jest.fn(),
      countDocuments: jest.fn().mockResolvedValue(0),
    },
  }));

  jest.mock('../../modules/workflows/models/WorkflowExecution.model', () => ({
    WorkflowExecutionModel: {
      find: jest.fn().mockReturnThis(),
      findById: jest.fn().mockResolvedValue(null),
      create: jest.fn(),
      countDocuments: jest.fn().mockResolvedValue(0),
    },
  }));

  // Mock workflow service
  const mockWorkflowService = {
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
    validateWorkflowData: jest.fn().mockReturnValue({ isValid: true }),
  };

  jest.mock('../../modules/workflows/services/workflow.service', () => ({
    workflowService: mockWorkflowService,
  }));

  // Also mock the workflow service directly
  jest.mock('../../modules/workflows/services/workflow/workflow.service', () => ({
    WorkflowService: jest.fn(),
    workflowService: mockWorkflowService,
  }));

  // Mock workflow execution service
  jest.mock('../../modules/workflows/services/workflow-execution.service', () => ({
    workflowExecutionService: {
      listExecutions: jest.fn().mockResolvedValue({
        success: true,
        data: [],
        total: 0,
        message: 'Executions retrieved successfully'
      }),
    },
  }));

  // Mock user service
  jest.mock('../../modules/users/services/user.service', () => ({
    userService: {
      findById: jest.fn().mockResolvedValue({
        _id: 'test-user-id',
        email: 'test@example.com',
        name: 'Test User'
      }),
    },
  }));

  // ============================================================================
  // MOCK AUTH MIDDLEWARE FOR TESTING
  // ============================================================================

  // Skip auth plugin entirely for tests and add mock user to all requests
  fastify.addHook('preHandler', async (request: any, reply: any) => {
    // Add mock user for all requests
    request.user = {
      id: 'test-user-id',
      email: 'test@example.com',
      role: 'user',
    };
  });

  // ============================================================================
  // REGISTER ESSENTIAL PLUGINS
  // ============================================================================

  // CORS must be registered first
  await fastify.register(corsPlugin);

  // Register routes (this will include all API endpoints)
  await fastify.register(registerRoutes);

  return fastify;
}

module.exports = { buildTestServer };
