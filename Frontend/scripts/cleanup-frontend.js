#!/usr/bin/env node
/**
 * Frontend Code Quality Cleanup Script
 * Author: Sanket - Phase 3 automation for production readiness
 * 
 * Removes console.log, demo tokens, and auto-login logic from Frontend
 */

const fs = require('fs');
const path = require('path');

const SERVICE_NAME = 'Frontend Cleanup';

// Directories to clean
const FRONTEND_SRC_DIR = path.join(process.cwd(), 'src');

// Directories to SKIP
const SKIP_DIRS = [
  '/tests/',
  '/__tests__/',
  '/test/',
  '.test.ts',
  '.test.tsx',
  '.spec.ts',
  '.spec.tsx',
];

// Files to completely remove (demo/test utilities)
const FILES_TO_REMOVE = [
  'src/shared/utils/autoLogin.ts',  // Auto-login bypass - development only
];

// Demo token patterns to remove
const DEMO_TOKEN_PATTERNS = [
  /justin-access-token/g,
  /demo-access-token/g,
];

// Statistics
const stats = {
  filesScanned: 0,
  filesModified: 0,
  filesRemoved: 0,
  consoleLogsRemoved: 0,
  demoTokensRemoved: 0,
};

/**
 * Check if file should be skipped
 */
function shouldSkipFile(filePath) {
  const relativePath = path.relative(FRONTEND_SRC_DIR, filePath);
  
  // Skip if in excluded directories
  if (SKIP_DIRS.some(dir => relativePath.includes(dir))) {
    return true;
  }
  
  return false;
}

/**
 * Remove demo authentication tokens
 * Author: Sanket - Removes hardcoded demo tokens from server functions
 */
function removeDemoTokens(content) {
  let modified = content;
  let removedCount = 0;
  
  // Remove demo token checks (e.g., if (token === 'demo-access-token'))
  const demoTokenCheckPattern = /if\s*\(\s*token\s*===\s*['"](?:demo-access-token|justin-access-token)['"]\s*\)\s*\{[^}]*\}/gs;
  const matches = modified.match(demoTokenCheckPattern);
  if (matches) {
    removedCount += matches.length;
    modified = modified.replace(demoTokenCheckPattern, '');
  }
  
  // Remove comments mentioning demo tokens
  const demoCommentPattern = /\/\/.*(?:demo-access-token|justin-access-token).*/gi;
  modified = modified.replace(demoCommentPattern, '');
  
  return { modified, removedCount };
}

/**
 * Remove console.log statements
 */
function removeConsoleLogs(content) {
  // Remove console.log statements (including multiline)
  const consoleLogPattern = /console\.log\([^;]*\);?/g;
  
  const matches = content.match(consoleLogPattern);
  const removedCount = matches ? matches.length : 0;
  
  let modified = content;
  if (removedCount > 0) {
    modified = content.replace(consoleLogPattern, '');
    // Remove empty lines
    modified = modified.replace(/^\s*\n/gm, '');
  }
  
  return { modified, removedCount };
}

/**
 * Process a single file
 */
function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    let modifiedContent = content;
    let consoleRemoved = 0;
    let tokensRemoved = 0;
    
    // Remove console.log
    const consoleResult = removeConsoleLogs(modifiedContent);
    modifiedContent = consoleResult.modified;
    consoleRemoved = consoleResult.removedCount;
    
    // Remove demo tokens
    const tokenResult = removeDemoTokens(modifiedContent);
    modifiedContent = tokenResult.modified;
    tokensRemoved = tokenResult.removedCount;
    
    // Write back if changed
    if (modifiedContent !== originalContent) {
      fs.writeFileSync(filePath, modifiedContent, 'utf8');
      
      const relativePath = path.relative(process.cwd(), filePath);
      if (consoleRemoved > 0 || tokensRemoved > 0) {
        console.log(`✅ ${relativePath}`);
        if (consoleRemoved > 0) console.log(`   - Removed ${consoleRemoved} console.log`);
        if (tokensRemoved > 0) console.log(`   - Removed ${tokensRemoved} demo tokens`);
      }
      
      stats.filesModified++;
      stats.consoleLogsRemoved += consoleRemoved;
      stats.demoTokensRemoved += tokensRemoved;
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
}

/**
 * Recursively process directory
 */
function processDirectory(dirPath) {
  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      
      if (entry.isDirectory()) {
        // Skip node_modules, dist, build
        if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name === 'build') {
          continue;
        }
        processDirectory(fullPath);
      } else if (entry.isFile()) {
        // Process TypeScript and TypeScript React files
        if (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx') || entry.name.endsWith('.js') || entry.name.endsWith('.jsx')) {
          stats.filesScanned++;
          
          if (shouldSkipFile(fullPath)) {
            continue;
          }
          
          processFile(fullPath);
        }
      }
    }
  } catch (error) {
    console.error(`❌ Error reading directory ${dirPath}:`, error.message);
  }
}

/**
 * Remove specific files (e.g., autoLogin.ts)
 */
function removeSpecificFiles() {
  console.log('\n🗑️  Removing development-only files...\n');
  
  for (const filePattern of FILES_TO_REMOVE) {
    const filePath = path.join(process.cwd(), filePattern);
    
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
        console.log(`✅ Removed: ${filePattern}`);
        stats.filesRemoved++;
      } catch (error) {
        console.error(`❌ Failed to remove ${filePattern}:`, error.message);
      }
    } else {
      console.log(`⏭️  File not found (may already be removed): ${filePattern}`);
    }
  }
}

/**
 * Main function
 */
function main() {
  console.log('🧹 Starting Frontend Code Quality Cleanup...\n');
  console.log('📁 Frontend Source Directory:', FRONTEND_SRC_DIR);
  console.log('\n' + '='.repeat(70) + '\n');
  
  // Check if directory exists
  if (!fs.existsSync(FRONTEND_SRC_DIR)) {
    console.error(`❌ Directory not found: ${FRONTEND_SRC_DIR}`);
    console.log('\n💡 Make sure to run this script from the Frontend directory');
    process.exit(1);
  }
  
  // Step 1: Remove specific files
  removeSpecificFiles();
  
  // Step 2: Process all files
  console.log('\n📝 Processing source files...\n');
  processDirectory(FRONTEND_SRC_DIR);
  
  // Print summary
  console.log('\n' + '='.repeat(70));
  console.log('\n📊 Cleanup Summary:\n');
  console.log(`  Files scanned:        ${stats.filesScanned}`);
  console.log(`  Files modified:       ${stats.filesModified}`);
  console.log(`  Files removed:        ${stats.filesRemoved}`);
  console.log(`  console.log removed:  ${stats.consoleLogsRemoved}`);
  console.log(`  Demo tokens removed:  ${stats.demoTokensRemoved}`);
  console.log('\n✅ Frontend code quality cleanup complete!\n');
  
  // Recommendations
  if (stats.filesModified > 0 || stats.filesRemoved > 0) {
    console.log('📝 Next Steps:');
    console.log('  1. Review changes: git diff');
    console.log('  2. Update imports that reference autoLogin.ts (if removed)');
    console.log('  3. Test the application: npm run dev');
    console.log('  4. Build for production: npm run build');
    console.log();
  }
  
  // Warnings
  if (stats.demoTokensRemoved > 0) {
    console.log('⚠️  WARNING: Demo authentication tokens were removed');
    console.log('   Ensure Supabase authentication is properly configured');
    console.log();
  }
}

// Run the script
main();
