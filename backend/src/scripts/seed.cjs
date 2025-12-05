#!/usr/bin/env node

/**
 * Database Seeding Script for RemotCyberHelp
 *
 * This script populates the MongoDB database with initial data including:
 * - Services and packages
 * - Sample blog posts
 * - Working hours
 * - Government services
 * - Admin users
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const connectDB = require('../config/database.cjs');
const User = require('../models/User.cjs');
const Service = require('../models/Service.cjs');
const { WorkingHours } = require('../models/WorkingHours.cjs');
const { Contact } = require('../models/Contact.cjs');

// Load environment variables
dotenv.config();

// Sample data
const sampleServices = [
  {
    name: "Digital Profiles & Accounts Setup",
    slug: "digital-profiles",
    description: "Professional digital presence creation and management. Set up and optimize your social media accounts, professional profiles, and online presence to enhance your digital footprint and credibility.",
    shortDescription: "Professional digital presence creation and management",
    icon: "User",
    category: "digital",
    packages: [
      {
        name: "Basic Profile Setup",
        type: "freemium",
        features: [
          "LinkedIn profile optimization",
          "Basic social media setup (2 platforms)",
          "Profile photo recommendations",
          "Contact information setup"
        ],
        duration: "2-3 business days",
        description: "Essential digital presence setup"
      },
      {
        name: "Professional Digital Package",
        type: "premium",
        features: [
          "Complete social media presence (5+ platforms)",
          "Professional bio writing",
          "SEO-optimized profiles",
          "Brand consistency across platforms",
          "Professional headshot guidance",
          "Digital business card creation",
          "30-day optimization support"
        ],
        duration: "5-7 business days",
        description: "Comprehensive digital presence transformation",
        isPopular: true
      }
    ],
    isActive: true,
    isPopular: true,
    sortOrder: 1,
    metadata: {
      tags: ["digital presence", "social media", "linkedin", "branding"],
      difficulty: "beginner",
      estimatedTime: "3-7 days"
    }
  },
  {
    name: "Device Support & Technical Help",
    slug: "device-support",
    description: "Comprehensive technical support for computers, smartphones, tablets, and other devices. We solve hardware issues, software problems, performance optimization, and provide remote assistance.",
    shortDescription: "Technical support for all your devices",
    icon: "Monitor",
    category: "technical",
    packages: [
      {
        name: "Basic Device Checkup",
        type: "freemium",
        features: [
          "Device performance assessment",
          "Basic troubleshooting",
          "Software update guidance",
          "Simple optimization tips"
        ],
        duration: "1-2 hours",
        description: "Quick device health check and basic fixes"
      },
      {
        name: "Complete Device Optimization",
        type: "premium",
        features: [
          "Full system diagnostic and repair",
          "Performance optimization",
          "Malware removal and security setup",
          "Data backup and recovery",
          "Software installation and configuration",
          "Hardware upgrade recommendations",
          "3-month support included"
        ],
        duration: "Same day service",
        description: "Comprehensive device restoration and optimization"
      }
    ],
    isActive: true,
    isPopular: true,
    sortOrder: 2,
    metadata: {
      tags: ["device repair", "troubleshooting", "optimization", "hardware"],
      difficulty: "beginner",
      estimatedTime: "1-4 hours"
    }
  },
  {
    name: "Technical Consultancy & Strategy",
    slug: "technical-consultancy",
    description: "Expert technology consulting for businesses and individuals. Strategic planning, technology roadmaps, digital transformation guidance, and technical decision-making support.",
    shortDescription: "Expert technology consulting and strategic planning",
    icon: "Lightbulb",
    category: "consultation",
    packages: [
      {
        name: "Tech Strategy Session",
        type: "freemium",
        features: [
          "1-hour consultation call",
          "Technology assessment",
          "Basic recommendations",
          "Action plan outline"
        ],
        duration: "1 hour",
        description: "Initial technology strategy discussion"
      },
      {
        name: "Comprehensive Tech Consulting",
        type: "premium",
        features: [
          "Detailed technology audit",
          "Custom technology roadmap",
          "ROI analysis and budget planning",
          "Vendor recommendations",
          "Implementation timeline",
          "Follow-up sessions (3 months)",
          "Written strategic report"
        ],
        duration: "1-2 weeks",
        description: "Complete technology strategy development",
        isPopular: true
      }
    ],
    isActive: true,
    sortOrder: 3,
    metadata: {
      tags: ["consulting", "strategy", "planning", "technology roadmap"],
      difficulty: "intermediate",
      estimatedTime: "1-14 days"
    }
  },
  {
    name: "Data Backup & Recovery Solutions",
    slug: "data-backup-recovery",
    description: "Professional data protection and recovery services. Automated backup setup, cloud storage configuration, data recovery from failed devices, and disaster recovery planning.",
    shortDescription: "Protect and recover your valuable data",
    icon: "HardDrive",
    category: "technical",
    packages: [
      {
        name: "Basic Backup Setup",
        type: "freemium",
        features: [
          "Cloud backup configuration",
          "Auto-sync setup for documents",
          "Basic recovery guidance",
          "Backup schedule planning"
        ],
        duration: "2-4 hours",
        description: "Essential data protection setup"
      },
      {
        name: "Enterprise Backup Solution",
        type: "premium",
        features: [
          "Multi-layer backup strategy",
          "Automated cloud and local backups",
          "Data recovery services",
          "Disaster recovery planning",
          "Encrypted backup systems",
          "24/7 monitoring setup",
          "Annual backup audits"
        ],
        duration: "3-5 business days",
        description: "Complete data protection and recovery system"
      }
    ],
    isActive: true,
    sortOrder: 4,
    metadata: {
      tags: ["backup", "recovery", "data protection", "cloud storage"],
      difficulty: "intermediate",
      estimatedTime: "4 hours - 5 days"
    }
  },
  {
    name: "E-commerce & Online Business Setup",
    slug: "ecommerce-solutions",
    description: "Complete e-commerce platform setup and optimization. Online store creation, payment processing, inventory management, and digital marketing integration for successful online businesses.",
    shortDescription: "Launch and optimize your online business",
    icon: "ShoppingCart",
    category: "digital",
    packages: [
      {
        name: "Basic Online Store",
        type: "freemium",
        features: [
          "Simple e-commerce setup",
          "Basic product listing (up to 20 items)",
          "Payment gateway integration",
          "Mobile-responsive design"
        ],
        duration: "5-7 business days",
        description: "Get started with online selling"
      },
      {
        name: "Professional E-commerce Platform",
        type: "premium",
        features: [
          "Custom e-commerce website",
          "Advanced payment processing",
          "Inventory management system",
          "SEO optimization",
          "Social media integration",
          "Analytics and reporting setup",
          "3-month support and training"
        ],
        duration: "2-3 weeks",
        description: "Complete professional online business solution",
        isPopular: true
      }
    ],
    isActive: true,
    isPopular: true,
    sortOrder: 5,
    metadata: {
      tags: ["ecommerce", "online store", "payment processing", "digital marketing"],
      difficulty: "intermediate",
      estimatedTime: "1-3 weeks"
    }
  },
  {
    name: "Cybersecurity Services & Protection",
    slug: "cybersecurity-services",
    description: "Comprehensive cybersecurity solutions to protect your digital assets. Security audits, threat protection, secure system configuration, and ongoing security monitoring.",
    shortDescription: "Protect your digital assets from cyber threats",
    icon: "Shield",
    category: "technical",
    packages: [
      {
        name: "Security Assessment",
        type: "freemium",
        features: [
          "Basic security scan",
          "Vulnerability identification",
          "Security recommendations",
          "Password strength analysis"
        ],
        duration: "2-3 hours",
        description: "Essential security health check"
      },
      {
        name: "Complete Security Solution",
        type: "premium",
        features: [
          "Comprehensive security audit",
          "Advanced threat protection setup",
          "Firewall and antivirus configuration",
          "Secure backup implementation",
          "Employee security training",
          "Ongoing monitoring (6 months)",
          "Incident response planning"
        ],
        duration: "1-2 weeks",
        description: "Enterprise-level cybersecurity protection"
      }
    ],
    isActive: true,
    sortOrder: 6,
    metadata: {
      tags: ["cybersecurity", "protection", "security audit", "threat prevention"],
      difficulty: "advanced",
      estimatedTime: "3 hours - 2 weeks"
    }
  },
  {
    name: "Business Process Automation",
    slug: "business-automation",
    description: "Streamline your business operations with intelligent automation. Workflow optimization, task automation, integration between systems, and productivity enhancement solutions.",
    shortDescription: "Automate and optimize your business processes",
    icon: "Cog",
    category: "consultation",
    packages: [
      {
        name: "Process Analysis",
        type: "freemium",
        features: [
          "Workflow assessment",
          "Automation opportunities identification",
          "Basic tool recommendations",
          "ROI estimation"
        ],
        duration: "3-5 business days",
        description: "Identify automation opportunities in your business"
      },
      {
        name: "Full Automation Implementation",
        type: "premium",
        features: [
          "Custom automation strategy",
          "Workflow design and implementation",
          "System integrations",
          "Staff training and documentation",
          "Performance monitoring setup",
          "6-month optimization support",
          "Scalability planning"
        ],
        duration: "2-4 weeks",
        description: "Complete business process transformation"
      }
    ],
    isActive: true,
    sortOrder: 7,
    metadata: {
      tags: ["automation", "workflow", "productivity", "integration"],
      difficulty: "advanced",
      estimatedTime: "1-4 weeks"
    }
  },
  {
    name: "Cloud Migration & Management",
    slug: "cloud-migration",
    description: "Seamless transition to cloud platforms with ongoing management. Cloud strategy, data migration, system optimization, and cloud infrastructure management for improved efficiency and cost savings.",
    shortDescription: "Move to the cloud with expert guidance",
    icon: "Cloud",
    category: "technical",
    packages: [
      {
        name: "Cloud Assessment",
        type: "freemium",
        features: [
          "Current infrastructure analysis",
          "Cloud readiness evaluation",
          "Cost-benefit analysis",
          "Migration roadmap outline"
        ],
        duration: "3-5 business days",
        description: "Evaluate your cloud migration potential"
      },
      {
        name: "Complete Cloud Migration",
        type: "premium",
        features: [
          "Full cloud strategy development",
          "Data and application migration",
          "Security and compliance setup",
          "Performance optimization",
          "Staff training and documentation",
          "Ongoing management (3 months)",
          "24/7 monitoring and support"
        ],
        duration: "2-6 weeks",
        description: "End-to-end cloud transformation"
      }
    ],
    isActive: true,
    sortOrder: 8,
    metadata: {
      tags: ["cloud migration", "infrastructure", "aws", "azure", "google cloud"],
      difficulty: "advanced",
      estimatedTime: "1-6 weeks"
    }
  },
  {
    name: "Website Development & Design",
    slug: "website-development",
    description: "Professional website creation and redesign services. Modern, responsive websites that drive results, including SEO optimization, performance enhancement, and ongoing maintenance.",
    shortDescription: "Build a professional website that grows your business",
    icon: "Globe",
    category: "digital",
    packages: [
      {
        name: "Basic Website",
        type: "freemium",
        features: [
          "5-page responsive website",
          "Basic SEO setup",
          "Contact form integration",
          "Mobile optimization"
        ],
        duration: "1-2 weeks",
        description: "Professional online presence for small businesses"
      },
      {
        name: "Professional Website Package",
        type: "premium",
        features: [
          "Custom design and development",
          "Advanced SEO optimization",
          "Content management system",
          "E-commerce capabilities",
          "Analytics and tracking setup",
          "Social media integration",
          "6-month maintenance included"
        ],
        duration: "3-4 weeks",
        description: "Complete professional website solution",
        isPopular: true
      }
    ],
    isActive: true,
    isPopular: true,
    sortOrder: 9,
    metadata: {
      tags: ["website development", "web design", "seo", "responsive design"],
      difficulty: "intermediate",
      estimatedTime: "1-4 weeks"
    }
  },
  {
    name: "Technology Training & Workshops",
    slug: "tech-training",
    description: "Comprehensive technology training for individuals and teams. Digital literacy, software training, cybersecurity awareness, and customized workshops to improve technical skills.",
    shortDescription: "Learn technology skills with expert training",
    icon: "GraduationCap",
    category: "training",
    packages: [
      {
        name: "Basic Tech Skills Session",
        type: "freemium",
        features: [
          "2-hour group training session",
          "Basic computer skills",
          "Internet safety tips",
          "Q&A session"
        ],
        duration: "2 hours",
        description: "Essential technology skills for beginners"
      },
      {
        name: "Comprehensive Training Program",
        type: "premium",
        features: [
          "Customized training curriculum",
          "Individual and group sessions",
          "Hands-on practice labs",
          "Training materials and resources",
          "Progress tracking and certification",
          "3-month follow-up support",
          "Advanced topic coverage"
        ],
        duration: "4-8 weeks",
        description: "Complete technology skill development program"
      }
    ],
    isActive: true,
    sortOrder: 10,
    metadata: {
      tags: ["training", "education", "digital literacy", "workshops"],
      difficulty: "beginner",
      estimatedTime: "2 hours - 8 weeks"
    }
  }
];

const sampleUsers = [
  {
    email: 'admin@remotcyberhelp.com',
    password: 'RemotCyber2024!',
    name: 'Super Administrator',
    firstName: 'Super',
    lastName: 'Administrator',
    role: 'super_admin',
    isEmailVerified: true,
    profile: {
      phone: '+254708798850',
      location: 'Nairobi, Kenya',
      preferences: {
        theme: 'light',
        notifications: true,
        language: 'en',
        timezone: 'Africa/Nairobi'
      },
      subscriptions: {
        newsletter: true,
        productUpdates: true,
        securityAlerts: true
      }
    }
  },
  {
    email: 'support@remotcyberhelp.com',
    password: 'Support2024!',
    name: 'Support Admin',
    firstName: 'Support',
    lastName: 'Admin',
    role: 'admin',
    isEmailVerified: true,
    profile: {
      phone: '+254708798850',
      location: 'Nairobi, Kenya',
      preferences: {
        theme: 'light',
        notifications: true,
        language: 'en',
        timezone: 'Africa/Nairobi'
      },
      subscriptions: {
        newsletter: true,
        productUpdates: true,
        securityAlerts: true
      }
    }
  },
  {
    email: 'demo@example.com',
    password: 'Demo2024!',
    name: 'Demo User',
    firstName: 'Demo',
    lastName: 'User',
    role: 'user',
    isEmailVerified: true,
    profile: {
      preferences: {
        theme: 'light',
        notifications: true,
        language: 'en',
        timezone: 'Africa/Nairobi'
      },
      subscriptions: {
        newsletter: true,
        productUpdates: false,
        securityAlerts: true
      }
    }
  }
];

/**
 * Seed Services
 */
