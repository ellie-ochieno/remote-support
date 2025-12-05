// remotecyberhelp\backend\src\config\database.cjs

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const logger = require('../utils/logger.cjs');

dotenv.config();

// MongoDB connection configuration
const connectDB = async () => {
  try {
    // ✅ Ensure we have a MongoDB URI from environment variables
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is not defined');
    }

    // 📝 Log database name from URI for debugging
    logger.info('🔄 Connecting to MongoDB Atlas...');
    logger.info(
      `📍 Database: ${
        process.env.MONGODB_URI.split('/').pop()?.split('?')[0] || 'Unknown'
      }`
    );

    // ✅ Connect to MongoDB Atlas using Mongoose
    // Keep options minimal — Atlas URI already contains SSL/auth configs
    const connection = await mongoose.connect(process.env.MONGODB_URI, {
      maxPoolSize: 10,              // Number of concurrent socket connections
      serverSelectionTimeoutMS: 10000, // Timeout if server is not found (10s)
      socketTimeoutMS: 45000,       // Close sockets after 45s inactivity
    });

    // ✅ Log successful connection details
    logger.info('✅ MongoDB Atlas connected successfully');
    logger.info(`🏠 Host: ${connection.connection.host}`);
    logger.info(`📊 Database: ${connection.connection.name}`);
    logger.info(`🔢 Port: ${connection.connection.port}`);

    // 🔄 Setup connection event listeners
    mongoose.connection.on('connected', () => {
      logger.info('🟢 MongoDB Atlas connection established');
    });

    mongoose.connection.on('error', (error) => {
      logger.error('❌ MongoDB Atlas connection error:', error);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('🟡 MongoDB Atlas connection disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('🔄 MongoDB Atlas connection reestablished');
    });

    // 🛑 Handle app termination (e.g., Ctrl+C)
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      logger.info('🔚 MongoDB Atlas connection closed through app termination');
      process.exit(0);
    });

    return connection;
  } catch (error) {
    // ❌ Handle connection errors with helpful messages
    logger.error('❌ MongoDB Atlas connection failed:', error.message);

    if (error.message.includes('authentication failed')) {
      logger.error('🔐 Authentication Error: Check Atlas username/password');
    } else if (error.message.includes('network')) {
      logger.error(
        '🌐 Network Error: Check internet and Atlas IP whitelist settings'
      );
    } else if (error.message.includes('timeout')) {
      logger.error(
        '⏱️ Timeout Error: Connection to MongoDB Atlas timed out. Check network and cluster status'
      );
    }

    process.exit(1); // Exit process if connection fails
  }
};

module.exports = connectDB;
