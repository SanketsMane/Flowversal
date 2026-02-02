import mongoose from 'mongoose';
import { logger } from '../../shared/utils/logger.util';
import { env } from '../config/env';

/**
 * Connect to MongoDB with optimized connection settings
 */
export async function connectMongoDB(): Promise<void> {
  // If already connected, return
  if (mongoose.connection.readyState === 1) {
    logger.info('MongoDB already connected');
    return;
  }

  // If connecting, wait for connection
  if (mongoose.connection.readyState === 2) {
    logger.info('MongoDB is connecting, waiting...');
    return new Promise((resolve, reject) => {
      const onConnect = () => {
        cleanup();
        resolve();
      };
      const onError = (err: any) => {
        cleanup();
        reject(err);
      };
      const cleanup = () => {
        mongoose.connection.removeListener('connected', onConnect);
        mongoose.connection.removeListener('error', onError);
      };
      mongoose.connection.once('connected', onConnect);
      mongoose.connection.once('error', onError);
    });
  }

  try {
    const options: mongoose.ConnectOptions = {
      maxPoolSize: 50,
      minPoolSize: 5,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      bufferCommands: true, // Enable buffering to queue commands while connecting
      maxIdleTimeMS: 60000,
      family: 4,
    };

    await mongoose.connect(env.MONGODB_URI, { dbName: env.MONGODB_DB_NAME, ...options });

    // Connection event handlers
    mongoose.connection.on('connected', () => {
      logger.info('MongoDB connected successfully', {
        database: mongoose.connection.db?.databaseName,
        host: mongoose.connection.host,
        port: mongoose.connection.port,
      });
    });

    mongoose.connection.on('error', (error) => {
      logger.error('MongoDB connection error', error);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });

    // Graceful shutdown - only exit in production, not in development with nodemon
    const shouldExitOnSignal = process.env.NODE_ENV === 'production';

    process.on('SIGINT', async () => {
      logger.info('Received SIGINT, closing MongoDB connection...');
      await mongoose.connection.close();
      logger.info('MongoDB connection closed through app termination');
      if (shouldExitOnSignal) {
        process.exit(0);
      }
    });

    process.on('SIGTERM', async () => {
      logger.info('Received SIGTERM, closing MongoDB connection...');
      await mongoose.connection.close();
      logger.info('MongoDB connection closed through app termination');
      if (shouldExitOnSignal) {
        process.exit(0);
      }
    });
  } catch (error: any) {
    logger.error('MongoDB connection failed', error);
    throw error;
  }
}

/**
 * Disconnect from MongoDB
 */
export async function disconnectMongoDB(): Promise<void> {
  try {
    await mongoose.connection.close();
    logger.info('MongoDB disconnected successfully');
  } catch (error: any) {
    logger.error('Error disconnecting from MongoDB', error);
    throw error;
  }
}

/**
 * Get MongoDB connection status
 */
export function getMongoDBStatus(): {
  readyState: number;
  isConnected: boolean;
  host?: string;
  port?: number;
  database?: string;
} {
  const connection = mongoose.connection;
  return {
    readyState: connection.readyState,
    isConnected: connection.readyState === 1,
    host: connection.host,
    port: connection.port,
    database: connection.db?.databaseName,
  };
}

/**
 * Create indexes for a model (helper function)
 * Note: Indexes should ideally be defined in the schema, but this helper can be used
 * to ensure indexes are created programmatically.
 */
export async function createIndexes(model: mongoose.Model<any>): Promise<void> {
  try {
    // createIndexes() without arguments creates all indexes defined in the schema
    await model.createIndexes();
    logger.info(`Indexes created for model: ${model.modelName}`);
  } catch (error: any) {
    logger.error(`Error creating indexes for model: ${model.modelName}`, error);
    throw error;
  }
}