async function seedServices() {
  console.log('🌱 Seeding services...');

  try {
    // Clear existing services
    await Service.deleteMany({});
    console.log('   ✅ Cleared existing services');

    // Insert sample services
    for (const serviceData of sampleServices) {
      try {
        const service = new Service(serviceData);
        await service.save();
        console.log(`   ✅ Created service: ${service.name}`);
      } catch (error) {
        console.error(`   ❌ Error creating service ${serviceData.name}:`, error.message);
      }
    }

    console.log(`   🎉 Successfully seeded ${sampleServices.length} services`);

  } catch (error) {
    console.error('❌ Error seeding services:', error.message);
  }
}

/**
 * Seed Users
 */
async function seedUsers() {
  console.log('🌱 Seeding users...');

  try {
    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: 'admin@remotcyberhelp.com' });
    if (existingAdmin) {
      console.log('   ℹ️  Admin user already exists, skipping user seeding');
      return;
    }

    // Insert sample users
    for (const userData of sampleUsers) {
      try {
        const user = new User(userData);
        await user.save();
        console.log(`   ✅ Created user: ${user.email} (${user.role})`);
      } catch (error) {
        if (error.code === 11000) {
          console.log(`   ℹ️  User ${userData.email} already exists, skipping`);
        } else {
          console.error(`   ❌ Error creating user ${userData.email}:`, error.message);
        }
      }
    }

    console.log(`   🎉 Successfully seeded users`);

  } catch (error) {
    console.error('❌ Error seeding users:', error.message);
  }
}

