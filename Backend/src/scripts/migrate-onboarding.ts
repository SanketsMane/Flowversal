// Author: Sanket
// Database migration script to add onboarding columns to Neon PostgreSQL
// Usage: npx ts-node src/scripts/migrate-onboarding.ts

import 'dotenv/config';
import { neonDb } from '../core/database/neon.config';
import { users } from '../core/database/schema/auth.schema';
import { sql } from 'drizzle-orm';

async function migrate() {
    console.log('🚀 Starting onboarding schema migration...');

    if (!neonDb) {
        console.error('❌ Neon database client not initialized. Check your environment variables.');
        process.exit(1);
    }

    try {
        // 1. Ensure onboarding_completed exists
        console.log('Checking/Adding onboarding_completed...');
        await neonDb.execute(sql`
            ALTER TABLE users ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE NOT NULL;
        `);

        // 2. Add organization fields
        console.log('Adding organization fields...');
        await neonDb.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS organization_name TEXT;`);
        await neonDb.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS organization_size TEXT;`);

        // 3. Add personalization fields
        console.log('Adding personalization fields...');
        await neonDb.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS referral_source TEXT;`);
        await neonDb.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS automation_experience TEXT;`);
        await neonDb.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS automation_goal TEXT;`);
        await neonDb.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS tech_stack TEXT[];`);

        // 4. Ensure role column exists (Safeguard)
        console.log('Ensuring role column exists...');
        await neonDb.execute(sql`
            ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' NOT NULL;
        `);

        console.log('✅ Migration completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

migrate();
