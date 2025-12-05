import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
// import dotenv from 'dotenv';
import { config } from 'dotenv';
import { resolve } from 'path';

// Import database connection
import connectDB from './config/database.cjs';

// Import utilities
import { verifyEmailConnection } from './utils/emailService.js';

// Import middleware
import { errorHandler } from './middleware/errorHandler.js';
import { authMiddleware } from './middleware/auth.js';

// Import routes
import authRoutes from './routes/auth.js';
import contactRoutes from './routes/contact.js';
import consultationRoutes from './routes/consultation.js';
import blogRoutes from './routes/blog.js';
import blogCategoryRoutes from './routes/blogCategory.js';
import supportRoutes from './routes/support.js';
import adminRoutes from './routes/admin.js';
import workingHoursRoutes from './routes/workingHours.js';
import governmentRoutes from './routes/government.js';
import servicesRoutes from './routes/services.js';
import newsletterRoutes from './routes/newsletter.js';
import dashboardRoutes from './routes/dashboard.js';

// Load environment variables from .env file
// dotenv.config();
config({ path: resolve(process.cwd(), '.env') });

const app = express();
const PORT = process.env.PORT || 3001; // Changed from 5000 to 3001 to match what's actually running

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS configuration
const corsOptions = {
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'http://localhost:5173', // Vite default port
    'http://localhost:3000', // CRA default port
    'http://127.0.0.1:5173',
    'http://127.0.0.1:3000'
  ],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

app.use(cors(corsOptions));

// Trust proxy (after CORS configuration)
app.set('trust proxy', 1); // Trust first proxy

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'RemotCyberHelp API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: '1.0.0'
  });
});

// API health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'RemotCyberHelp API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: '1.0.0'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/consultation', consultationRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/blog-category', blogCategoryRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/admin', authMiddleware, adminRoutes);
app.use('/api/working-hours', workingHoursRoutes);
app.use('/api/government', governmentRoutes);
app.use('/api/services', servicesRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/dashboard', dashboardRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

// Initialize database connection and start server
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Verify email connection
    console.log('\n📧 Verifying email service...');
    await verifyEmailConnection();

    // Start server
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`
🚀 RemotCyberHelp API Server is running!
📍 Environment: ${process.env.NODE_ENV || 'development'}
🌐 Port: ${PORT}
🌍 Interface: 0.0.0.0 (all interfaces)
📞 Support: ${process.env.COMPANY_PHONE}
📧 Email: ${process.env.COMPANY_EMAIL}
⏰ Timezone: ${process.env.BUSINESS_TIMEZONE}
      `);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
