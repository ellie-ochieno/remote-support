#!/usr/bin/env node

/**
 * Environment Setup Script for RemotCyberHelp Backend
 * 
 * This script helps users set up their environment configuration
 */

import fs from 'fs';
import path from 'path';
import readline from 'readline';
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
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  reset: '\x1b[0m'
};

function colorLog(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * Create readline interface
 */
function createInterface() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
}

/**
 * Ask user a question
 */
function askQuestion(rl, question, defaultValue = '') {
  return new Promise((resolve) => {
    const prompt = defaultValue 
      ? `${question} (${defaultValue}): `
      : `${question}: `;
    
    rl.question(prompt, (answer) => {
      resolve(answer.trim() || defaultValue);
    });
  });
}

/**
 * Generate a secure random string
 */
function generateSecureSecret(length = 64) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Check if .env file exists
 */
function checkEnvFile() {
  const envPath = path.join(__dirname, '../../.env');
  return fs.existsSync(envPath);
}

/**
 * Setup environment interactively
 */
async function setupEnvironment() {
  colorLog('cyan', '🔧 RemotCyberHelp Backend Environment Setup\n');
  
  const rl = createInterface();
  const envPath = path.join(__dirname, '../../.env');
  const envExists = checkEnvFile();
  
  if (envExists) {
    colorLog('yellow', '⚠️  .env file already exists!');
    const overwrite = await askQuestion(rl, 'Do you want to overwrite it? (y/N)', 'N');
    
    if (overwrite.toLowerCase() !== 'y' && overwrite.toLowerCase() !== 'yes') {
      colorLog('blue', '✅ Setup cancelled. Existing .env file preserved.');
      rl.close();
      return;
    }
  }
  
  colorLog('blue', '📝 Please provide the following information:\n');
  
  // MongoDB Configuration
  colorLog('yellow', '🍃 MongoDB Configuration:');
  const mongoUri = await askQuestion(rl, 
    'MongoDB URI (from MongoDB Atlas)', 
    'mongodb+srv://username:password@cluster.mongodb.net/remotcyberhelp?retryWrites=true&w=majority'
  );
  
  // JWT Configuration
  colorLog('yellow', '\n🔐 JWT Configuration:');
  const jwtSecret = await askQuestion(rl, 
    'JWT Secret (leave empty to auto-generate)', 
    ''
  ) || generateSecureSecret();
  
  const jwtRefreshSecret = await askQuestion(rl, 
    'JWT Refresh Secret (leave empty to auto-generate)', 
    ''
  ) || generateSecureSecret();
  
  const jwtExpiresIn = await askQuestion(rl, 'JWT Expires In', '7d');
  const jwtRefreshExpiresIn = await askQuestion(rl, 'JWT Refresh Expires In', '30d');
  
  // Server Configuration
  colorLog('yellow', '\n🌐 Server Configuration:');
  const port = await askQuestion(rl, 'Server Port', '5000');
  const nodeEnv = await askQuestion(rl, 'Node Environment (development/production)', 'development');
  const corsOrigin = await askQuestion(rl, 'CORS Origin (frontend URL)', 'http://localhost:5173');
  
  // Security Configuration
  colorLog('yellow', '\n🔒 Security Configuration:');
  const requireEmailVerification = await askQuestion(rl, 'Require Email Verification? (true/false)', 'false');
  const maxLoginAttempts = await askQuestion(rl, 'Max Login Attempts', '5');
  const lockTime = await askQuestion(rl, 'Account Lock Time (ms)', '7200000');
  const bcryptRounds = await askQuestion(rl, 'BCrypt Rounds', '12');
  
  // Create .env content
  const envContent = `# MongoDB Configuration
MONGODB_URI=${mongoUri}

# JWT Configuration
JWT_SECRET=${jwtSecret}
JWT_EXPIRES_IN=${jwtExpiresIn}
JWT_REFRESH_SECRET=${jwtRefreshSecret}
JWT_REFRESH_EXPIRES_IN=${jwtRefreshExpiresIn}

# Server Configuration
PORT=${port}
NODE_ENV=${nodeEnv}
CORS_ORIGIN=${corsOrigin}

# Security Configuration
REQUIRE_EMAIL_VERIFICATION=${requireEmailVerification}
MAX_LOGIN_ATTEMPTS=${maxLoginAttempts}
LOCK_TIME=${lockTime}
BCRYPT_ROUNDS=${bcryptRounds}

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# File Upload Configuration
MAX_FILE_SIZE=5242880
UPLOAD_DIR=uploads

# API Configuration
API_VERSION=v1

# Security Headers
HELMET_ENABLED=true

# Logging
LOG_LEVEL=info
LOG_FILE=logs/app.log

# Email Configuration (Optional - configure for production)
# EMAIL_HOST=smtp.gmail.com
# EMAIL_PORT=587
# EMAIL_USER=your-email@gmail.com
# EMAIL_PASS=your-app-specific-password
# EMAIL_FROM=RemotCyberHelp <no-reply@remotcyberhelp.com>
`;
  
  try {
    fs.writeFileSync(envPath, envContent);
    colorLog('green', '\n✅ .env file created successfully!');
    
    // Show next steps
    colorLog('cyan', '\n📋 Next Steps:');
    colorLog('white', '1. Test your database connection:');
    colorLog('blue', '   npm run test:db');
    colorLog('white', '2. Run database migrations:');
    colorLog('blue', '   npm run migrate');
    colorLog('white', '3. Start the development server:');
    colorLog('blue', '   npm run dev');
    
    colorLog('yellow', '\n💡 Tips:');
    colorLog('white', '• Make sure your MongoDB Atlas cluster is running');
    colorLog('white', '• Whitelist your IP address in MongoDB Atlas');
    colorLog('white', '• Keep your .env file secure and never commit it to version control');
    
  } catch (error) {
    colorLog('red', `❌ Error creating .env file: ${error.message}`);
    process.exit(1);
  }
  
  rl.close();
}

