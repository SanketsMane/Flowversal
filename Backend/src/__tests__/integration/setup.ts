/**
 * Integration test setup
 * Extends the main test setup with integration-specific mocks
 */

const { MongoMemoryServer } = require('mongodb-memory-server');

// Global MongoDB Memory Server instance
let mongoServer;

// Start in-memory MongoDB before all tests
beforeAll(async () => {
  // Set longer timeout for integration tests
  jest.setTimeout(60000);

  // Start MongoDB Memory Server
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();

  // Override the MongoDB URI for tests
  process.env.MONGODB_URI = mongoUri;

  // Mock Redis connection
  jest.mock('ioredis', () => {
    return jest.fn().mockImplementation(() => ({
      connect: jest.fn(),
      disconnect: jest.fn(),
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
    }));
  });

  // Mock Pinecone more thoroughly
  jest.mock('@pinecone-database/pinecone', () => ({
    Pinecone: jest.fn().mockImplementation(() => ({
      init: jest.fn().mockResolvedValue({
        index: jest.fn(() => ({
          upsert: jest.fn(),
          query: jest.fn(),
          deleteMany: jest.fn(),
        })),
        listIndexes: jest.fn().mockResolvedValue([]),
      }),
    })),
  }));

  // Mock OpenAI
  jest.mock('openai', () => ({
    default: jest.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: jest.fn().mockResolvedValue({
            choices: [{ message: { content: 'Mock response' } }],
          }),
        },
      },
    })),
  }));

  // Mock LangChain components
  jest.mock('@langchain/core', () => ({
    ChatPromptTemplate: { fromTemplate: jest.fn() },
    MessagesPlaceholder: jest.fn(),
    RunnableSequence: { from: jest.fn() },
  }));

  jest.mock('@langchain/langgraph', () => ({
    StateGraph: jest.fn().mockImplementation(() => ({
      addNode: jest.fn().mockReturnThis(),
      addEdge: jest.fn().mockReturnThis(),
      setEntryPoint: jest.fn().mockReturnThis(),
      compile: jest.fn().mockReturnValue({
        invoke: jest.fn(),
      }),
    })),
  }));
});

// Cleanup after all tests
afterAll(async () => {
  if (mongoServer) {
    await mongoServer.stop();
  }
}, 30000);
