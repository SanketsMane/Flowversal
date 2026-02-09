#!/usr/bin/env node
/**
 * Production Readiness Interactive Helper
 * Author: Sanket - Guides user through critical manual actions
 */

const readline = require('readline');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Progress tracking
const PROGRESS_FILE = path.join(__dirname, '.production-readiness-progress.json');

function loadProgress() {
  if (fs.existsSync(PROGRESS_FILE)) {
    return JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf8'));
  }
  return {
    redisSetup: false,
    credentialsRotated: {
      mongodb: false,
      supabase: false,
      pinecone: false,
      neon: false,
      openrouter: false,
      inngest: false
    },
    gitHistoryClean: false,
    startedAt: new Date().toISOString()
  };
}

function saveProgress(progress) {
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
}

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function main() {
  console.log('\n🚀 FlowversalAI Production Readiness Helper\n');
  console.log('=' .repeat(60));
  
  const progress = loadProgress();
  
  console.log('\n📊 Current Progress:\n');
  console.log(`  Redis Setup: ${progress.redisSetup ? '✅' : '❌'}`);
  console.log(`  Credentials Rotated:`);
  console.log(`    - MongoDB: ${progress.credentialsRotated.mongodb ? '✅' : '❌'}`);
  console.log(`    - Supabase: ${progress.credentialsRotated.supabase ? '✅' : '❌'}`);
  console.log(`    - Pinecone: ${progress.credentialsRotated.pinecone ? '✅' : '❌'}`);
  console.log(`    - Neon DB: ${progress.credentialsRotated.neon ? '✅' : '❌'}`);
  console.log(`    - OpenRouter: ${progress.credentialsRotated.openrouter ? '✅' : '❌'}`);
  console.log(`    - Inngest: ${progress.credentialsRotated.inngest ? '✅' : '❌'}`);
  console.log(`  Git History Clean: ${progress.gitHistoryClean ? '✅' : '❌'}`);
  
  console.log('\n' + '='.repeat(60));
  console.log('\nWhat would you like to do?\n');
  console.log('1. Set up Redis');
  console.log('2. Rotate credentials (guided)');
  console.log('3. Clean git history');
  console.log('4. Check verification status');
  console.log('5. Exit\n');
  
  const choice = await question('Enter your choice (1-5): ');
  
  switch(choice.trim()) {
    case '1':
      await setupRedis(progress);
      break;
    case '2':
      await rotateCredentials(progress);
      break;
    case '3':
      await cleanGitHistory(progress);
      break;
    case '4':
      await checkStatus();
      break;
    case '5':
      console.log('\n👋 Goodbye!\n');
      rl.close();
      return;
    default:
      console.log('\n❌ Invalid choice. Please try again.\n');
  }
  
  saveProgress(progress);
  
  // Ask if they want to continue
  const continueChoice = await question('\nContinue with another action? (y/n): ');
  if (continueChoice.toLowerCase() === 'y') {
    await main();
  } else {
    console.log('\n✅ Progress saved! Run this script again to continue.\n');
    rl.close();
  }
}

