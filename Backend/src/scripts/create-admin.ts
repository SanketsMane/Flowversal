/**
 * Simple script to create admin user directly in database
 * Email: rohanfdesai568@gmail.com
 * Password: Pass@1234
 * Author: Sanket
 */

import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/neon-http';
import { users } from '../core/database/schema/auth.schema';

dotenv.config();

async function createAdminUser() {
  const dbUrl = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;
  
  if (!dbUrl) {
    console.error('❌ NEON_DATABASE_URL not found in environment variables');
    process.exit(1);
  }

  const sql = neon(dbUrl);
  const db = drizzle(sql, { schema: { users } });

  const adminEmail = 'rohanfdesai568@gmail.com';
  const adminPassword = 'Pass@1234';
  const adminName = 'Rohan Desai';

  try {
    console.log('🔍 Checking if admin user already exists...');
    
    const existingUser = await db.select().from(users).where(eq(users.email, adminEmail)).limit(1);

    if (existingUser.length > 0) {
      console.log('✅ User already exists!');
      console.log('');
      console.log('📋 Admin Credentials:');
      console.log('   Email: rohanfdesai568@gmail.com');
      console.log('   Password: Pass@1234');
      console.log('');
      console.log('🎉 You can now login at: http://localhost:5173');
      return;
    }

    console.log('📝 Creating new admin user...');

    // Hash password using bcrypt
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    // Insert admin user into database
    await db.insert(users).values({
      email: adminEmail,
      passwordHash: hashedPassword,
      fullName: adminName,
      emailVerified: true,
    });

    console.log('✅ Admin user created successfully!');
    console.log('');
    console.log('📋 Admin Credentials:');
    console.log('   Email: rohanfdesai568@gmail.com');
    console.log('   Password: Pass@1234');
    console.log('');
    console.log('🎉 You can now login at: http://localhost:5173');
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    process.exit(1);
  }
}

createAdminUser();
