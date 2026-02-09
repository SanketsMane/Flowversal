/**
 * Database Connection Verification Script
 * Author: Sanket - Verify all database connections for production readiness
 * 
 * This script tests connectivity to all databases and external services
 * Run this before deployment to ensure all services are accessible
 */

import { neon } from '@neondatabase/serverless';
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import Redis from 'ioredis';
import { connectMongoDB } from '../core/database/mongodb.js';
import { connectPinecone } from '../core/database/pinecone.js';

// Load environment variables
config();

interface ConnectionResult {
  service: string;
  status: 'success' | 'failed';
  latency?: number;
  error?: string;
  details?: string;
}

const results: ConnectionResult[] = [];

/**
 * Test MongoDB Atlas connection
 */
async function testMongoDB(): Promise<ConnectionResult> {
  const start = Date.now();
  try {
    await connectMongoDB();
    const latency = Date.now() - start;
    console.log('✅ MongoDB Atlas: Connected');
    return {
      service: 'MongoDB Atlas',
      status: 'success',
      latency,
      details: process.env.MONGODB_URI?.split('@')[1]?.split('/')[0] || 'unknown host'
    };
  } catch (error: any) {
    console.error('❌ MongoDB Atlas: Failed -', error.message);
    return {
      service: 'MongoDB Atlas',
      status: 'failed',
      error: error.message
    };
  }
}

/**
 * Test Pinecone connection
 */
async function testPinecone(): Promise<ConnectionResult> {
  const start = Date.now();
  try {
    const pinecone = await connectPinecone();
    
    // Test by listing indexes
    const indexes = await pinecone.listIndexes();
    const latency = Date.now() - start;
    
    console.log('✅ Pinecone: Connected');
    return {
      service: 'Pinecone',
      status: 'success',
      latency,
      details: `${indexes.indexes?.length || 0} indexes found`
    };
  } catch (error: any) {
    console.error('❌ Pinecone: Failed -', error.message);
    return {
      service: 'Pinecone',
      status: 'failed',
      error: error.message
    };
  }
}

/**
 * Test Supabase connection
 */
async function testSupabase(): Promise<ConnectionResult> {
  const start = Date.now();
  try {
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    // Test by querying a simple health check
    const { error, data } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (error && error.message !== 'relation "public.users" does not exist') {
      throw error;
    }
    
    const latency = Date.now() - start;
    console.log('✅ Supabase: Connected');
    return {
      service: 'Supabase',
      status: 'success',
      latency,
      details: process.env.SUPABASE_URL
    };
  } catch (error: any) {
    console.error('❌ Supabase: Failed -', error.message);
    return {
      service: 'Supabase',
      status: 'failed',
      error: error.message
    };
  }
}

/**
 * Test Neon PostgreSQL connection
 */
async function testNeonPostgres(): Promise<ConnectionResult> {
  const start = Date.now();
  try {
    const sql = neon(process.env.NEON_DATABASE_URL!);
    const result = await sql`SELECT 1 as test`;
    
    if (result[0]?.test !== 1) {
      throw new Error('Unexpected query result');
    }
    
    const latency = Date.now() - start;
    console.log('✅ Neon PostgreSQL: Connected');
    return {
      service: 'Neon PostgreSQL',
      status: 'success',
      latency,
      details: process.env.NEON_DATABASE_URL?.split('@')[1]?.split('/')[0] || 'unknown host'
    };
  } catch (error: any) {
    console.error('❌ Neon PostgreSQL: Failed -', error.message);
    return {
      service: 'Neon PostgreSQL',
      status: 'failed',
      error: error.message
    };
  }
}

/**
 * Test Redis connection
 */
async function testRedis(): Promise<ConnectionResult> {
  const start = Date.now();
  let redis: Redis | null = null;
  
  try {
    redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      connectTimeout: 5000,
      retryStrategy: () => null, // Don't retry, fail fast
    });
    
    await redis.ping();
    const latency = Date.now() - start;
    
    console.log('✅ Redis: Connected');
    return {
      service: 'Redis',
      status: 'success',
      latency,
      details: `${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || '6379'}`
    };
  } catch (error: any) {
    console.error('❌ Redis: Failed -', error.message);
    console.warn('⚠️  Redis is required for production rate limiting!');
    return {
      service: 'Redis',
      status: 'failed',
      error: error.message
    };
  } finally {
    if (redis) {
      await redis.quit();
    }
  }
}

/**
 * Main verification function
 */
async function verifyConnections() {
  console.log('🔍 Verifying all database connections...\n');
  console.log('=' .repeat(60));
  
  // Run all tests
  results.push(await testMongoDB());
  results.push(await testPinecone());
  results.push(await testSupabase());
  results.push(await testNeonPostgres());
  results.push(await testRedis());
  
  console.log('=' .repeat(60));
  console.log('\n📊 Connection Summary:\n');
  
  // Print summary table
  console.log('Service              Status      Latency    Details');
  console.log('-'.repeat(60));
  
  results.forEach(result => {
    const statusIcon = result.status === 'success' ? '✅' : '❌';
    const latency = result.latency ? `${result.latency}ms` : 'N/A';
    const details = result.status === 'success' 
      ? result.details || '' 
      : result.error || '';
    
    console.log(
      `${result.service.padEnd(20)} ${statusIcon.padEnd(10)} ${latency.padEnd(10)} ${details}`
    );
  });
  
  console.log('-'.repeat(60));
  
  const successCount = results.filter(r => r.status === 'success').length;
  const totalCount = results.length;
  
  console.log(`\n✓ ${successCount}/${totalCount} connections successful\n`);
  
  // Critical services check
  const criticalServices = ['MongoDB Atlas', 'Neon PostgreSQL', 'Supabase'];
  const criticalFailures = results.filter(
    r => r.status === 'failed' && criticalServices.includes(r.service)
  );
  
  if (criticalFailures.length > 0) {
    console.error('❌ CRITICAL: The following essential services failed:');
    criticalFailures.forEach(f => {
      console.error(`   - ${f.service}: ${f.error}`);
    });
    console.error('\n⚠️  Cannot proceed to production without these services.\n');
    process.exit(1);
  }
  
  // Warning for optional services
  const optionalFailures = results.filter(
    r => r.status === 'failed' && !criticalServices.includes(r.service)
  );
  
  if (optionalFailures.length > 0) {
    console.warn('⚠️  WARNING: The following optional services failed:');
    optionalFailures.forEach(f => {
      console.warn(`   - ${f.service}: ${f.error}`);
    });
    console.warn('\nThese services should be fixed for full functionality.\n');
  }
  
  if (successCount === totalCount) {
    console.log('✅ All database connections verified!\n');
    process.exit(0);
  } else if (criticalFailures.length === 0) {
    console.log('⚠️  All critical services are operational, but some optional services failed.\n');
    process.exit(0);
  }
}

// Run verification
verifyConnections().catch(error => {
  console.error('Fatal error during verification:', error);
  process.exit(1);
});