/**
 * Sample working hours data
 */
const sampleWorkingHours = {
  schedule: {
    monday: {
      isOpen: true,
      openTime: '08:00',
      closeTime: '18:00',
      breaks: [
        { start: '12:00', end: '13:00', name: 'Lunch Break' },
        { start: '15:00', end: '15:15', name: 'Afternoon Break' }
      ]
    },
    tuesday: {
      isOpen: true,
      openTime: '08:00',
      closeTime: '18:00',
      breaks: [
        { start: '12:00', end: '13:00', name: 'Lunch Break' },
        { start: '15:00', end: '15:15', name: 'Afternoon Break' }
      ]
    },
    wednesday: {
      isOpen: true,
      openTime: '08:00',
      closeTime: '18:00',
      breaks: [
        { start: '12:00', end: '13:00', name: 'Lunch Break' },
        { start: '15:00', end: '15:15', name: 'Afternoon Break' }
      ]
    },
    thursday: {
      isOpen: true,
      openTime: '08:00',
      closeTime: '18:00',
      breaks: [
        { start: '12:00', end: '13:00', name: 'Lunch Break' },
        { start: '15:00', end: '15:15', name: 'Afternoon Break' }
      ]
    },
    friday: {
      isOpen: true,
      openTime: '08:00',
      closeTime: '17:00',
      breaks: [
        { start: '12:00', end: '13:00', name: 'Lunch Break' }
      ]
    },
    saturday: {
      isOpen: true,
      openTime: '09:00',
      closeTime: '13:00',
      breaks: []
    },
    sunday: {
      isOpen: false,
      openTime: null,
      closeTime: null,
      breaks: [],
      emergencyAvailable: true,
      emergencyNote: 'Emergency and on-call support available 24/7. Call +254708798850 for urgent issues.'
    }
  },
  timezone: 'Africa/Nairobi',
  emergencyContact: {
    phone: '+254708798850',
    email: 'emergency@remotcyberhelp.com',
    available24h: true
  },
  holidays: [
    {
      date: '2024-01-01',
      name: 'New Year\'s Day',
      description: 'Office closed for New Year celebration'
    },
    {
      date: '2024-04-01',
      name: 'Easter Monday',
      description: 'Easter holiday observance'
    },
    {
      date: '2024-05-01',
      name: 'Labour Day',
      description: 'International Workers\' Day'
    },
    {
      date: '2024-06-01',
      name: 'Madaraka Day',
      description: 'Kenyan public holiday'
    },
    {
      date: '2024-10-10',
      name: 'Huduma Day',
      description: 'Kenyan public holiday'
    },
    {
      date: '2024-10-20',
      name: 'Mashujaa Day',
      description: 'Heroes\' Day in Kenya'
    },
    {
      date: '2024-12-12',
      name: 'Jamhuri Day',
      description: 'Independence Day celebration'
    },
    {
      date: '2024-12-25',
      name: 'Christmas Day',
      description: 'Office closed for Christmas'
    },
    {
      date: '2024-12-26',
      name: 'Boxing Day',
      description: 'Extended Christmas holiday'
    }
  ],
  specialHours: [
    {
      date: '2024-12-24',
      openTime: '08:00',
      closeTime: '12:00',
      reason: 'Christmas Eve - Half day'
    },
    {
      date: '2024-12-31',
      openTime: '08:00',
      closeTime: '14:00',
      reason: 'New Year\'s Eve - Early closure'
    }
  ],
  isActive: true
};

