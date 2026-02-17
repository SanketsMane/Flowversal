
import { neon } from '@neondatabase/serverless';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/neon-http';
import { env } from './src/core/config/env';
import { users } from './src/core/database/schema/auth.schema';

async function testConnection() {
  console.log('Testing Neon connection with Drizzle schema...');
  try {
    const url = process.env.NEON_DATABASE_URL || env.NEON_DATABASE_URL;
    if (!url) {
      console.error('NEON_DATABASE_URL is missing!');
      process.exit(1);
    }
    
    // Mask URL for safety
    console.log('Using URL:', url.replace(/:[^:@]*@/, ':****@'));

    const sql = neon(url);
    const db = drizzle(sql);
    
    const result = await db.select().from(users).limit(1);
    console.log('Select users result:', result);
    
    console.log('Testing specific user query...');
    const specificUser = await db.select().from(users).where(eq(users.email, 'test@example.com')).limit(1);
    console.log('Specific user:', specificUser);

  } catch (error) {
    console.error('Connection failed:', error);
  }
}

testConnection();
