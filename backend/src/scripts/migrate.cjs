#!/usr/bin/env node

/**
 * MongoDB Migration Script for RemotCyberHelp
 *
 * This script handles database migrations, schema updates, and index creation
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const connectDB = require('../config/database.cjs');

// Get current directory for path resolution
// const __filename = __filename;
// const __dirname = __dirname;

// Load environment variables from backend root
dotenv.config({ path: path.join(__dirname, '../../.env') });

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
 * Check environment before running migrations
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

  if (!process.env.JWT_SECRET) {
    colorLog('red', '❌ JWT_SECRET not configured!');
    colorLog('blue', '   Please run: npm run setup');
    return false;
  }

  return true;
}

// Migration functions
const migrations = {
  /**
   * Migration 001: Initial Schema Setup
   * Creates basic collections and indexes
   */
  async migration_001_initial_schema() {
    colorLog('blue', '🔄 Running Migration 001: Initial Schema Setup...');

    const db = mongoose.connection.db;

    // Create collections if they don't exist
    const collections = [
      'users',
      'services',
      'blogposts',
      'contacts',
      'consultations',
      'supporttickets',
      'governmentservices',
      'workinghours',
      'newsletters'
    ];

    for (const collectionName of collections) {
      try {
        await db.createCollection(collectionName);
        colorLog('green', `✅ Created collection: ${collectionName}`);
      } catch (error) {
        if (error.code === 48) { // Collection already exists
          colorLog('yellow', `📋 Collection already exists: ${collectionName}`);
        } else {
          colorLog('red', `❌ Error creating collection ${collectionName}: ${error.message}`);
        }
      }
    }

    // Create basic indexes
    await this.createBasicIndexes();

    colorLog('green', '✅ Migration 001 completed successfully');
  },

  /**
   * Migration 002: Enhanced Indexes for Performance
   * Creates compound indexes and text search indexes
   */
  async migration_002_enhanced_indexes() {
    colorLog('blue', '🔄 Running Migration 002: Enhanced Indexes...');

    const db = mongoose.connection.db;

    // Enhanced indexes for better performance
    const enhancedIndexes = [
      // Users - compound indexes
      { collection: 'users', index: { email: 1, isEmailVerified: 1 } },
      { collection: 'users', index: { role: 1, createdAt: -1 } },
      { collection: 'users', index: { 'profile.phone': 1 }, options: { sparse: true } },

      // Services - search and filtering
      { collection: 'services', index: { category: 1, isActive: 1, createdAt: -1 } },
      { collection: 'services', index: { name: 'text', description: 'text' } },

      // Blog posts - content discovery
      { collection: 'blogposts', index: { published: 1, category: 1, createdAt: -1 } },
      { collection: 'blogposts', index: { author: 1, published: 1 } },
      { collection: 'blogposts', index: { tags: 1, published: 1 } },
      { collection: 'blogposts', index: { title: 'text', content: 'text', excerpt: 'text' } },

      // Support tickets - efficient querying
      { collection: 'supporttickets', index: { userId: 1, status: 1, createdAt: -1 } },
      { collection: 'supporttickets', index: { assignedTo: 1, status: 1 }, options: { sparse: true } },
      { collection: 'supporttickets', index: { priority: 1, status: 1, createdAt: -1 } },

      // Consultations - scheduling optimization
      { collection: 'consultations', index: { userId: 1, scheduledDate: -1 } },
      { collection: 'consultations', index: { status: 1, scheduledDate: 1 } },
      { collection: 'consultations', index: { serviceType: 1, status: 1 } },

      // Contacts - quick lookups
      { collection: 'contacts', index: { email: 1, createdAt: -1 } },
      { collection: 'contacts', index: { status: 1, createdAt: -1 } }
    ];

    for (const { collection, index, options = {} } of enhancedIndexes) {
      try {
        await db.collection(collection).createIndex(index, options);
        colorLog('green', `✅ Created enhanced index on ${collection}: ${JSON.stringify(index)}`);
      } catch (error) {
        colorLog('red', `❌ Error creating index on ${collection}: ${error.message}`);
      }
    }

    colorLog('green', '✅ Migration 002 completed successfully');
  },

  /**
   * Migration 003: Data Integrity Constraints
   * Adds validation rules and constraints
   */
  async migration_003_data_integrity() {
    colorLog('blue', '🔄 Running Migration 003: Data Integrity Constraints...');

    const db = mongoose.connection.db;

    // Add validation rules
    const validationRules = {
      users: {
        $jsonSchema: {
          bsonType: "object",
          required: ["email", "password", "name", "role"],
          properties: {
            email: {
              bsonType: "string",
              pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"
            },
            role: {
              bsonType: "string",
              enum: ["user", "admin", "super_admin"]
            },
            isEmailVerified: {
              bsonType: "bool"
            }
          }
        }
      },
      services: {
        $jsonSchema: {
          bsonType: "object",
          required: ["name", "slug", "description", "category", "packages"],
          properties: {
            slug: {
              bsonType: "string",
              pattern: "^[a-z0-9-]+$"
            },
            category: {
              bsonType: "string",
              enum: ["technical", "digital", "consultation", "training", "emergency"]
            },
            isActive: {
              bsonType: "bool"
            }
          }
        }
      }
    };

    for (const [collectionName, validator] of Object.entries(validationRules)) {
      try {
        await db.command({
          collMod: collectionName,
          validator: validator
        });
        colorLog('green', `✅ Added validation rules for ${collectionName}`);
      } catch (error) {
        colorLog('red', `❌ Error adding validation for ${collectionName}: ${error.message}`);
      }
    }

    colorLog('green', '✅ Migration 003 completed successfully');
  },

  /**
   * Helper function to create basic indexes
   */
  async createBasicIndexes() {
    const db = mongoose.connection.db;

    // Basic indexes for all collections
    const basicIndexes = [
      // Users collection
      { collection: 'users', index: { email: 1 }, options: { unique: true } },
      { collection: 'users', index: { createdAt: -1 } },
      { collection: 'users', index: { role: 1 } },

      // Services collection
      { collection: 'services', index: { slug: 1 }, options: { unique: true } },
      { collection: 'services', index: { category: 1 } },
      { collection: 'services', index: { isActive: 1 } },

      // Blog posts collection
      { collection: 'blogposts', index: { published: 1, createdAt: -1 } },
      { collection: 'blogposts', index: { category: 1 } },
      { collection: 'blogposts', index: { slug: 1 }, options: { unique: true, sparse: true } },

      // Support tickets collection
      { collection: 'supporttickets', index: { userId: 1, createdAt: -1 } },
      { collection: 'supporttickets', index: { status: 1 } },

      // Consultations collection
      { collection: 'consultations', index: { userId: 1, scheduledDate: -1 } },
      { collection: 'consultations', index: { status: 1 } },

      // Contacts collection
      { collection: 'contacts', index: { createdAt: -1 } },
      { collection: 'contacts', index: { status: 1 } },

      // Government services collection
      { collection: 'governmentservices', index: { category: 1 } },
      { collection: 'governmentservices', index: { isActive: 1 } }
    ];

    for (const { collection, index, options = {} } of basicIndexes) {
      try {
        await db.collection(collection).createIndex(index, options);
        colorLog('green', `✅ Created basic index on ${collection}: ${JSON.stringify(index)}`);
      } catch (error) {
        if (error.code === 85) { // Index already exists
          colorLog('yellow', `📋 Index already exists on ${collection}: ${JSON.stringify(index)}`);
        } else {
          colorLog('red', `❌ Error creating index on ${collection}: ${error.message}`);
        }
      }
    }
  }
};

