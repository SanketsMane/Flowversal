/**
 * Script to promote a user to admin role
 * Usage: ts-node promote-to-admin.ts <email>
 * Author: Sanket
 */

import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/neon-http';
import { users } from '../core/database/schema/auth.schema';

dotenv.config();

async function promoteToAdmin(email: string) {
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL not found in environment variables');
    process.exit(1);
  }

  const sql = neon(process.env.DATABASE_URL);
  const db = drizzle(sql, { schema: { users } });

  try {
    console.log(`🔍 Finding user: ${email}`);
    
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (!user) {
      console.error(`❌ User not found: ${email}`);
      process.exit(1);
    }

    console.log(`✅ Found user: ${user.fullName || user.email}`);
    console.log(`📝 Current role: ${user.role || 'user'}`);

    // Update role to admin
    await db.update(users)
      .set({ role: 'admin' })
      .where(eq(users.email, email));

    console.log(`✅ Successfully promoted ${email} to admin!`);
    console.log(`🎉 Role updated: user → admin`);
    
  } catch (error) {
    console.error('❌ Error promoting user:', error);
    process.exit(1);
  }
}

const email = process.argv[2];
if (!email) {
  console.error('❌ Usage: ts-node promote-to-admin.ts <email>');
  process.exit(1);
}

promoteToAdmin(email);
