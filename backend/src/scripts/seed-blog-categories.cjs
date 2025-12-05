/**
 * Seed Script for Default Blog Categories
 * RemotCyberHelp - 15 Default Blog Categories
 */

const mongoose = require('mongoose');
const { BlogCategory } = require('../models/BlogCategory.cjs');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const defaultCategories = [
  {
    name: 'Tech Support Essentials',
    slug: 'tech-support-essentials',
    description: 'Fundamental guides and tips for everyday technical challenges, device maintenance, and basic troubleshooting.',
    color: '#2563eb', // Blue-600
    icon: '🔧', // Wrench
    isActive: true,
    order: 1
  },
  {
    name: 'Cybersecurity & Protection',
    slug: 'cybersecurity-protection',
    description: 'Security best practices, threat prevention, data protection strategies, and safe online behavior for individuals and businesses.',
    color: '#dc2626', // Red-600
    icon: '🛡️', // Shield
    isActive: true,
    order: 2
  },
  {
    name: 'Digital Transformation',
    slug: 'digital-transformation',
    description: 'Guides for transitioning to digital platforms, optimizing online presence, and leveraging technology for business growth.',
    color: '#9333ea', // Purple-600
    icon: '📈', // Chart Increasing
    isActive: true,
    order: 3
  },
  {
    name: 'Remote Work Solutions',
    slug: 'remote-work-solutions',
    description: 'Tools, setups, and best practices for effective remote work, collaboration, and maintaining productivity from anywhere.',
    color: '#16a34a', // Green-600
    icon: '🏠', // House with Garden
    isActive: true,
    order: 4
  },
  {
    name: 'Device Optimization',
    slug: 'device-optimization',
    description: 'Tips for maximizing device performance, maintenance routines, and extending the lifespan of computers and mobile devices.',
    color: '#ea580c', // Orange-600
    icon: '⚡', // Zap
    isActive: true,
    order: 5
  },
  {
    name: 'Network & Connectivity',
    slug: 'network-connectivity',
    description: 'Solutions for internet connectivity issues, network setup, Wi-Fi optimization, and troubleshooting connection problems.',
    color: '#0891b2', // Cyan-600
    icon: '📡', // Satellite Antenna
    isActive: true,
    order: 6
  },
  {
    name: 'Data Management & Recovery',
    slug: 'data-management-recovery',
    description: 'Strategies for data backup, organization, recovery solutions, and preventing data loss in critical situations.',
    color: '#d97706', // Amber-600
    icon: '💾', // Floppy Disk
    isActive: true,
    order: 7
  },
  {
    name: 'Software Solutions',
    slug: 'software-solutions',
    description: 'Software recommendations, installation guides, troubleshooting, and maximizing productivity with essential applications.',
    color: '#4f46e5', // Indigo-600
    icon: '💻', // Laptop
    isActive: true,
    order: 8
  },
  {
    name: 'IoT & Smart Devices',
    slug: 'iot-smart-devices',
    description: 'Setup, integration, and troubleshooting for Internet of Things devices, smart home systems, and connected technology.',
    color: '#db2777', // Pink-600
    icon: '🌐', // Globe with Meridians
    isActive: true,
    order: 9
  },
  {
    name: 'Digital Literacy',
    slug: 'digital-literacy',
    description: 'Educational content for improving digital skills, understanding technology basics, and building confidence with digital tools.',
    color: '#0d9488', // Teal-600
    icon: '📚', // Books
    isActive: true,
    order: 10
  },
  {
    name: 'Small Business Tech',
    slug: 'small-business-tech',
    description: 'Technology solutions tailored for small businesses, including digital tools, security, and scalable tech infrastructure.',
    color: '#059669', // Emerald-600
    icon: '💼', // Briefcase
    isActive: true,
    order: 11
  },
  {
    name: 'Emergency Tech Support',
    slug: 'emergency-tech-support',
    description: 'Quick-fix guides, crisis management, and immediate solutions for urgent technical issues that need rapid resolution.',
    color: '#e11d48', // Rose-600
    icon: '🚨', // Police Car Light
    isActive: true,
    order: 12
  },
  {
    name: 'Cloud Services & Storage',
    slug: 'cloud-services-storage',
    description: 'Cloud platform guides, storage solutions, migration strategies, and optimizing cloud-based workflows for efficiency.',
    color: '#0284c7', // Sky-600
    icon: '☁️', // Cloud
    isActive: true,
    order: 13
  },
  {
    name: 'Mobile Technology',
    slug: 'mobile-technology',
    description: 'Smartphone and tablet optimization, mobile app guidance, and solving common mobile device challenges.',
    color: '#7c3aed', // Violet-600
    icon: '📱', // Mobile Phone
    isActive: true,
    order: 14
  },
  {
    name: 'Tech Industry Insights',
    slug: 'tech-industry-insights',
    description: 'Latest technology trends, industry updates, future predictions, and how emerging technologies impact daily digital life.',
    color: '#4b5563', // Gray-600
    icon: '📰', // Newspaper
    isActive: true,
    order: 15
  }
];