/**
 * Quick setup with defaults
 */
async function quickSetup() {
  colorLog('cyan', '🚀 Quick Setup with Defaults\n');
  
  const rl = createInterface();
  const envPath = path.join(__dirname, '../../.env');
  
  const mongoUri = await askQuestion(rl, 
    'MongoDB URI (required)', 
    ''
  );
  
  if (!mongoUri) {
    colorLog('red', '❌ MongoDB URI is required!');
    rl.close();
    process.exit(1);
  }
  
  const envContent = `# MongoDB Configuration
MONGODB_URI=${mongoUri}

# JWT Configuration
JWT_SECRET=${generateSecureSecret()}
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=${generateSecureSecret()}
JWT_REFRESH_EXPIRES_IN=30d

# Server Configuration
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173

# Security Configuration
REQUIRE_EMAIL_VERIFICATION=false
MAX_LOGIN_ATTEMPTS=5
LOCK_TIME=7200000
BCRYPT_ROUNDS=12

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# File Upload Configuration
MAX_FILE_SIZE=5242880
UPLOAD_DIR=uploads

# API Configuration
API_VERSION=v1

# Security Headers
HELMET_ENABLED=true

# Logging
LOG_LEVEL=info
LOG_FILE=logs/app.log
`;
  
  try {
    fs.writeFileSync(envPath, envContent);
    colorLog('green', '✅ Quick setup completed!');
    colorLog('blue', 'Run "npm run test:db" to test your connection.');
  } catch (error) {
    colorLog('red', `❌ Error: ${error.message}`);
  }
  
  rl.close();
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
RemotCyberHelp Backend Environment Setup

Usage:
  node src/scripts/setup-env.js                # Interactive setup
  node src/scripts/setup-env.js --quick        # Quick setup with defaults
  node src/scripts/setup-env.js --help         # Show this help

Options:
  --quick, -q     Quick setup with minimal prompts
  --help, -h      Show this help message

This script will:
  ✅ Create a .env file with your configuration
  ✅ Generate secure JWT secrets
  ✅ Set up development defaults
  ✅ Provide next steps guidance
    `);
    return;
  }
  
  if (args.includes('--quick') || args.includes('-q')) {
    await quickSetup();
  } else {
    await setupEnvironment();
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    colorLog('red', `❌ Setup failed: ${error.message}`);
    process.exit(1);
  });
}

export { setupEnvironment, quickSetup };