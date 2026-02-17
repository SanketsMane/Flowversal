/**
 * Quick test script to verify login credentials
 * Author: Sanket
 */

import { neon } from '@neondatabase/serverless';
import * as bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';

dotenv.config();

async function testLogin() {
  const dbUrl = process.env.NEON_DATABASE_URL;
  
  if (!dbUrl) {
    console.error('❌ NEON_DATABASE_URL not found');
    process.exit(1);
  }

  const sql = neon(dbUrl);
  const testEmail = 'rohanfdesai568@gmail.com';
  const testPassword = 'Pass@1234';

  try {
    console.log('\n🔍 Testing login for:', testEmail);
    
    // 1. Find user (case-insensitive email search)
    const users = await sql`
      SELECT id, email, full_name, password_hash, email_verified
      FROM users 
      WHERE LOWER(email) = LOWER(${testEmail})
    `;

    if (users.length === 0) {
      console.error('❌ User not found with email:', testEmail);
      process.exit(1);
    }

    const user = users[0];
    console.log('\n✅ User found:');
    console.log('   ID:', user.id);
    console.log('   Email:', user.email);
    console.log('   Name:', user.full_name);
    console.log('   Password hash exists:', !!user.password_hash);
    console.log('   Hash length:', user.password_hash?.length);

    // 2. Test password
    const isMatch = await bcrypt.compare(testPassword, user.password_hash);
    console.log('\n🔐 Password test:');
    console.log('   Password:', testPassword);
    console.log('   Match:', isMatch ? '✅ YES' : '❌ NO');

    if (isMatch) {
      console.log('\n✅ Login credentials are VALID!');
      console.log('👉 The backend login should work with these credentials.');
    } else {
      console.log('\n❌ Password does NOT match!');
      console.log('👉 This explains why login is failing.');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testLogin();
