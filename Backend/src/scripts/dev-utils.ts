import mongoose from 'mongoose';
import { connectMongoDB, disconnectMongoDB } from '../core/database/mongodb';
import { logger } from '../shared/utils/logger.util';

/**
 * Seed database with test data
 */
export async function seedDatabase(): Promise<void> {
  try {
    await connectMongoDB();

    logger.info('Starting database seeding...');

    // Clear existing data (optional - comment out if you want to keep existing data)
    // await mongoose.connection.db.dropDatabase();
    // logger.info('Database cleared');

    // TODO: Add seed data here
    // Example:
    // await seedUsers();
    // await seedWorkflows();
    // await seedTasks();

    logger.info('Database seeded successfully');
  } catch (error: any) {
    logger.error('Database seeding failed', error);
    process.exit(1);
  } finally {
    await disconnectMongoDB();
    process.exit(0);
  }
}

/**
 * Reset database (drop all collections)
 */
export async function resetDatabase(): Promise<void> {
  try {
    await connectMongoDB();

    logger.warn('Dropping all collections...');
    await mongoose.connection.db.dropDatabase();
    logger.info('Database reset successfully');
  } catch (error: any) {
    logger.error('Database reset failed', error);
    process.exit(1);
  } finally {
    await disconnectMongoDB();
    process.exit(0);
  }
}

/**
 * Check system health
 */
export async function checkHealth(): Promise<void> {
  try {
    logger.info('🔍 Health Check Results');
    logger.info('========================');

    // Database check
    try {
      await connectMongoDB();
      const status = mongoose.connection.readyState;
      const statusText = ['disconnected', 'connected', 'connecting', 'disconnecting'][status] || 'unknown';
      logger.info(`✅ Database: ${statusText}`);
      await disconnectMongoDB();
    } catch (error: any) {
      logger.error(`❌ Database: ${error.message}`);
    }

    // Memory check
    const memoryUsage = process.memoryUsage();
    const memoryUsageMB = {
      rss: Math.round(memoryUsage.rss / 1024 / 1024),
      heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
      heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
    };
    logger.info(`✅ Memory: ${memoryUsageMB.heapUsed}MB / ${memoryUsageMB.heapTotal}MB used`);

    // Environment check
    logger.info(`✅ Environment: ${process.env.NODE_ENV || 'development'}`);

    logger.info('========================');
    logger.info('Health check completed');
  } catch (error: any) {
    logger.error('Health check failed', error);
    process.exit(1);
  }
}

// CLI interface
const command = process.argv[2];

switch (command) {
  case 'seed':
    seedDatabase();
    break;
  case 'reset':
    resetDatabase();
    break;
  case 'health':
    checkHealth();
    break;
  default:
    console.log('Usage: ts-node dev-utils.ts [seed|reset|health]');
    process.exit(1);
}