/**
 * Sample contact submissions
 */
const sampleContacts = [
  {
    firstName: 'John',
    lastName: 'Wanjiku',
    email: 'john.wanjiku@email.com',
    phone: '+254707662529',
    service: 'Device Support',
    urgency: 'medium',
    message: 'My laptop is running very slowly and sometimes freezes. I need help optimizing its performance for my work.',
    status: 'pending',
    metadata: {
      source: 'website',
      deviceInfo: 'Windows 10, 8GB RAM',
      submittedFrom: 'contact-page'
    }
  },
  {
    firstName: 'Sarah',
    lastName: 'Mutindi',
    email: 'sarah.mutindi@business.co.ke',
    phone: '+254707662529',
    service: 'E-commerce Solutions',
    urgency: 'high',
    message: 'I want to set up an online store for my fashion business. I need help with payment integration and inventory management.',
    status: 'in_progress',
    metadata: {
      source: 'website',
      businessType: 'Fashion Retail',
      submittedFrom: 'services-page'
    }
  },
  {
    firstName: 'David',
    lastName: 'Kipchoge',
    email: 'david.kipchoge@gmail.com',
    phone: '+254707662529',
    service: 'Cybersecurity Services',
    urgency: 'critical',
    message: 'URGENT: I think my business email has been compromised. Several suspicious emails were sent from my account. Need immediate security audit.',
    status: 'in_progress',
    emergencyFlaggedAt: new Date(),
    metadata: {
      source: 'emergency-form',
      issueType: 'security-breach',
      submittedFrom: 'emergency-page'
    }
  },
  {
    firstName: 'Mary',
    lastName: 'Achieng',
    email: 'mary.achieng@ngo.org',
    phone: '+254707662529',
    service: 'Digital Profiles',
    urgency: 'low',
    message: 'I need help setting up professional social media profiles for our NGO. We want to improve our online presence and reach more donors.',
    status: 'resolved',
    adminNotes: 'Successfully set up LinkedIn, Facebook, and Twitter profiles. Provided social media strategy document.',
    metadata: {
      source: 'referral',
      organizationType: 'NGO',
      submittedFrom: 'contact-page'
    }
  },
  {
    firstName: 'Peter',
    lastName: 'Kamau',
    email: 'peter.kamau@company.co.ke',
    phone: '+254707662529',
    service: 'Cloud Migration',
    urgency: 'medium',
    message: 'Our company wants to migrate from on-premise servers to cloud infrastructure. We need consultation on the best approach and cost estimates.',
    status: 'pending',
    metadata: {
      source: 'website',
      companySize: '50-100 employees',
      currentInfrastructure: 'on-premise',
      submittedFrom: 'consultation-page'
    }
  },
  {
    firstName: 'Grace',
    lastName: 'Njeri',
    email: 'grace.njeri@startup.com',
    service: 'Website Development',
    urgency: 'medium',
    message: 'We need a professional website for our tech startup. Looking for modern design, mobile optimization, and integration with our CRM system.',
    status: 'in_progress',
    metadata: {
      source: 'website',
      projectType: 'startup-website',
      timeline: '4-6 weeks',
      submittedFrom: 'services-page'
    }
  },
  {
    firstName: 'James',
    lastName: 'Mwangi',
    email: 'james.mwangi@school.ac.ke',
    phone: '+254767890123',
    service: 'Tech Training',
    urgency: 'low',
    message: 'Our school needs technology training for teachers. We want to improve digital literacy and integrate technology into our curriculum.',
    status: 'pending',
    metadata: {
      source: 'phone-inquiry',
      participantCount: '25 teachers',
      institutionType: 'Primary School',
      submittedFrom: 'contact-page'
    }
  },
  {
    firstName: 'Rachel',
    lastName: 'Wangari',
    email: 'rachel.wangari@retailshop.com',
    phone: '+254778901234',
    service: 'Data Backup and Recovery',
    urgency: 'high',
    message: 'We lost some important customer data due to a hardware failure. Need immediate data recovery services and backup solution setup.',
    status: 'resolved',
    adminNotes: 'Successfully recovered 95% of data. Implemented automated cloud backup system with daily incremental backups.',
    metadata: {
      source: 'emergency-call',
      dataLoss: 'partial',
      recoveryUrgent: true,
      submittedFrom: 'phone-support'
    }
  },
  {
    firstName: 'Samuel',
    lastName: 'Kiprotich',
    email: 'samuel.kiprotich@consultant.com',
    service: 'Business Automation',
    urgency: 'medium',
    message: 'I run a consulting business and spend too much time on administrative tasks. Looking for automation solutions to streamline workflows.',
    status: 'pending',
    metadata: {
      source: 'website',
      businessType: 'Consulting',
      currentTools: 'Excel, Email',
      submittedFrom: 'services-page'
    }
  },
  {
    firstName: 'Lisa',
    lastName: 'Moraa',
    email: 'lisa.moraa@healthcare.co.ke',
    phone: '+254789012345',
    service: 'Technical Consultancy',
    urgency: 'medium',
    message: 'Our healthcare facility needs a technology strategy for digital transformation. We want to implement electronic health records and telemedicine.',
    status: 'in_progress',
    metadata: {
      source: 'referral',
      industryType: 'Healthcare',
      currentState: 'paper-based',
      submittedFrom: 'consultation-page'
    }
  },
  {
    firstName: 'Anonymous',
    lastName: 'Subscriber',
    email: 'subscriber1@example.com',
    service: 'newsletter-subscription',
    urgency: 'low',
    message: 'Newsletter subscription request',
    status: 'resolved',
    metadata: {
      source: 'newsletter-form',
      subscriptionType: 'weekly-updates',
      submittedFrom: 'footer-newsletter'
    }
  },
  {
    firstName: 'Emergency',
    lastName: 'User',
    email: 'emergency.user@company.com',
    phone: '+254798765432',
    service: 'emergency-support',
    urgency: 'critical',
    message: 'CRITICAL: Our main server is down and affecting all business operations. Need immediate technical support.',
    status: 'resolved',
    emergencyFlaggedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    adminNotes: 'Emergency resolved within 2 hours. Server hardware issue fixed and backup systems activated.',
    metadata: {
      source: 'emergency-hotline',
      downtime: '2 hours',
      impact: 'business-critical',
      submittedFrom: 'emergency-page'
    }
  }
];