async function setupRedis(progress) {
  console.log('\n🔴 Redis Setup\n');
  console.log('Choose your Redis provider:\n');
  console.log('1. Upstash (Recommended - Free tier, 5 min setup)');
  console.log('2. Redis Cloud (Good for production)');
  console.log('3. Local Redis (Docker - for testing only)');
  console.log('4. Skip for now\n');
  
  const choice = await question('Enter your choice (1-4): ');
  
  switch(choice.trim()) {
    case '1':
      console.log('\n📝 Upstash Setup Instructions:\n');
      console.log('1. Go to: https://console.upstash.com/');
      console.log('2. Sign up/Login');
      console.log('3. Click "Create Database"');
      console.log('4. Name: flowversalai-prod');
      console.log('5. Choose region closest to your backend');
      console.log('6. Click "Create"\n');
      
      const hasAccount = await question('Have you completed the setup? (y/n): ');
      
      if (hasAccount.toLowerCase() === 'y') {
        console.log('\n📋 Now copy your connection details:\n');
        const host = await question('Enter REDIS_HOST (e.g., abc-123.upstash.io): ');
        const port = await question('Enter REDIS_PORT (usually 6379): ');
        const password = await question('Enter REDIS_PASSWORD: ');
        
        // Update .env file
        updateEnvFile('REDIS_HOST', host);
        updateEnvFile('REDIS_PORT', port);
        updateEnvFile('REDIS_PASSWORD', password);
        
        console.log('\n✅ Redis connection details updated in Backend/.env');
        console.log('\n🧪 Testing connection...\n');
        
        // User should test
        console.log('Run: cd Backend && npm run verify:connections');
        
        progress.redisSetup = true;
      }
      break;
      
    case '3':
      console.log('\n🐳 Local Redis Setup (Docker):\n');
      console.log('Run these commands:\n');
      console.log('  docker pull redis:latest');
      console.log('  docker run -d -p 6379:6379 --name flowversalai-redis redis\n');
      console.log('Then update Backend/.env:');
      console.log('  REDIS_HOST=localhost');
      console.log('  REDIS_PORT=6379');
      console.log('  REDIS_PASSWORD=\n');
      
      const dockerDone = await question('Completed? (y/n): ');
      if (dockerDone.toLowerCase() === 'y') {
        updateEnvFile('REDIS_HOST', 'localhost');
        updateEnvFile('REDIS_PORT', '6379');
        updateEnvFile('REDIS_PASSWORD', '');
        progress.redisSetup = true;
      }
      break;
  }
}

async function rotateCredentials(progress) {
  console.log('\n🔐 Credential Rotation Guide\n');
  console.log('We\'ll go through each service one by one.\n');
  
  const services = [
    { key: 'mongodb', name: 'MongoDB Atlas', url: 'https://cloud.mongodb.com/' },
    { key: 'supabase', name: 'Supabase', url: 'https://supabase.com/dashboard' },
    { key: 'pinecone', name: 'Pinecone', url: 'https://app.pinecone.io/' },
    { key: 'neon', name: 'Neon Database', url: 'https://console.neon.tech/' },
    { key: 'openrouter', name: 'OpenRouter (Optional)', url: 'https://openrouter.ai/' },
    { key: 'inngest', name: 'Inngest (Optional)', url: 'https://app.inngest.com/' }
  ];
  
  for (const service of services) {
    if (progress.credentialsRotated[service.key]) {
      console.log(`✅ ${service.name} - Already rotated`);
      continue;
    }
    
    console.log(`\n📝 ${service.name}`);
    console.log(`   URL: ${service.url}\n`);
    
    const rotate = await question(`Rotate ${service.name} credentials? (y/n/skip): `);
    
    if (rotate.toLowerCase() === 'y') {
      console.log(`\n1. Open: ${service.url}`);
      console.log('2. Generate new credentials');
      console.log('3. Copy them below\n');
      
      const completed = await question('Completed and ready to enter new credentials? (y/n): ');
      
      if (completed.toLowerCase() === 'y') {
        await handleServiceCredentials(service.key);
        progress.credentialsRotated[service.key] = true;
        console.log(`\n✅ ${service.name} credentials updated!`);
      }
    }
  }
}

