const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email address']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false // Don't include password in queries by default
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  firstName: {
    type: String,
    trim: true,
    maxlength: [50, 'First name cannot be more than 50 characters']
  },
  lastName: {
    type: String,
    trim: true,
    maxlength: [50, 'Last name cannot be more than 50 characters']
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'super_admin'],
    default: 'user'
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: {
    type: String,
    select: false
  },
  emailVerificationExpires: {
    type: Date,
    select: false
  },
  passwordResetToken: {
    type: String,
    select: false
  },
  passwordResetExpires: {
    type: Date,
    select: false
  },
  profile: {
    phone: {
      type: String,
      trim: true,
      match: [/^\+?[1-9]\d{1,14}$/, 'Please provide a valid phone number']
    },
    location: {
      type: String,
      trim: true,
      maxlength: [100, 'Location cannot be more than 100 characters']
    },
    avatar: {
      type: String,
      trim: true
    },
    preferences: {
      theme: {
        type: String,
        enum: ['light', 'dark', 'system'],
        default: 'system'
      },
      notifications: {
        type: Boolean,
        default: true
      },
      language: {
        type: String,
        default: 'en',
        maxlength: [10, 'Language code cannot be more than 10 characters']
      },
      timezone: {
        type: String,
        default: 'UTC',
        maxlength: [50, 'Timezone cannot be more than 50 characters']
      }
    },
    subscriptions: {
      newsletter: {
        type: Boolean,
        default: false
      },
      productUpdates: {
        type: Boolean,
        default: true
      },
      securityAlerts: {
        type: Boolean,
        default: true
      }
    }
  },
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: {
    type: Date
  },
  lastLogin: {
    type: Date
  },
  lastPasswordChange: {
    type: Date,
    default: Date.now
  },
  twoFactorEnabled: {
    type: Boolean,
    default: false
  },
  twoFactorSecret: {
    type: String,
    select: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete ret.password;
      delete ret.__v;
      delete ret.emailVerificationToken;
      delete ret.emailVerificationExpires;
      delete ret.passwordResetToken;
      delete ret.passwordResetExpires;
      delete ret.twoFactorSecret;
      return ret;
    }
  }
});

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  if (this.firstName && this.lastName) {
    return `${this.firstName} ${this.lastName}`;
  }
  return this.name;
});

// Virtual for account lock status
userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Indexes
// userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ role: 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ 'profile.phone': 1 }, { sparse: true });
userSchema.index({ isEmailVerified: 1 });

// Password hashing middleware
userSchema.pre('save', async function(next) {
  // Only hash the password if it's been modified (or is new)
  if (!this.isModified('password')) return next();

  try {
    // Hash password with cost of 12
    const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_ROUNDS) || 12);
    this.password = await bcrypt.hash(this.password, salt);

    // Update last password change
    if (!this.isNew) {
      this.lastPasswordChange = new Date();
    }

    next();
  } catch (error) {
    next(error);
  }
});

// Update firstName and lastName from name
userSchema.pre('save', function(next) {
  if (this.isModified('name') && !this.firstName && !this.lastName) {
    const nameParts = this.name.trim().split(/\s+/);
    this.firstName = nameParts[0];
    this.lastName = nameParts.slice(1).join(' ') || '';
  }
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    if (!this.password) {
      throw new Error('No password set for this user');
    }

    // Ensure candidate password exists
    if (!candidatePassword) {
      return false;
    }

    // Use bcrypt to compare
    const result = await bcrypt.compare(candidatePassword, this.password);
    return result;
  } catch (error) {
    console.error('Password comparison error:', error.message);
    return false;
  }
};

// Generate JWT token
userSchema.methods.generateAuthToken = function() {
  const payload = {
    id: this._id,
    email: this.email,
    role: this.role,
    name: this.name
  };

  return jwt.sign(
    payload,
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
      issuer: 'RemotCyberHelp',
      audience: 'RemotCyberHelp-Users'
    }
  );
};

// Generate refresh token
userSchema.methods.generateRefreshToken = function() {
  const payload = {
    id: this._id,
    type: 'refresh'
  };

  return jwt.sign(
    payload,
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
      issuer: 'RemotCyberHelp',
      audience: 'RemotCyberHelp-Refresh'
    }
  );
};

// Account locking methods
userSchema.methods.incLoginAttempts = function() {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 }
    });
  }

  const updates = { $inc: { loginAttempts: 1 } };
  const maxAttempts = parseInt(process.env.MAX_LOGIN_ATTEMPTS) || 5;
  const lockTime = parseInt(process.env.LOCK_TIME) || 2 * 60 * 60 * 1000; // 2 hours

  // If we hit max attempts and no lock is set, lock the account
  if (this.loginAttempts + 1 >= maxAttempts && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + lockTime };
  }

  return this.updateOne(updates);
};

