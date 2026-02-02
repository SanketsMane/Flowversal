import { env } from './env';

export const databaseConfig = {
  mongodb: {
    uri: env.MONGODB_URI,
    dbName: env.MONGODB_DB_NAME,
    options: {
      maxPoolSize: 10,
      minPoolSize: 2,
      socketTimeoutMS: 45000,
      serverSelectionTimeoutMS: 5000,
    },
  },
  pinecone: {
    apiKey: env.PINECONE_API_KEY,
    environment: env.PINECONE_ENVIRONMENT, // Kept for reference but not used for serverless
    indexName: env.PINECONE_INDEX_NAME,
    // hostName removed - not needed for serverless Pinecone
  }
};

