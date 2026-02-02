
import dotenv from 'dotenv';
import path from 'path';

// Manual dotenv load just like env.ts
dotenv.config();
const rootEnvPath = path.resolve(__dirname, '../../.env');
console.log('Current directory:', process.cwd());
console.log('Looking for .env at:', path.resolve('.env'));
console.log('Looking for root .env at:', rootEnvPath);

console.log('--- DIRECT PROCESS.ENV ACCESS ---');
console.log('OPENROUTER_API_KEY:', process.env.OPENROUTER_API_KEY ? 'DEFINED' : 'UNDEFINED');
console.log('OPENROUTER_API_KEY length:', process.env.OPENROUTER_API_KEY?.length);
console.log('OPENROUTER_API_KEY preview:', process.env.OPENROUTER_API_KEY?.substring(0, 5));

console.log('--- ENV MODULE ACCESS ---');
try {
  const { env } = require('../core/config/env');
  console.log('env.OPENROUTER_API_KEY:', env.OPENROUTER_API_KEY ? 'DEFINED' : 'UNDEFINED');
  console.log('env.OPENROUTER_API_KEY length:', env.OPENROUTER_API_KEY?.length);
} catch (e) {
  console.error('Failed to load env module:', e);
}