// Reset login attempts
userSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 }
  });
};

// Check if user has permission
userSchema.methods.hasPermission = function(permission) {
  const permissions = {
    user: ['read_own_profile', 'update_own_profile', 'create_tickets', 'book_consultations'],
    admin: ['read_all_profiles', 'manage_tickets', 'manage_consultations', 'view_analytics'],
    super_admin: ['manage_users', 'manage_system', 'view_all_data', 'system_configuration']
  };

  const userPermissions = permissions[this.role] || [];

  // Super admin has all permissions
  if (this.role === 'super_admin') {
    return true;
  }

  // Admin has user permissions too
  if (this.role === 'admin') {
    userPermissions.push(...permissions.user);
  }

  return userPermissions.includes(permission);
};

// Create verification token
userSchema.methods.createEmailVerificationToken = function() {
  const verificationToken = jwt.sign(
    {
      id: this._id,
      email: this.email,
      type: 'email_verification'
    },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );

  this.emailVerificationToken = verificationToken;
  this.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  return verificationToken;
};

// Create password reset token
userSchema.methods.createPasswordResetToken = function() {
  const resetToken = jwt.sign(
    {
      id: this._id,
      email: this.email,
      type: 'password_reset'
    },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  this.passwordResetToken = resetToken;
  this.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  return resetToken;
};

// Static method to find user by credentials
userSchema.statics.findByCredentials = async function(email, password) {
  try {
    // Find user with password field included
    const user = await this.findOne({ email }).select('+password +loginAttempts +lockUntil');

    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Check if account is locked
    if (user.isLocked) {
      await user.incLoginAttempts();
      throw new Error('Account is temporarily locked due to too many failed login attempts');
    }

    // Ensure password is available for comparison
    if (!user.password) {
      throw new Error('Invalid email or password');
    }

    // Verify password
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      await user.incLoginAttempts();
      throw new Error('Invalid email or password');
    }

    // Reset login attempts on successful login
    if (user.loginAttempts && user.loginAttempts > 0) {
      await user.resetLoginAttempts();
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    return user;
  } catch (error) {
    // Don't log sensitive info in production
    if (process.env.NODE_ENV === 'development') {
      console.error('Login attempt failed for:', email);
    }
    throw error;
  }
};

// Admin: Update user role
userSchema.statics.updateRole = async function(userId, role) {
  try {
    const user = await this.findByIdAndUpdate(
      userId,
      { role },
      { new: true, runValidators: true }
    ).select('-password -emailVerificationToken -passwordResetToken -twoFactorSecret');

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  } catch (error) {
    throw error;
  }
};

// Admin: Delete user profile
userSchema.statics.deleteProfile = async function(userId) {
  try {
    const user = await this.findByIdAndDelete(userId);

    if (!user) {
      throw new Error('User not found');
    }

    return { success: true, message: 'User deleted successfully' };
  } catch (error) {
    throw error;
  }
};

// Admin: Get all users with pagination
userSchema.statics.getAll = async function(filters = {}) {
  try {
    const {
      role,
      page = 1,
      limit = 20,
      searchTerm,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = filters;

    let query = {};

    if (role) {
      query.role = role;
    }

    if (searchTerm) {
      query.$or = [
        { name: { $regex: searchTerm, $options: 'i' } },
        { firstName: { $regex: searchTerm, $options: 'i' } },
        { lastName: { $regex: searchTerm, $options: 'i' } },
        { email: { $regex: searchTerm, $options: 'i' } }
      ];
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (page - 1) * limit;

    const users = await this.find(query)
      .select('-password -emailVerificationToken -passwordResetToken -twoFactorSecret')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await this.countDocuments(query);

    return {
      users,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        count: users.length,
        totalRecords: total
      }
    };
  } catch (error) {
    throw error;
  }
};

// Admin: Log user activity
userSchema.statics.logActivity = async function(userId, activityData) {
  try {
    // For now, just log to console
    // In production, you might want to store this in a separate ActivityLog collection
    console.log(`[Activity Log] User ${userId}:`, {
      type: activityData.type,
      description: activityData.description,
      metadata: activityData.metadata,
      timestamp: new Date()
    });

    // Optionally, you can create an ActivityLog model and save here
    return { success: true };
  } catch (error) {
    throw error;
  }
};

// Admin: Get user activity logs
userSchema.statics.getUserActivity = async function(filters = {}) {
  try {
    const { startDate, endDate, limit = 50 } = filters;

    // For now, return empty array
    // In production, query from ActivityLog collection
    // This is a placeholder implementation
    const activities = [];

    return activities;
  } catch (error) {
    throw error;
  }
};

const User = mongoose.model('User', userSchema);

module.exports = User;
