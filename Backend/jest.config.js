module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts', '**/?(*.)+(spec|test).ts'],
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      tsconfig: {
        target: 'ES2022',
        module: 'commonjs',
        lib: ['ES2022'],
        strict: true,
        esModuleInterop: true,
        skipLibCheck: true,
        forceConsistentCasingInFileNames: true,
        resolveJsonModule: true,
        moduleResolution: 'node',
        baseUrl: '.',
        paths: {
          '@/*': ['src/*']
        },
        types: ['jest', 'node']
      }
    }],
  },
  transformIgnorePatterns: [
    'node_modules/(?!(p-retry|@langchain)/)',
  ],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/*.test.ts',
    '!src/**/*.spec.ts',
    '!src/server.ts',
    '!src/**/index.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    // Mock LangChain and other problematic ES modules
    '^@langchain/.*': '<rootDir>/src/__tests__/mocks/langchain.mock.ts',
    '^p-retry$': '<rootDir>/src/__tests__/mocks/p-retry.mock.ts',
    '^stripe$': '<rootDir>/src/__tests__/mocks/stripe.mock.ts',
    '^@google-cloud/storage$': '<rootDir>/src/__tests__/mocks/google-cloud-storage.mock.ts',
  },
  setupFilesAfterEnv: [
    '<rootDir>/src/__tests__/setup.ts',
  ],
  testTimeout: 30000, // Longer timeout for all tests to handle integration tests
  verbose: true,
};

