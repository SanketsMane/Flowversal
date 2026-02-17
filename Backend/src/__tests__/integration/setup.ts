/**
 * Integration test setup
 * Extends the main test setup with integration-specific mocks
 */

const { MongoMemoryServer } = require('mongodb-memory-server');

// Global MongoDB Memory Server instance
let mongoServer: any;

// Start in-memory MongoDB before all tests
console.log('🚧 Loading Integration Test Setup...');

// Mocks must be top-level
jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => ({
    connect: jest.fn(),
    disconnect: jest.fn(),
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    ping: jest.fn().mockResolvedValue('PONG'),
    zremrangebyscore: jest.fn().mockResolvedValue(0),
    zcard: jest.fn().mockResolvedValue(0),
    zrange: jest.fn().mockResolvedValue([]),
    zadd: jest.fn().mockResolvedValue(1),
    expire: jest.fn().mockResolvedValue(1),
    keys: jest.fn().mockResolvedValue([]),
    quit: jest.fn().mockResolvedValue('OK'),
    on: jest.fn(),
  }));
});

// Use relative paths for mocks
jest.mock('../../core/config/supabase.config', () => {
  const mockSupabase = {
    auth: {
      admin: {
        createUser: jest.fn().mockResolvedValue({ data: { user: { id: 'test-user-id' } }, error: null }),
        deleteUser: jest.fn().mockResolvedValue({ data: {}, error: null }),
        getUserById: jest.fn().mockResolvedValue({ data: { user: { id: 'test-user-id', email: 'test@example.com' } }, error: null }),
      },
      signUp: jest.fn().mockResolvedValue({ 
        data: { 
          user: { id: 'test-user-id', email: 'test@example.com' }, 
          session: { access_token: 'test-token', refresh_token: 'test-refresh-token' } 
        }, 
        error: null 
      }),
      signInWithPassword: jest.fn().mockResolvedValue({ 
        data: { 
          user: { id: 'test-user-id', email: 'test@example.com' }, 
          session: { access_token: 'test-token', refresh_token: 'test-refresh-token' } 
        }, 
        error: null 
      }),
      signOut: jest.fn().mockResolvedValue({ error: null }),
      getSession: jest.fn().mockResolvedValue({ 
        data: { session: { access_token: 'test-token' } }, 
        error: null 
      }),
      getUser: jest.fn().mockResolvedValue({ 
        data: { user: { id: 'test-user-id' } }, 
        error: null 
      }),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: {}, error: null }),
    })),
    supabaseAdmin: {
      auth: {
        admin: {
          getUserById: jest.fn().mockResolvedValue({ data: { user: { id: 'test-user-id', email: 'test@example.com' } }, error: null }),
          createUser: jest.fn().mockResolvedValue({ data: { user: { id: 'test-user-id' } }, error: null }),
        }
      }
    }
  };
  return {
    supabase: mockSupabase,
    supabaseClient: mockSupabase,
    supabaseAdmin: mockSupabase
  };
});


jest.mock('../../modules/auth/services/neon-auth.service', () => ({
  neonAuthService: {
    signUp: jest.fn().mockResolvedValue({
      user: { id: 'test-user-id', email: 'test@example.com' },
      session: { access_token: 'test-token', refresh_token: 'test-refresh-token', expires_in: 3600, token_type: 'bearer' }
    }),
    signIn: jest.fn().mockResolvedValue({
      user: { id: 'test-user-id', email: 'test@example.com' },
      session: { access_token: 'test-token', refresh_token: 'test-refresh-token', expires_in: 3600, token_type: 'bearer' }
    }),
    refreshSession: jest.fn().mockResolvedValue({
      user: { id: 'test-user-id', email: 'test@example.com' },
      session: { access_token: 'test-token', refresh_token: 'test-refresh-token', expires_in: 3600, token_type: 'bearer' }
    }),
    getUser: jest.fn().mockResolvedValue({ id: 'test-user-id', email: 'test@example.com' }),
    verifyAccessToken: jest.fn().mockReturnValue({ userId: 'test-user-id', type: 'access' }),
  }
}));

jest.mock('../../core/database/neon.config', () => ({
  neonDb: {
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    values: jest.fn().mockReturnThis(),
    returning: jest.fn().mockResolvedValue([{ id: 'test-user-id', email: 'test@example.com' }]),
    update: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
  },
  NeonDatabase: {
    getClient: jest.fn(),
    healthCheck: jest.fn().mockResolvedValue(true),
  },
}));

jest.mock('../../modules/tools/services/tool-ecosystem.service', () => ({
  toolEcosystemService: {
    registerTool: jest.fn(),
    loadBuiltInTools: jest.fn().mockResolvedValue(true),
    getTool: jest.fn(),
    listTools: jest.fn().mockResolvedValue([]),
    initialize: jest.fn().mockResolvedValue(true),
  }
}));

jest.mock('../../modules/users/services/user.service', () => ({
  userService: {
    getOrCreateUserFromSupabase: jest.fn().mockResolvedValue({
      _id: 'test-user-id',
      id: 'test-user-id',
      email: 'test@example.com',
      name: 'Test User'
    }),
    getUserModel: jest.fn().mockResolvedValue({
      _id: 'test-user-id',
      id: 'test-user-id',
      email: 'test@example.com',
      name: 'Test User'
    }),
    findById: jest.fn().mockResolvedValue({
      _id: 'test-user-id',
      id: 'test-user-id',
      email: 'test@example.com'
    }),
  }
}));

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
  }
}));

jest.mock('../../modules/workflows/services/workflow-validation.service', () => ({
  workflowValidationService: {
    validateWorkflow: jest.fn().mockReturnValue({ valid: true, errors: [], warnings: [] }),
    validateWorkflowUpdate: jest.fn().mockReturnValue({ valid: true, errors: [], warnings: [] }),
    logValidationResult: jest.fn(),
  }
}));

beforeAll(async () => {
  // Set longer timeout for integration tests
  jest.setTimeout(60000);

  // Start MongoDB Memory Server
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();

  // Override the MongoDB URI for tests
  process.env.MONGODB_URI = mongoUri;
});

// Cleanup after all tests
afterAll(async () => {
  if (mongoServer) {
    await mongoServer.stop();
  }
}, 30000);
