
require('dotenv').config();
const { neon } = require('@neondatabase/serverless');
const { drizzle } = require('drizzle-orm/neon-http');

async function testConnection() {
  console.log('Testing Neon connection...');
  try {
    const url = process.env.NEON_DATABASE_URL;
    if (!url) {
      console.error('NEON_DATABASE_URL is missing!');
      process.exit(1);
    }
    
    // Mask URL for safety
    console.log('Using URL:', url.replace(/:[^:@]*@/, ':****@'));

    const sql = neon(url);
    const db = drizzle(sql);
    
    const result = await db.execute('SELECT 1 as connected');
    console.log('Connection successful!', result);
    
    // Test users table
    console.log('Checking users table...');
    const usersCount = await db.execute('SELECT count(*) from users');
    console.log('Users count:', usersCount);

  } catch (error) {
    console.error('Connection failed:', error);
  }
}

testConnection();
