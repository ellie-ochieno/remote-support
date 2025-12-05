import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../../.env') });

// Import User model
import User from '../models/User.cjs';

async function fixUserPassword(email, newPassword) {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB successfully\n');

    // Find the user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      console.error(`❌ User not found with email: ${email}`);
      process.exit(1);
    }

    console.log('User found:');
    console.log(`  Email: ${user.email}`);
    console.log(`  Name: ${user.name}`);
    console.log(`  ID: ${user._id}`);
    console.log(`  Current password exists: ${!!user.password}`);
    console.log(`  Current password length: ${user.password ? user.password.length : 0}`);
    console.log(`  Is hashed (starts with $2): ${user.password ? user.password.startsWith('$2') : false}`);

    if (user.password) {
      console.log(`  Password hash prefix: ${user.password.substring(0, 10)}...`);
    }
    console.log('');

    // Hash the new password manually
    console.log('Hashing new password...');
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    console.log(`Hashed password: ${hashedPassword.substring(0, 20)}...`);
    console.log(`Hash length: ${hashedPassword.length}`);
    console.log('');

    // Test the hash immediately
    console.log('Testing hash before saving...');
    const testMatch = await bcrypt.compare(newPassword, hashedPassword);
    console.log(`Test comparison result: ${testMatch ? '✅ MATCH' : '❌ NO MATCH'}`);
    console.log('');

    if (!testMatch) {
      console.error('❌ Hash test failed! Something is wrong with bcrypt.');
      process.exit(1);
    }

    // Update password directly (bypassing pre-save hook to avoid double-hashing)
    console.log('Updating password in database...');
    await User.updateOne(
      { _id: user._id },
      {
        $set: {
          password: hashedPassword,
          lastPasswordChange: new Date()
        },
        $unset: {
          loginAttempts: 1,
          lockUntil: 1
        }
      }
    );

    // Verify the update
    const updatedUser = await User.findById(user._id).select('+password');
    console.log('\nPassword updated successfully!');
    console.log(`New password hash: ${updatedUser.password.substring(0, 20)}...`);
    console.log(`New hash length: ${updatedUser.password.length}`);
    console.log('');

    // Test login with the new password
    console.log('Testing login with new password...');
    const loginTest = await bcrypt.compare(newPassword, updatedUser.password);
    console.log(`Login test result: ${loginTest ? '✅ SUCCESS' : '❌ FAILED'}`);
    console.log('');

    if (loginTest) {
      console.log('✅ Password reset completed successfully!');
      console.log(`\nYou can now login with:`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Password: ${newPassword}`);
    } else {
      console.error('❌ Password reset failed! Login test unsuccessful.');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error fixing user password:', error);
    process.exit(1);
  }
}

// Get email and password from command line arguments
const email = process.argv[2];
const newPassword = process.argv[3];

if (!email || !newPassword) {
  console.log('Usage: node fix-user-password.js <email> <new-password>');
  console.log('Example: node fix-user-password.js user@example.com newPassword123');
  process.exit(1);
}

if (newPassword.length < 6) {
  console.error('❌ Password must be at least 6 characters long');
  process.exit(1);
}

// Solution:
// The user's password may not be properly hashed. Use this command to fix it:
//
// ```bash
// cd backend
// node src/scripts/fix-user-password.js ochienoellie@gmail.com YourNewPassword123
// ```

fixUserPassword(email, newPassword);
