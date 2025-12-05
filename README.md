
  # RemotCyberHelp

  # RemotCyberHelp - Technology Support Platform

  A comprehensive technology support platform built with React, TypeScript, and MongoDB, providing remote cybersecurity and tech support services for individuals and small businesses.

  ## 🚀 Features

  ### Core Services
  - **Digital Profiles & Government Services** - Account management and government service assistance
  - **Virtual Communication Support** - Video conferencing and collaboration tools
  - **Device Support & Troubleshooting** - Hardware/software maintenance and printer services
  - **Technical Consultancy** - Expert technology guidance and project planning
  - **Data Backup & Recovery** - Secure data protection solutions
  - **Network Troubleshooting** - Wi-Fi optimization and network security
  - **IoT Device Setup** - Smart device integration and management
  - **Digital Marketing Assistance** - Online presence and marketing strategies
  - **Remote Hardware Support** - Hardware diagnostics and repair guidance



  ### Platform Features
  - **User Authentication** - Secure login/registration system
  - **Role-based Dashboards** - User and admin interfaces
  - **Consultation Scheduling** - Book and manage technical consultations
  - **Blog System** - Tech tips and cybersecurity insights with category filtering
  - **Contact & Support** - Multi-channel customer support
  - **Newsletter Subscription** - Stay updated with tech tips and news
  - **Emergency Support** - 24/7 emergency technical assistance

  ## 🛠️ Technology Stack

  - **Frontend**: React 18, TypeScript, Tailwind CSS
  - **UI Components**: shadcn/ui
  - **Backend**: Node.js, Express.js
  - **Database**: MongoDB Atlas
  - **Authentication**: JWT-based authentication
  - **Icons**: Lucide React
  - **Notifications**: Sonner (Toast notifications)
  - **Build Tool**: Vite

  ## 📁 Project Structure

  ```
  ├── components/               # React components
  │   ├── api/                 # API integration modules
  │   ├── auth/               # Authentication components
  │   ├── constants/          # Service data and constants
  │   ├── contexts/           # React contexts
  │   ├── dashboards/         # User and admin dashboards
  │   ├── legal/              # Legal pages (Terms, Privacy, Security)
  │   ├── modals/             # Modal components
  │   ├── pages/              # Application pages
  │   ├── services/           # Service-specific components
  │   ├── support/            # Support-related components
  │   └── ui/                 # Reusable UI components
  ├── backend/                # Express.js backend
  │   ├── src/
  │   │   ├── config/         # Database configuration
  │   │   ├── middleware/     # Express middleware
  │   │   ├── models/         # MongoDB models
  │   │   ├── routes/         # API routes
  │   │   └── scripts/        # Database seed scripts
  ├── docs/                   # Documentation
  ├── styles/                 # Global styles
  └── utils/                  # Utility functions
  ```

  ## 🚀 Quick Start

  ### Prerequisites
  - Node.js 18+ and npm
  - MongoDB Atlas account
  - Git

  ### Installation

  1. **Clone the repository**
     ```bash
     git clone https://github.com/your-username/remotcyberhelp.git
     cd remotcyberhelp
     ```

  2. **Install dependencies**
     ```bash
     # Install frontend dependencies
     npm install

     # Install backend dependencies
     cd backend
     npm install
     cd ..
     ```

  3. **Set up environment variables**
     ```bash
     cp env.local.example .env.local
     ```

     Update `.env.local` with your configuration:
     ```env
     # MongoDB Configuration
     MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/remotcyberhelp?retryWrites=true&w=majority
     MONGODB_DB_NAME=remotcyberhelp

     # JWT Configuration
     JWT_SECRET=your-super-secure-jwt-secret-key-here
     JWT_EXPIRES_IN=7d

     # Backend API Configuration
     VITE_API_URL=http://localhost:5000/api
     NODE_ENV=development
     ```

  4. **Set up the database**
     ```bash
     cd backend
     npm run seed
     cd ..
     ```

  5. **Start the development servers**

     **Terminal 1 - Frontend:**
     ```bash
     npm run dev
     ```

     **Terminal 2 - Backend:**
     ```bash
     cd backend
     npm run dev
     ```

  6. **Access the application**
     - Frontend: http://localhost:5173
     - Backend API: http://localhost:5000

  ## 📚 Documentation

  - [MongoDB Setup Guide](docs/MONGODB_SETUP_GUIDE.md)
  - [API Documentation](docs/API_DOCUMENTATION.md)
  - [Deployment Guide](docs/DEPLOYMENT_GUIDE_MONGODB.md)
  - [Local Development Setup](docs/LOCAL_BACKEND_SETUP_GUIDE.md)

  ## 🔧 Development

  ### Available Scripts

  **Frontend:**
  - `npm run dev` - Start development server
  - `npm run build` - Build for production
  - `npm run preview` - Preview production build

  **Backend:**
  - `npm run dev` - Start development server with hot reload
  - `npm start` - Start production server
  - `npm run seed` - Seed database with sample data

  ### Environment Configuration

  The application uses environment variables for configuration. See `env.local.example` for all available options.

  ### Database Models

  - **Users** - User accounts and authentication
  - **Contacts** - Contact form submissions
  - **Consultations** - Consultation bookings
  - **BlogPosts** - Blog articles and content
  - **SupportTickets** - Support requests and tickets
  - **WorkingHours** - Business hours configuration

  ## 🚀 Deployment

  ### Frontend Deployment (Vercel/Netlify)
  1. Build the project: `npm run build`
  2. Deploy the `dist` folder
  3. Set environment variables in your hosting platform

  ### Backend Deployment (Railway/Render/Heroku)
  1. Deploy the `backend` folder
  2. Set environment variables
  3. Ensure MongoDB Atlas is accessible

  See [Deployment Guide](docs/DEPLOYMENT_GUIDE_MONGODB.md) for detailed instructions.

  ## 🔒 Security Features

  - JWT-based authentication
  - Rate limiting for API endpoints
  - Input validation and sanitization
  - Bot protection for forms
  - Security math challenges
  - CORS configuration
  - Environment variable protection

  ## 📞 Contact & Support

  - **Phone**: +254708798850
  - **Business Hours**:
    - Monday-Friday: 8:00 AM – 6:00 PM
    - Saturday: 9:00 AM – 1:00 PM
    - Sunday: Emergency/On-call coverage
  - **Email**: Available through contact form
  - **Website**: [RemotCyberHelp](https://remotcyberhelp.com)

  ## 🤝 Contributing

  1. Fork the repository
  2. Create a feature branch
  3. Make your changes
  4. Add tests if applicable
  5. Submit a pull request

  ## 📄 License

  This project is proprietary software owned by RemotCyberHelp. All rights reserved.

  ## 🙏 Acknowledgments

  - Built with React and modern web technologies
  - UI components by shadcn/ui
  - Icons by Lucide React
  - Styled with Tailwind CSS

Refine this RemotCyberHelp project readme file to appear neat and appealing about the project.
Maintain all content in a markdown in a readme.md file format