/**
 * Seed Working Hours
 */
async function seedWorkingHours() {
  console.log('🌱 Seeding working hours...');

  try {
    // Check if working hours already exist
    const existingWorkingHours = await WorkingHours.findOne({ isActive: true });
    if (existingWorkingHours) {
      console.log('   ℹ️  Working hours configuration already exists, skipping');
      return;
    }

    // Create working hours configuration
    const workingHours = new WorkingHours(sampleWorkingHours);
    await workingHours.save();

    console.log('   ✅ Created working hours configuration');
    console.log('   📅 Business Hours: Monday-Friday 8:00-18:00');
    console.log('   📅 Saturday Hours: 9:00-13:00');
    console.log('   📅 Sunday: Closed (Emergency support available)');
    console.log(`   📞 Emergency Contact: ${sampleWorkingHours.emergencyContact.phone}`);
    console.log(`   🎄 Holidays: ${sampleWorkingHours.holidays.length} holidays configured`);

  } catch (error) {
    console.error('❌ Error seeding working hours:', error.message);
  }
}

/**
 * Seed Contact Submissions
 */
async function seedContacts() {
  console.log('🌱 Seeding contact submissions...');

  try {
    // Check if contacts already exist
    const existingContacts = await Contact.countDocuments();
    if (existingContacts > 0) {
      console.log('   ℹ️  Contact submissions already exist, skipping');
      return;
    }

    // Insert sample contacts
    let createdContacts = 0;
    for (const contactData of sampleContacts) {
      try {
        const contact = new Contact(contactData);
        await contact.save();
        createdContacts++;

        const statusEmoji = {
          pending: '⏳',
          in_progress: '🔄',
          resolved: '✅',
          closed: '🔒'
        }[contact.status] || '📝';

        console.log(`   ${statusEmoji} Created contact: ${contact.firstName} ${contact.lastName} (${contact.service})`);
      } catch (error) {
        console.error(`   ❌ Error creating contact ${contactData.firstName} ${contactData.lastName}:`, error.message);
      }
    }

    // Contact statistics
    const stats = {
      total: createdContacts,
      pending: sampleContacts.filter(c => c.status === 'pending').length,
      inProgress: sampleContacts.filter(c => c.status === 'in_progress').length,
      resolved: sampleContacts.filter(c => c.status === 'resolved').length,
      critical: sampleContacts.filter(c => c.urgency === 'critical').length,
      emergency: sampleContacts.filter(c => c.emergencyFlaggedAt).length
    };

    console.log(`   🎉 Successfully seeded ${createdContacts} contact submissions`);
    console.log(`   📊 Contact Statistics:`);
    console.log(`      - Pending: ${stats.pending}`);
    console.log(`      - In Progress: ${stats.inProgress}`);
    console.log(`      - Resolved: ${stats.resolved}`);
    console.log(`      - Critical Priority: ${stats.critical}`);
    console.log(`      - Emergency Flagged: ${stats.emergency}`);

  } catch (error) {
    console.error('❌ Error seeding contacts:', error.message);
  }
}

