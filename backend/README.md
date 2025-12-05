# RemotCyberHelp Backend

MongoDB-powered backend API for the RemotCyberHelp tech support platform.

## Quick Start

### 1. Environment Setup

```bash
# Interactive setup (recommended for first time)
npm run setup

# Or quick setup with minimal prompts
npm run setup:quick
```

### 2. Test Database Connection

```bash
npm run test:db
```

### 3. Run Database Migrations

```bash
npm run migrate
```

### 4. Start Development Server

```bash
npm run dev
```

## Available Scripts

### Environment & Setup
- `npm run setup` - Interactive environment configuration
- `npm run setup:quick` - Quick setup with defaults
- `npm run test:db` - Test MongoDB connection

### Database
- `npm run migrate` - Run database migrations
- `npm run migrate:status` - Check migration status
- `npm run seed` - Seed database with sample data

### Development
- `npm run dev` - Start development server with hot reload
- `npm run start` - Start production server
- `npm test` - Run tests

## Environment Configuration

Create a `.env` file in the backend directory with the following variables:

```env
# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/remotcyberhelp?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-refresh-secret-here
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
```

## MongoDB Setup

1. **Create MongoDB Atlas Account**: Visit [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. **Create Cluster**: Set up a free cluster
3. **Create Database User**: Add a user with read/write permissions
4. **Configure Network Access**: Whitelist your IP address
5. **Get Connection String**: Copy the connection URI

## Troubleshooting

### Migration Issues

```bash
# Check if environment is configured
npm run setup

# Test database connection
npm run test:db

# Check migration status
npm run migrate:status

# Run migrations with verbose output
npm run migrate
```

### Common Issues

**"MONGODB_URI not configured"**
- Run `npm run setup` to configure environment
- Ensure `.env` file exists in backend directory

**"Connection failed"**
- Check internet connection
- Verify MongoDB Atlas cluster is running
- Ensure IP is whitelisted in MongoDB Atlas
- Verify connection string credentials

**"Authentication failed"**
- Check username and password in connection string
- Verify database user exists and has permissions

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.js      # MongoDB connection configuration
│   ├── middleware/
│   │   ├── auth.js          # Authentication middleware
│   │   ├── errorHandler.js  # Error handling middleware
│   │   └── validation.js    # Request validation
│   ├── models/
│   │   ├── User.js          # User model
│   │   ├── Service.js       # Service model
│   │   └── ...              # Other models
│   ├── routes/
│   │   ├── auth.js          # Authentication routes
│   │   ├── services.js      # Service routes
│   │   └── ...              # Other routes
│   ├── scripts/
│   │   ├── migrate.js       # Database migration script
│   │   ├── test-connection.js # Connection test script
│   │   ├── setup-env.js     # Environment setup script
│   │   └── seed.js          # Database seeding script
│   └── index.js             # Main application entry point
├── .env.example             # Environment variables template
└── package.json
```

## API Documentation

The API provides the following endpoints:

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/reset-password` - Reset password

### Services
- `GET /api/services` - List all services
- `GET /api/services/:slug` - Get service by slug
- `POST /api/services` - Create service (admin)
- `PUT /api/services/:id` - Update service (admin)
- `DELETE /api/services/:id` - Delete service (admin)

### Consultations
- `GET /api/consultations` - List user consultations
- `POST /api/consultations` - Book consultation
- `PUT /api/consultations/:id` - Update consultation
- `DELETE /api/consultations/:id` - Cancel consultation

### Support
- `GET /api/support/tickets` - List support tickets
- `POST /api/support/tickets` - Create support ticket
- `PUT /api/support/tickets/:id` - Update ticket
- `DELETE /api/support/tickets/:id` - Close ticket

### Blog
- `GET /api/blog/posts` - List blog posts
- `GET /api/blog/posts/:slug` - Get blog post
- `POST /api/blog/posts` - Create post (admin)
- `PUT /api/blog/posts/:id` - Update post (admin)
- `DELETE /api/blog/posts/:id` - Delete post (admin)

## Security Features

- JWT-based authentication with refresh tokens
- Password hashing with bcrypt
- Account lockout after failed login attempts
- Rate limiting on API endpoints
- Input validation and sanitization
- CORS protection
- Security headers with Helmet

## Database Schema

The application uses the following main collections:

- **users** - User accounts and profiles
- **services** - Tech support services
- **consultations** - Scheduled consultations
- **supporttickets** - Support ticket system
- **blogposts** - Blog content management
- **contacts** - Contact form submissions
- **governmentservices** - Government service information
- **workinghours** - Business hours configuration

## Development

### Adding New Features

1. Create model in `src/models/`
2. Add routes in `src/routes/`
3. Update migrations if needed
4. Add tests
5. Update API documentation

### Database Changes

1. Create new migration in `src/scripts/migrate.js`
2. Update models as needed
3. Test migration locally
4. Run `npm run migrate` to apply changes

## Support

For technical support or questions:
- Email: support@remotcyberhelp.com
- Phone: +254708798850

## License

MIT License - see LICENSE file for details.