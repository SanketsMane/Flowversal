// Author: Sanket
// Script to run Drizzle migrations against Neon database
// Usage: npx tsx src/scripts/migrate.ts

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { migrate } from 'drizzle-orm/neon-http/migrator';
import path from 'path';
import { env } from '../core/config/env';
import * as schema from '../core/database/schema/auth.schema';

async function runMigrations() {
  console.log('⏳ Starting Neon database migrations...');

  if (!env.NEON_DATABASE_URL) {
    console.error('❌ NEON_DATABASE_URL not found in environment variables');
    process.exit(1);
  }

  try {
    const sql = neon(env.NEON_DATABASE_URL);
    const db = drizzle(sql, { schema });

    console.log('📦 Reading migrations from ./src/core/database/migrations');
    
    // Absolute path to migrations folder
    const migrationsFolder = path.resolve(__dirname, '../core/database/migrations');

    await migrate(db, { migrationsFolder });

    console.log('✅ Migrations completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigrations();
