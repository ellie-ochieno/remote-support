#!/usr/bin/env node

/**
 * MongoDB Connection Test (CommonJS version)
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
const envPath = path.join(__dirname, '../../.env');
dotenv.config({ path: envPath });

console.log('🔍 Testing MongoDB Connection...');

// Check environment
if (!process.env.MONGODB_URI) {
  console.error('❌ MONGODB_URI not found');
  process.exit(1);
}

// Test connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB Connected successfully!');
    console.log('Database:', mongoose.connection.name);
    mongoose.connection.close();
  })
  .catch(error => {
    console.error('❌ Connection failed:', error.message);
    process.exit(1);
  });
