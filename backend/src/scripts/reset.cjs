#!/usr/bin/env node

/**
 * Database Reset Script for RemotCyberHelp
 *
 * This script provides comprehensive reset controls for migrations and database seeding
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const connectDB = require('../config/database.cjs');
const readline = require('readline');

// Load environment variables from backend root
dotenv.config({ path: path.join(__dirname, '../../.env') });

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
 * Create readline interface for user input
 */
function createReadlineInterface() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
}

/**
 * Ask user for confirmation
 */
function askConfirmation(question) {
  return new Promise((resolve) => {
    const rl = createReadlineInterface();
    rl.question(`${colors.yellow}${question} (y/N): ${colors.reset}`, (answer) => {
      rl.close();
      resolve(answer.toLowerCase().trim() === 'y' || answer.toLowerCase().trim() === 'yes');
    });
  });
}

/**
 * Check environment before running reset operations
 */
function checkEnvironment() {
  const envPath = path.join(__dirname, '../../.env');

  if (!fs.existsSync(envPath)) {
    colorLog('red', '❌ .env file not found!');
    colorLog('yellow', '\n💡 Please set up your environment first:');
    colorLog('blue', '   npm run setup              # Interactive setup');
    colorLog('blue', '   npm run setup:quick        # Quick setup');
    return false;
  }

  if (!process.env.MONGODB_URI) {
    colorLog('red', '❌ MONGODB_URI not configured!');
    colorLog('blue', '   Please run: npm run setup');
    return false;
  }

  return true;
}

/**
 * Reset Functions
 */
const resetOperations = {
  /**
   * Reset migration tracking
   */
  async resetMigrations() {
    colorLog('blue', '🔄 Resetting migration tracking...');

    const db = mongoose.connection.db;

    try {
      // Drop migration tracking collection
      await db.collection('_migrations').drop();
      colorLog('green', '✅ Migration tracking reset successfully');
      colorLog('yellow', '💡 Run "npm run migrate" to re-execute all migrations');
    } catch (error) {
      if (error.message.includes('ns not found')) {
        colorLog('yellow', '📋 No migration tracking found (already clean)');
      } else {
        throw error;
      }
    }
  },

  /**
   * Reset all data (keep collections, remove documents)
   */
  async resetData() {
    colorLog('blue', '🔄 Resetting all data...');

    const db = mongoose.connection.db;

    const collections = [
      'users',
      'services',
      'blogposts',
      'contacts',
      'consultations',
      'supporttickets',
      'governmentservices',
      'newsletters'
    ];

    for (const collectionName of collections) {
      try {
        const result = await db.collection(collectionName).deleteMany({});
        colorLog('green', `✅ Cleared ${collectionName}: ${result.deletedCount} documents removed`);
      } catch (error) {
        colorLog('red', `❌ Error clearing ${collectionName}: ${error.message}`);
      }
    }

    colorLog('green', '✅ All data reset successfully');
    colorLog('yellow', '💡 Run "npm run seed" to re-populate with fresh data');
  },

  /**
   * Reset collections (drop and recreate)
   */
  async resetCollections() {
    colorLog('blue', '🔄 Resetting all collections...');

    const db = mongoose.connection.db;

    const collections = [
      'users',
      'services',
      'blogposts',
      'contacts',
      'consultations',
      'supporttickets',
      'governmentservices',
      'workinghours',
      'newsletters',
      '_migrations'
    ];

    for (const collectionName of collections) {
      try {
        await db.collection(collectionName).drop();
        colorLog('green', `✅ Dropped collection: ${collectionName}`);
      } catch (error) {
        if (error.message.includes('ns not found')) {
          colorLog('yellow', `📋 Collection doesn't exist: ${collectionName}`);
        } else {
          colorLog('red', `❌ Error dropping ${collectionName}: ${error.message}`);
        }
      }
    }

    colorLog('green', '✅ All collections reset successfully');
    colorLog('yellow', '💡 Run "npm run migrate" and "npm run seed" to rebuild');
  },

  /**
   * Reset indexes only
   */
  async resetIndexes() {
    colorLog('blue', '🔄 Resetting all indexes...');

    const db = mongoose.connection.db;

    const collections = await db.listCollections().toArray();

    for (const collection of collections) {
      const collectionName = collection.name;

      // Skip system collections
      if (collectionName.startsWith('system.')) {
        continue;
      }

      try {
        await db.collection(collectionName).dropIndexes();
        colorLog('green', `✅ Reset indexes for: ${collectionName}`);
      } catch (error) {
        colorLog('red', `❌ Error resetting indexes for ${collectionName}: ${error.message}`);
      }
    }

    colorLog('green', '✅ All indexes reset successfully');
    colorLog('yellow', '💡 Run "npm run migrate" to recreate optimized indexes');
  },

  /**
   * Complete database reset
   */
  async resetDatabase() {
    colorLog('blue', '🔄 Performing complete database reset...');

    const db = mongoose.connection.db;

    try {
      // Get all collections
      const collections = await db.listCollections().toArray();

      // Drop all collections except system ones
      for (const collection of collections) {
        const collectionName = collection.name;

        if (!collectionName.startsWith('system.')) {
          try {
            await db.collection(collectionName).drop();
            colorLog('green', `✅ Dropped: ${collectionName}`);
          } catch (error) {
            colorLog('red', `❌ Error dropping ${collectionName}: ${error.message}`);
          }
        }
      }

      colorLog('green', '✅ Complete database reset successful');
      colorLog('yellow', '💡 Database is now completely clean');
      colorLog('cyan', '🚀 Next steps:');
      colorLog('white', '   1. npm run migrate    # Recreate schema');
      colorLog('white', '   2. npm run seed       # Add initial data');

    } catch (error) {
      colorLog('red', `❌ Database reset failed: ${error.message}`);
      throw error;
    }
  }
};