/**
 * Main seeding function
 */
async function seedDatabase() {
  console.log('🚀 Starting database seeding for RemotCyberHelp...\n');

  try {
    // Connect to database
    await connectDB();

    // Run all seeding functions
    await seedUsers();
    console.log('');

    await seedServices();
    console.log('');

    await seedWorkingHours();
    console.log('');

    await seedContacts();
    console.log('');

    console.log('🎉 Database seeding completed successfully!');
    console.log('');
    console.log('📊 Seeding Summary:');
    console.log(`   👥 Users: ${sampleUsers.length} users created`);
    console.log(`   🛠️  Services: ${sampleServices.length} services created`);
    console.log(`   ⏰ Working Hours: Business schedule configured`);
    console.log(`   📞 Contacts: ${sampleContacts.length} sample submissions created`);
    console.log('');
    console.log('🔑 Default Login Credentials:');
    console.log('   Super Admin: admin@remotcyberhelp.com / RemotCyber2024!');
    console.log('   Admin: support@remotcyberhelp.com / Support2024!');
    console.log('   Demo User: demo@example.com / Demo2024!');
    console.log('');
    console.log('⚠️  Important: Change default passwords in production!');

  } catch (error) {
    console.error('\n❌ Database seeding failed:', error.message);
    process.exit(1);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('\n📴 Database connection closed');
  }
}

