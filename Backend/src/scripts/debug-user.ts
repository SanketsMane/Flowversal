/**
 * Debug script to check user in database
 * Author: Sanket
 */

import { neon } from '@neondatabase/serverless';
import * as bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';

dotenv.config();

async function debugUser() {
  const dbUrl = process.env.NEON_DATABASE_URL;
  
  if (!dbUrl) {
    console.error('❌ NEON_DATABASE_URL not found');
    process.exit(1);
  }

  const sql = neon(dbUrl);
  const adminEmail = 'rohanfdesai568@gmail.com';
  const adminPassword = 'Pass@1234';

  try {
    // Get user from database
    const users = await sql`
      SELECT id, email, full_name, password_hash, email_verified, created_at
      FROM users 
      WHERE email = ${adminEmail}
    `;

    if (users.length === 0) {
      console.error('❌ User not found!');
      process.exit(1);
    }

    const user = users[0];
    console.log('\n📋 User Details:');
    console.log('   ID:', user.id);
    console.log('   Email:', user.email);
    console.log('   Name:', user.full_name);
    console.log('   Email Verified:', user.email_verified);
    console.log('   Password Hash (first 20 chars):', user.password_hash?.substring(0, 20) + '...');
    console.log('   Created At:', user.created_at);

    // Test password comparison
    const isMatch = await bcrypt.compare(adminPassword, user.password_hash);
    console.log('\n🔐 Password Verification:');
    console.log('   Testing password: Pass@1234');
    console.log('   Match:', isMatch ? '✅ YES' : '❌ NO');

    if (!isMatch) {
      console.log('\n⚠️  Password does not match! Updating...');
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      await sql`
        UPDATE users 
        SET password_hash = ${hashedPassword}
        WHERE email = ${adminEmail}
      `;
      console.log('✅ Password updated successfully!');
      console.log('\n🎉 Try logging in again now!');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

debugUser();