/**
 * Interactive menu system
 */
async function showMenu() {
  console.clear();
  colorLog('cyan', '╔══════════════════════════════════════════════════════════╗');
  colorLog('cyan', '║                   🔄 DATABASE RESET TOOL                  ║');
  colorLog('cyan', '║                     RemotCyberHelp                        ║');
  colorLog('cyan', '╚══════════════════════════════════════════════════════════╝');
  console.log('');

  colorLog('blue', '📋 Available Reset Operations:');
  console.log('');
  colorLog('white', '  1. 🔄 Reset Migrations Only    - Clear migration tracking');
  colorLog('white', '  2. 📊 Reset Data Only          - Clear all documents, keep structure');
  colorLog('white', '  3. 🗂️  Reset Collections        - Drop and recreate collections');
  colorLog('white', '  4. 🔍 Reset Indexes Only       - Clear all database indexes');
  colorLog('white', '  5. 💥 Complete Database Reset  - Nuclear option (DANGEROUS)');
  colorLog('white', '  6. 📊 Show Database Status     - View current state');
  colorLog('white', '  7. ❌ Exit                     - Quit without changes');
  console.log('');

  const rl = createReadlineInterface();

  return new Promise((resolve) => {
    rl.question(`${colors.yellow}Select an option (1-7): ${colors.reset}`, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

/**
 * Show database status
 */
async function showDatabaseStatus() {
  colorLog('blue', '📊 Database Status Check...\n');

  const db = mongoose.connection.db;

  try {
    // Get database stats
    const stats = await db.stats();
    colorLog('green', `📋 Database: ${db.databaseName}`);
    colorLog('white', `   Collections: ${stats.collections}`);
    colorLog('white', `   Data Size: ${(stats.dataSize / 1024 / 1024).toFixed(2)} MB`);
    colorLog('white', `   Storage Size: ${(stats.storageSize / 1024 / 1024).toFixed(2)} MB`);

    console.log('');

    // List collections with document counts
    const collections = await db.listCollections().toArray();

    if (collections.length > 0) {
      colorLog('blue', '📚 Collections:');

      for (const collection of collections) {
        const collectionName = collection.name;

        if (!collectionName.startsWith('system.')) {
          try {
            const count = await db.collection(collectionName).countDocuments();
            const indexCount = await db.collection(collectionName).indexes();
            colorLog('white', `   ${collectionName}: ${count} documents, ${indexCount.length} indexes`);
          } catch (error) {
            colorLog('red', `   ${collectionName}: Error reading (${error.message})`);
          }
        }
      }
    } else {
      colorLog('yellow', '   No collections found');
    }

    console.log('');

    // Check migration status
    try {
      const migrations = await db.collection('_migrations').find({}).toArray();
      if (migrations.length > 0) {
        colorLog('blue', '🔄 Migration Status:');
        migrations.forEach(m => {
          colorLog('green', `   ✅ ${m.migrationName} (${new Date(m.completedAt).toISOString()})`);
        });
      } else {
        colorLog('yellow', '🔄 No migrations have been run');
      }
    } catch (error) {
      colorLog('yellow', '🔄 Migration tracking not initialized');
    }

  } catch (error) {
    colorLog('red', `❌ Error checking database status: ${error.message}`);
  }
}

/**
 * Main interactive runner
 */
async function runInteractive() {
  colorLog('blue', '🚀 Starting Database Reset Tool...\n');

  // Check environment first
  if (!checkEnvironment()) {
    process.exit(1);
  }

  try {
    // Connect to database
    await connectDB();
    colorLog('green', '✅ Connected to database\n');

    let running = true;

    while (running) {
      const choice = await showMenu();

      switch (choice) {
        case '1':
          if (await askConfirmation('This will reset migration tracking. Continue?')) {
            await resetOperations.resetMigrations();
            colorLog('green', '\n✅ Migration reset completed\n');
          } else {
            colorLog('yellow', '\n❌ Operation cancelled\n');
          }
          break;

        case '2':
          if (await askConfirmation('This will delete ALL DATA but keep collections. Continue?')) {
            await resetOperations.resetData();
            colorLog('green', '\n✅ Data reset completed\n');
          } else {
            colorLog('yellow', '\n❌ Operation cancelled\n');
          }
          break;

        case '3':
          if (await askConfirmation('This will DROP ALL COLLECTIONS. Continue?')) {
            await resetOperations.resetCollections();
            colorLog('green', '\n✅ Collections reset completed\n');
          } else {
            colorLog('yellow', '\n❌ Operation cancelled\n');
          }
          break;

        case '4':
          if (await askConfirmation('This will reset all database indexes. Continue?')) {
            await resetOperations.resetIndexes();
            colorLog('green', '\n✅ Indexes reset completed\n');
          } else {
            colorLog('yellow', '\n❌ Operation cancelled\n');
          }
          break;

        case '5':
          colorLog('red', '\n⚠️  WARNING: COMPLETE DATABASE RESET');
          colorLog('red', '⚠️  This will PERMANENTLY DELETE EVERYTHING!\n');

          if (await askConfirmation('Type "YES" to confirm complete database reset')) {
            await resetOperations.resetDatabase();
            colorLog('green', '\n✅ Complete database reset completed\n');
          } else {
            colorLog('yellow', '\n❌ Operation cancelled\n');
          }
          break;

        case '6':
          await showDatabaseStatus();
          console.log('\n');
          break;

        case '7':
          colorLog('blue', '\n👋 Goodbye!');
          running = false;
          break;

        default:
          colorLog('red', '\n❌ Invalid option. Please choose 1-7.\n');
          break;
      }

      if (running && choice !== '6') {
        await new Promise(resolve => {
          const rl = createReadlineInterface();
          rl.question(`${colors.cyan}Press Enter to continue...${colors.reset}`, () => {
            rl.close();
            resolve();
          });
        });
      }
    }

  } catch (error) {
    colorLog('red', `\n❌ Reset operation failed: ${error.message}`);

    // Provide troubleshooting guidance
    if (error.message.includes('ENOTFOUND') || error.message.includes('connection')) {
      colorLog('yellow', '\n💡 Connection issues detected:');
      colorLog('white', '   - Check your internet connection');
      colorLog('white', '   - Verify MONGODB_URI is correct');
      colorLog('white', '   - Ensure your IP is whitelisted in MongoDB Atlas');
      colorLog('white', '   - Test connection: npm run test:db');
    }

    process.exit(1);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    colorLog('blue', '\n📴 Database connection closed');
  }
}

/**
 * CLI Interface for direct commands
 */
async function runCommand(command) {
  colorLog('blue', `🚀 Running reset command: ${command}...\n`);

  // Check environment first
  if (!checkEnvironment()) {
    process.exit(1);
  }

  try {
    // Connect to database
    await connectDB();

    switch (command) {
      case 'migrations':
        await resetOperations.resetMigrations();
        break;
      case 'data':
        await resetOperations.resetData();
        break;
      case 'collections':
        await resetOperations.resetCollections();
        break;
      case 'indexes':
        await resetOperations.resetIndexes();
        break;
      case 'all':
        await resetOperations.resetDatabase();
        break;
      case 'status':
        await showDatabaseStatus();
        break;
      default:
        colorLog('red', `❌ Unknown command: ${command}`);
        showHelp();
        process.exit(1);
    }

    colorLog('green', '\n✅ Reset operation completed successfully!');

  } catch (error) {
    colorLog('red', `\n❌ Reset operation failed: ${error.message}`);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    colorLog('blue', '\n📴 Database connection closed');
  }
}

/**
 * Show help information
 */
function showHelp() {
  console.log(`
RemotCyberHelp Database Reset Tool

Usage:
  npm run reset                    # Interactive mode
  npm run reset migrations         # Reset migration tracking only
  npm run reset data              # Clear all data, keep structure
  npm run reset collections       # Drop all collections
  npm run reset indexes           # Reset all indexes
  npm run reset all               # Complete database reset (DANGEROUS)
  npm run reset status            # Show database status
  npm run reset --help            # Show this help

Interactive Mode:
  Run without arguments for a guided menu interface.

Direct Commands:
  migrations    - Reset migration tracking
  data         - Clear all documents but keep collections
  collections  - Drop and recreate all collections
  indexes      - Reset all database indexes
  all          - Nuclear option: complete database wipe
  status       - Show current database state

Safety:
  - Always backup your database before running reset operations
  - Most operations require confirmation prompts
  - Use 'status' command to check current state first

Examples:
  npm run reset                    # Start interactive menu
  npm run reset status            # Check database state
  npm run reset migrations        # Reset migration tracking
  npm run reset -- --help        # Show this help
  `);
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    showHelp();
    return;
  }

  // If no arguments, run interactive mode
  if (args.length === 0) {
    await runInteractive();
    return;
  }

  // Run specific command
  const command = args[0];
  await runCommand(command);
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Reset script failed:', error);
    process.exit(1);
  });
}

module.exports = { resetOperations };