/**
 * CLI Interface
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
RemotCyberHelp Database Seeding Tool

Usage:
  npm run seed                  # Seed all data
  npm run seed services         # Seed only services
  npm run seed users            # Seed only users
  npm run seed working-hours    # Seed only working hours
  npm run seed contacts         # Seed only contacts
  npm run seed --force          # Force reseed (clears existing data)

Options:
  --force, -f     Force reseed by clearing existing data
  --help, -h      Show this help message

Examples:
  npm run seed                    # Full database seeding
  npm run seed -- services       # Seed only services
  npm run seed -- working-hours  # Seed only working hours
  npm run seed -- contacts       # Seed only contacts
  npm run seed -- --force        # Force complete reseed
    `);
    return;
  }

  // Handle specific seeding
  if (args.includes('services')) {
    await connectDB();
    await seedServices();
    await mongoose.connection.close();
    return;
  }

  if (args.includes('users')) {
    await connectDB();
    await seedUsers();
    await mongoose.connection.close();
    return;
  }

  if (args.includes('working-hours')) {
    await connectDB();
    await seedWorkingHours();
    await mongoose.connection.close();
    return;
  }

  if (args.includes('contacts')) {
    await connectDB();
    await seedContacts();
    await mongoose.connection.close();
    return;
  }

  // Default: seed all
  await seedDatabase();
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Reset script failed:', error);
    process.exit(1);
  });
}

module.exports = { seedServices, seedUsers, seedWorkingHours, seedContacts };
