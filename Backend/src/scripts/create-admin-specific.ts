/**
 * Specific script to create admin user with role and handle migration
 * Author: Sanket
 */

import { neon } from '@neondatabase/serverless';
import * as bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load env from .env
dotenv.config();

async function main() {
  const dbUrl = process.env.NEON_DATABASE_URL;
  
  if (!dbUrl) {
    console.error('❌ NEON_DATABASE_URL not found');
    process.exit(1);
  }

  const sql = neon(dbUrl);
  const adminEmail = 'contactsanket1@gmail.com';
  const adminPassword = 'Sanket@3030';
  const fullName = 'Sanket Admin';

  try {
    console.log('🛠️ Checking database schema...');
    
    // Add role column if it doesn't exist
    try {
      await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user'`;
      console.log('✅ Role column ensured in users table');
    } catch (e) {
      console.log('ℹ️ Role column check (might already exist):', e instanceof Error ? e.message : e);
    }

    console.log(`🚀 Creating/Updating admin user: ${adminEmail}`);

    // Check if user exists
    const existingUsers = await sql`
      SELECT id, email, full_name FROM users WHERE email = ${adminEmail}
    `;

    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    if (existingUsers.length > 0) {
      console.log('✅ User already exists, updating to Admin role and resetting password...');
      
      await sql`
        UPDATE users 
        SET password_hash = ${hashedPassword}, role = 'admin', email_verified = true
        WHERE email = ${adminEmail}
      `;
      console.log('✅ User updated to Admin!');
    } else {
      // Create new user with admin role
      const result = await sql`
        INSERT INTO users (email, password_hash, full_name, role, email_verified)
        VALUES (${adminEmail}, ${hashedPassword}, ${fullName}, 'admin', true)
        RETURNING id, email, full_name
      `;
      console.log('✅ Admin user created:', result[0]);
    }

    console.log('\n📋 Admin Login Credentials:');
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Password: ${adminPassword}`);
    console.log('\n🎉 You can now log in to the admin panel!');
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

main();
