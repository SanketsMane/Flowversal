/**
 * Simple script to create admin user
 * Author: Sanket
 */

import { neon } from '@neondatabase/serverless';
import * as bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';

dotenv.config();

async function main() {
  const dbUrl = process.env.NEON_DATABASE_URL;
  
  if (!dbUrl) {
    console.error('❌ NEON_DATABASE_URL not found');
    process.exit(1);
  }

  const sql = neon(dbUrl);
  const adminEmail = 'rohanfdesai568@gmail.com';
  const adminPassword = 'Pass@1234';

  try {
    // Check if user exists
    const existingUsers = await sql`
      SELECT id, email, full_name FROM users WHERE email = ${adminEmail}
    `;

    if (existingUsers.length > 0) {
      console.log('✅ User already exists:', existingUsers[0]);
      
      // Update password
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      await sql`
        UPDATE users 
        SET password_hash = ${hashedPassword}, email_verified = true
        WHERE email = ${adminEmail}
      `;
      console.log('✅ Password updated!');
    } else {
      // Create new user
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      const result = await sql`
        INSERT INTO users (email, password_hash, full_name, email_verified)
        VALUES (${adminEmail}, ${hashedPassword}, 'Rohan Desai', true)
        RETURNING id, email, full_name
      `;
      console.log('✅ User created:', result[0]);
    }

    console.log('\n📋 Login Credentials:');
    console.log('   Email: rohanfdesai568@gmail.com');
    console.log('   Password: Pass@1234');
    console.log('\n🎉 Try logging in now!');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();
