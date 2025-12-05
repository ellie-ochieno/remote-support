#!/usr/bin/env node

/**
 * Pre-migration Check Script
 * Ensures environment is properly configured before running migrations
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Colors for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function colorLog(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * Check if .env file exists and has required variables
 */
function checkEnvironment() {
  const envPath = path.join(__dirname, '../../.env');
  
  if (!fs.existsSync(envPath)) {
    colorLog('red', '❌ .env file not found!');
    colorLog('yellow', '\n💡 Please set up your environment first:');
    colorLog('blue', '   npm run setup              # Interactive setup');
    colorLog('blue', '   npm run setup:quick        # Quick setup');
    colorLog('white', '\nOr copy .env.example to .env and configure manually.');
    return false;
  }
  
  // Read and check for required variables
  const envContent = fs.readFileSync(envPath, 'utf8');
  const requiredVars = [
    'MONGODB_URI',
    'JWT_SECRET'
  ];
  
  const missingVars = [];
  
  for (const varName of requiredVars) {
    if (!envContent.includes(`${varName}=`) || envContent.includes(`${varName}=`)) {
      // Check if it's actually set with a value
      const match = envContent.match(new RegExp(`${varName}=(.+)`));
      if (!match || !match[1].trim()) {
        missingVars.push(varName);
      }
    }
  }
  
  if (missingVars.length > 0) {
    colorLog('red', '❌ Missing required environment variables:');
    missingVars.forEach(varName => {
      colorLog('yellow', `   - ${varName}`);
    });
    colorLog('blue', '\nRun "npm run setup" to configure your environment.');
    return false;
  }
  
  colorLog('green', '✅ Environment configuration looks good!');
  return true;
}

/**
 * Main check function
 */
function main() {
  colorLog('blue', '🔍 Pre-migration Environment Check\n');
  
  const isValid = checkEnvironment();
  
  if (!isValid) {
    process.exit(1);
  }
  
  colorLog('green', '✅ Environment check passed! You can now run migrations.\n');
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { checkEnvironment };