/**
 * Connect to MongoDB
 */
async function connectDB() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/remotecyberhelp';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

/**
 * Seed blog categories
 */
async function seedCategories() {
  try {
    console.log('\n🌱 Starting blog category seeding...\n');

    // Check if categories already exist
    const existingCount = await BlogCategory.countDocuments();

    if (existingCount > 0) {
      console.log(`⚠️  Found ${existingCount} existing categories.`);
      console.log('❓ Options:');
      console.log('   1. Skip seeding (keep existing)');
      console.log('   2. Add only missing categories');
      console.log('   3. Replace all categories (DELETE existing)');
      console.log('\n💡 Run with --force flag to replace all categories\n');

      const forceFlag = process.argv.includes('--force');
      const addFlag = process.argv.includes('--add');

      if (!forceFlag && !addFlag) {
        console.log('ℹ️  Skipping seed. Run with --force to replace or --add to append.');
        return;
      }

      if (forceFlag) {
        // Delete existing categories if force flag is used
        console.log('🗑️  Deleting existing categories...');
        await BlogCategory.deleteMany({});
        console.log('✅ Existing categories deleted\n');
      } else if (addFlag) {
        console.log('➕ Adding only missing categories...\n');
      }
    }

    // Insert default categories
    console.log('📝 Inserting default categories...\n');

    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;

    for (const category of defaultCategories) {
      try {
        // Check if category already exists
        const existing = await BlogCategory.findOne({ slug: category.slug });

        if (existing && process.argv.includes('--add')) {
          console.log(`⏭️  Skipped (exists): ${category.name} (${category.slug})`);
          skipCount++;
          continue;
        }

        const newCategory = await BlogCategory.create(category);
        console.log(`✅ Created: ${category.name} (${category.slug})`);
        console.log(`   Color: ${category.color} | Icon: ${category.icon}`);
        successCount++;
      } catch (error) {
        if (error.code === 11000) {
          console.log(`⏭️  Skipped (duplicate): ${category.name}`);
          skipCount++;
        } else {
          console.error(`❌ Failed to create: ${category.name}`);
          console.error(`   Error: ${error.message}`);
          errorCount++;
        }
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 SEEDING SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Successfully created: ${successCount} categories`);
    if (skipCount > 0) {
      console.log(`⏭️  Skipped: ${skipCount} categories`);
    }
    if (errorCount > 0) {
      console.log(`❌ Failed: ${errorCount} categories`);
    }
    console.log('='.repeat(60) + '\n');

    // Display all categories
    const allCategories = await BlogCategory.find().sort({ order: 1 });
    console.log('📋 ALL CATEGORIES IN DATABASE:\n');
    allCategories.forEach((cat, index) => {
      console.log(`${index + 1}. ${cat.icon} ${cat.name}`);
      console.log(`   Slug: ${cat.slug}`);
      console.log(`   Color: ${cat.color}`);
      console.log(`   Status: ${cat.isActive ? '🟢 Active' : '🔴 Inactive'}`);
      console.log(`   Posts: ${cat.postCount || 0}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error seeding categories:', error);
    throw error;
  }
}

/**
 * Main execution
 */
async function main() {
  try {
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║         RemotCyberHelp Blog Category Seeder               ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    await connectDB();
    await seedCategories();

    console.log('✨ Blog category seeding completed successfully!\n');

    // Close database connection
    await mongoose.connection.close();
    console.log('👋 Database connection closed\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Seeding failed:', error);
    process.exit(1);
  }
}

// Run the script
main();

module.exports = { defaultCategories, seedCategories };
