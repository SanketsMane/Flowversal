#!/usr/bin/env node
/**
 * Code Quality Cleanup Script
 * Author: Sanket - Phase 3 automation for production readiness
 * 
 * This script removes console.log statements from production code
 * while preserving them in scripts and test files
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const SERVICE_NAME = 'Code Cleanup';

// Directories to clean
const BACKEND_SRC_DIR = path.join(process.cwd(), 'src');

// Directories to SKIP (preserve console.log in these)
const SKIP_DIRS = [
  '/scripts/',        // CLI scripts need console output
  '/tests/',          // Test files
  '/__tests__/',
  '/test/',
  '.test.ts',
  '.spec.ts',
];

// Patterns to skip
const SKIP_PATTERNS = [
  'logger.util.ts',   // Logger implementation itself
  'verify-connections.ts',  // Connection verification needs console
  'validate-env.ts',  // Environment validation needs console
  'migrate.ts',       // Migration scripts
  'dev-utils.ts',     // Dev utility scripts
  'debug-env.ts',     // Debug scripts
];

// Statistics
const stats = {
  filesScanned: 0,
  filesModified: 0,
  consoleLogsRemoved: 0,
};

/**
 * Check if file should be skipped
 */
function shouldSkipFile(filePath) {
  const relativePath = path.relative(BACKEND_SRC_DIR, filePath);
  
  // Skip if in excluded directories
  if (SKIP_DIRS.some(dir => relativePath.includes(dir))) {
    return true;
  }
  
  // Skip if matches excluded patterns
  if (SKIP_PATTERNS.some(pattern => relativePath.includes(pattern))) {
    return true;
  }
  
  return false;
}

/**
 * Remove console.log statements from a TypeScript/JavaScript file
 * Author: Sanket - Preserves console.error, console.warn, only removes console.log
 */
function removeConsoleLogs(filePath) {
  try {
    // Read file content
    const content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Remove console.log statements
    // Matches: console.log(...); including multiline
    const consoleLogPattern = /console\.log\([^;]*\);?/g;
    
    let modifiedContent = content;
    let removedCount = 0;
    
    // Count and remove console.log occurrences
    const matches = content.match(consoleLogPattern);
    if (matches) {
      removedCount = matches.length;
      modifiedContent = content.replace(consoleLogPattern, '');
      
      // Remove empty lines left behind
      modifiedContent = modifiedContent.replace(/^\s*\n/gm, '');
    }
    
    // Write back if changed
    if (modifiedContent !== originalContent && removedCount > 0) {
      fs.writeFileSync(filePath, modifiedContent, 'utf8');
      console.log(`✅ Removed ${removedCount} console.log from: ${path.relative(process.cwd(), filePath)}`);
      stats.filesModified++;
      stats.consoleLogsRemoved += removedCount;
      return removedCount;
    }
    
    return 0;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return 0;
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
        // Only process TypeScript and JavaScript files
        if (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx') || entry.name.endsWith('.js')) {
          stats.filesScanned++;
          
          if (shouldSkipFile(fullPath)) {
            console.log(`⏭️  Skipping: ${path.relative(process.cwd(), fullPath)}`);
            continue;
          }
          
          removeConsoleLogs(fullPath);
        }
      }
    }
  } catch (error) {
    console.error(`❌ Error reading directory ${dirPath}:`, error.message);
  }
}

/**
 * Main function
 */
function main() {
  console.log('🧹 Starting Code Quality Cleanup...\n');
  console.log('📁 Backend Source Directory:', BACKEND_SRC_DIR);
  console.log('⚠️  Directories/files to preserve:');
  SKIP_DIRS.forEach(dir => console.log(`   - ${dir}`));
  SKIP_PATTERNS.forEach(pattern => console.log(`   - ${pattern}`));
  console.log('\n' + '='.repeat(70) + '\n');
  
  // Check if directory exists
  if (!fs.existsSync(BACKEND_SRC_DIR)) {
    console.error(`❌ Directory not found: ${BACKEND_SRC_DIR}`);
    console.log('\n💡 Make sure to run this script from the Backend directory');
    process.exit(1);
  }
  
  // Process the directory
  processDirectory(BACKEND_SRC_DIR);
  
  // Print summary
  console.log('\n' + '='.repeat(70));
  console.log('\n📊 Cleanup Summary:\n');
  console.log(`  Files scanned:        ${stats.filesScanned}`);
  console.log(`  Files modified:       ${stats.filesModified}`);
  console.log(`  console.log removed:  ${stats.consoleLogsRemoved}`);
  console.log('\n✅ Code quality cleanup complete!\n');
  
  // Recommendations
  if (stats.consoleLogsRemoved > 0) {
    console.log('📝 Next Steps:');
    console.log('  1. Review changes: git diff');
    console.log('  2. Test the application: npm run dev');
    console.log('  3. Commit changes: git commit -m "chore: remove console.log statements"');
    console.log();
  }
}

// Run the script
main();