async function handleServiceCredentials(serviceKey) {
  switch(serviceKey) {
    case 'mongodb':
      const mongoUri = await question('Enter new MONGODB_URI: ');
      updateEnvFile('MONGODB_URI', mongoUri);
      break;
    case 'supabase':
      const supabaseUrl = await question('Enter SUPABASE_URL: ');
      const serviceRole = await question('Enter SUPABASE_SERVICE_ROLE_KEY: ');
      const anonKey = await question('Enter SUPABASE_ANON_KEY: ');
      const jwtSecret = await question('Enter JWT_SECRET: ');
      updateEnvFile('SUPABASE_URL', supabaseUrl);
      updateEnvFile('SUPABASE_SERVICE_ROLE_KEY', serviceRole);
      updateEnvFile('SUPABASE_ANON_KEY', anonKey);
      updateEnvFile('JWT_SECRET', jwtSecret);
      break;
    case 'pinecone':
      const pineconeKey = await question('Enter new PINECONE_API_KEY: ');
      updateEnvFile('PINECONE_API_KEY', pineconeKey);
      break;
    case 'neon':
      const neonUrl = await question('Enter new NEON_DATABASE_URL: ');
      updateEnvFile('NEON_DATABASE_URL', neonUrl);
      break;
    case 'openrouter':
      const openrouterKey = await question('Enter new OPENROUTER_API_KEY: ');
      updateEnvFile('OPENROUTER_API_KEY', openrouterKey);
      break;
    case 'inngest':
      const inngestEvent = await question('Enter new INNGEST_EVENT_KEY: ');
      const inngestSigning = await question('Enter new INNGEST_SIGNING_KEY: ');
      updateEnvFile('INNGEST_EVENT_KEY', inngestEvent);
      updateEnvFile('INNGEST_SIGNING_KEY', inngestSigning);
      break;
  }
}

async function cleanGitHistory(progress) {
  console.log('\n🗑️  Git History Cleanup\n');
  console.log('⚠️  WARNING: This will rewrite git history!\n');
  console.log('Choose method:\n');
  console.log('1. Simple removal (removes from tracking only)');
  console.log('2. Complete removal with BFG (removes from all history)');
  console.log('3. Skip for now\n');
  
  const choice = await question('Enter your choice (1-3): ');
  
  if (choice === '1') {
    console.log('\n Running: git rm --cached Backend/.env Frontend/.env\n');
    console.log('You\'ll need to run these commands manually:');
    console.log('  cd c:\\Users\\rohan\\Documents\\FlowversalAI-main\\FlowversalAI-main');
    console.log('  git rm --cached Backend/.env Frontend/.env');
    console.log('  git commit -m "chore: remove .env files from tracking"');
    
    progress.gitHistoryClean = true;
  } else if (choice === '2') {
    console.log('\n📦 BFG Repo-Cleaner Method:\n');
    console.log('1. Download BFG: https://rtyley.github.io/bfg-repo-cleaner/');
    console.log('2. Save to: c:\\Users\\rohan\\Downloads\\bfg-1.14.0.jar\n');
    console.log('3. Run these commands:\n');
    console.log('  cd c:\\Users\\rohan\\Documents\\FlowversalAI-main\\FlowversalAI-main');
    console.log('  java -jar c:\\Users\\rohan\\Downloads\\bfg-1.14.0.jar --delete-files .env');
    console.log('  git reflog expire --expire=now --all');
    console.log('  git gc --prune=now --aggressive\n');
    
    const done = await question('Completed? (y/n): ');
    if (done.toLowerCase() === 'y') {
      progress.gitHistoryClean = true;
    }
  }
}

async function checkStatus() {
  console.log('\n🧪 Running verification checks...\n');
  console.log('Run these commands to verify:\n');
  console.log('  cd Backend');
  console.log('  npm run validate:env');
  console.log('  npm run verify:connections\n');
}

function updateEnvFile(key, value) {
  const envPath = path.join(__dirname, 'Backend', '.env');
  let envContent = fs.readFileSync(envPath, 'utf8');
  
  const regex = new RegExp(`^${key}=.*$`, 'm');
  if (regex.test(envContent)) {
    // Update existing
    envContent = envContent.replace(regex, `${key}=${value}`);
  } else {
    // Add new
    envContent += `\n${key}=${value}`;
  }
  
  fs.writeFileSync(envPath, envContent);
}

// Run the interactive helper
main().catch(console.error);
