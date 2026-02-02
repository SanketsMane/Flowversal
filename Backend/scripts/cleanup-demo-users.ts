/**
 * Cleanup Script: Remove Demo Users from MongoDB
 * 
 * ⚠️ Run this script to clean up demo users that might have bad/corrupted data
 * 
 * Usage:
 *   npx ts-node scripts/cleanup-demo-users.ts
 */

import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/FlowVersalDB';

async function cleanupDemoUsers() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Delete all demo users
    const result = await mongoose.connection.collection('users').deleteMany({
      supabaseId: 'demo-user-123'
    });

    console.log(`✅ Deleted ${result.deletedCount} demo user(s)`);

    await mongoose.connection.close();
    console.log('✅ Cleanup complete');
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
    process.exit(1);
  }
}

cleanupDemoUsers();
