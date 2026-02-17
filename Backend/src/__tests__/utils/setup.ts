
// Global setup for tests
import { jest } from '@jest/globals';

// Set default timeout
jest.setTimeout(30000);

// Global mocks
jest.mock('../../core/config/secrets.service', () => ({
  secretsService: {
    getSecret: (jest.fn() as any).mockResolvedValue({}) as any,
    loadSecretsToEnv: (jest.fn() as any).mockResolvedValue(undefined) as any,
  },
}));

// Mock Redis/Pinecone connectivity if needed
jest.mock('../../core/database/pinecone', () => ({
  connectPinecone: (jest.fn() as any).mockResolvedValue(true) as any,
  getPineconeClient: jest.fn().mockReturnValue({
    index: jest.fn().mockReturnValue({
      query: jest.fn(),
      upsert: jest.fn(),
      deleteAll: jest.fn(),
      deleteMany: jest.fn(),
      describeIndexStats: jest.fn(),
      namespace: jest.fn().mockReturnThis(),
    }),
  }) as any,
  getPineconeIndex: jest.fn().mockReturnValue({
    query: jest.fn(),
    upsert: jest.fn(),
    deleteAll: jest.fn(),
    deleteMany: jest.fn(),
    describeIndexStats: jest.fn(),
    namespace: jest.fn().mockReturnThis(),
  }) as any,
  createPineconeIndex: (jest.fn() as any).mockResolvedValue(undefined) as any,
  upsertPineconeRecords: (jest.fn() as any).mockResolvedValue(undefined) as any,
  searchPineconeRecords: (jest.fn() as any).mockResolvedValue({ matches: [] }) as any,
  deletePineconeRecords: (jest.fn() as any).mockResolvedValue(undefined) as any,
  getPineconeIndexStats: (jest.fn() as any).mockResolvedValue({}) as any,
}));

// Mock Supabase config
jest.mock('../../core/config/supabase.config', () => ({
  supabaseAdmin: {
    auth: {
      admin: {
        getUserById: jest.fn() as any,
        deleteUser: jest.fn() as any,
        listUsers: (jest.fn() as any).mockResolvedValue({ data: { users: [] }, error: null }) as any,
      }
    },
    storage: {
      from: jest.fn().mockReturnValue({
        upload: jest.fn(),
        getPublicUrl: jest.fn(),
      }) as any,
    }
  },
  supabaseClient: {
    auth: {
      signUp: jest.fn() as any,
      signInWithPassword: jest.fn() as any,
      getUser: jest.fn() as any,
      signOut: jest.fn() as any,
    },
    from: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
    }) as any,
  },
  supabaseStorage: {
    from: jest.fn().mockReturnValue({
      upload: jest.fn(),
      getPublicUrl: jest.fn(),
    }) as any,
  }
}));

// Mock Encryption util
jest.mock('../../shared/utils/encryption.util', () => ({
  encryptField: jest.fn((val: string) => `encrypted_${val}`),
  decryptField: jest.fn((val: string) => val.replace('encrypted_', '')),
}));