/**
 * Migration Status Tracking
 */
class MigrationTracker {
  constructor() {
    this.collectionName = '_migrations';
  }

  async ensureTrackingCollection() {
    const db = mongoose.connection.db;
    try {
      await db.createCollection(this.collectionName);
      await db.collection(this.collectionName).createIndex({ migrationName: 1 }, { unique: true });
    } catch (error) {
      // Collection might already exist
    }
  }

  async isCompleted(migrationName) {
    const db = mongoose.connection.db;
    const migration = await db.collection(this.collectionName).findOne({ migrationName });
    return !!migration;
  }

  async markCompleted(migrationName) {
    const db = mongoose.connection.db;
    await db.collection(this.collectionName).insertOne({
      migrationName,
      completedAt: new Date(),
      version: '1.0.0'
    });
  }

  async getAllCompleted() {
    const db = mongoose.connection.db;
    return await db.collection(this.collectionName).find({}).sort({ completedAt: 1 }).toArray();
  }
}

/**
 * Main migration runner
 */
async function runMigrations() {
  colorLog('blue', '🚀 Starting MongoDB Migrations for RemotCyberHelp...\n');

  // Check environment first
  if (!checkEnvironment()) {
    process.exit(1);
  }

  try {
    // Connect to database
    await connectDB();

    const tracker = new MigrationTracker();
    await tracker.ensureTrackingCollection();

    // Get list of available migrations
    const availableMigrations = [
      'migration_001_initial_schema',
      'migration_002_enhanced_indexes',
      'migration_003_data_integrity'
    ];

    colorLog('blue', `📋 Found ${availableMigrations.length} available migrations\n`);

    // Run each migration if not already completed
    for (const migrationName of availableMigrations) {
      if (await tracker.isCompleted(migrationName)) {
        colorLog('yellow', `⏭️  Skipping ${migrationName} (already completed)`);
        continue;
      }

      colorLog('blue', `🔄 Running ${migrationName}...`);

      try {
        await migrations[migrationName]();
        await tracker.markCompleted(migrationName);
        colorLog('green', `✅ Completed ${migrationName}\n`);
      } catch (error) {
        colorLog('red', `❌ Failed ${migrationName}: ${error.message}`);
        throw error;
      }
    }

    // Show completed migrations
    const completed = await tracker.getAllCompleted();
    colorLog('blue', '\n📊 Migration Summary:');
    colorLog('blue', `   Total Completed: ${completed.length}`);
    completed.forEach(m => {
      colorLog('green', `   ✅ ${m.migrationName} (${m.completedAt.toISOString()})`);
    });

    colorLog('green', '\n🎉 All migrations completed successfully!');

  } catch (error) {
    colorLog('red', `\n❌ Migration failed: ${error.message}`);

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
 * CLI Interface
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
RemotCyberHelp Migration Tool

Usage:
  npm run migrate              # Run all pending migrations
  npm run migrate --status     # Show migration status
  npm run migrate --help       # Show this help

Options:
  --status, -s    Show current migration status
  --help, -h      Show this help message

Examples:
  npm run migrate              # Run migrations
  npm run migrate -- --status  # Check status

Before running migrations:
  1. Set up environment: npm run setup
  2. Test connection: npm run test:db
  3. Run migrations: npm run migrate
    `);
    return;
  }

  if (args.includes('--status') || args.includes('-s')) {
    colorLog('blue', '📊 Checking Migration Status...\n');

    if (!checkEnvironment()) {
      process.exit(1);
    }

    try {
      await connectDB();
      const tracker = new MigrationTracker();
      await tracker.ensureTrackingCollection();

      const completed = await tracker.getAllCompleted();
      colorLog('blue', '📊 Migration Status:');

      if (completed.length === 0) {
        colorLog('yellow', '   No migrations have been run yet');
        colorLog('blue', '   Run "npm run migrate" to execute migrations');
      } else {
        completed.forEach(m => {
          colorLog('green', `   ✅ ${m.migrationName} (${m.completedAt.toISOString()})`);
        });
      }

      await mongoose.connection.close();
    } catch (error) {
      colorLog('red', `❌ Error checking migration status: ${error.message}`);
      process.exit(1);
    }
    return;
  }

  // Default: run migrations
  await runMigrations();
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    colorLog('red', `❌ Migration script failed: ${error.message}`);
    process.exit(1);
  });
}

module.exports = { migrations, MigrationTracker };
