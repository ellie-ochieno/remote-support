const mongoose = require('mongoose');

const packageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Package name is required'],
    trim: true,
    maxlength: [100, 'Package name cannot be more than 100 characters']
  },
  type: {
    type: String,
    enum: ['freemium', 'premium'],
    required: [true, 'Package type is required']
  },
  features: [{
    type: String,
    required: true,
    trim: true
  }],
  duration: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Package description cannot be more than 500 characters']
  },
  isPopular: {
    type: Boolean,
    default: false
  }
}, {
  _id: false
});

const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Service name is required'],
    trim: true,
    maxlength: [100, 'Service name cannot be more than 100 characters']
  },
  slug: {
    type: String,
    required: [true, 'Service slug is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens']
  },
  description: {
    type: String,
    required: [true, 'Service description is required'],
    trim: true,
    maxlength: [1000, 'Service description cannot be more than 1000 characters']
  },
  shortDescription: {
    type: String,
    trim: true,
    maxlength: [200, 'Short description cannot be more than 200 characters']
  },
  icon: {
    type: String,
    required: [true, 'Service icon is required'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Service category is required'],
    enum: ['technical', 'digital', 'consultation', 'training', 'emergency'],
    lowercase: true
  },
  packages: {
    type: [packageSchema],
    required: [true, 'At least one package is required'],
    validate: {
      validator: function(packages) {
        return packages && packages.length > 0;
      },
      message: 'Service must have at least one package'
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isPopular: {
    type: Boolean,
    default: false
  },
  sortOrder: {
    type: Number,
    default: 0
  },
  metadata: {
    tags: [{
      type: String,
      trim: true,
      lowercase: true
    }],
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner'
    },
    estimatedTime: {
      type: String,
      trim: true
    }
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
      delete ret.__v;
      return ret;
    }
  }
});

// Indexes
serviceSchema.index({ category: 1 });
serviceSchema.index({ isActive: 1 });
serviceSchema.index({ isPopular: 1 });
serviceSchema.index({ sortOrder: 1 });
serviceSchema.index({ name: 'text', description: 'text' });

// Virtual for package count
serviceSchema.virtual('packageCount').get(function() {
  return this.packages ? this.packages.length : 0;
});

// Virtual for freemium packages
serviceSchema.virtual('freemiumPackages').get(function() {
  return this.packages ? this.packages.filter(pkg => pkg.type === 'freemium') : [];
});

// Virtual for premium packages
serviceSchema.virtual('premiumPackages').get(function() {
  return this.packages ? this.packages.filter(pkg => pkg.type === 'premium') : [];
});

// Pre-save middleware to update timestamps
serviceSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Static method to find active services
serviceSchema.statics.findActive = function(options = {}) {
  return this.find({ isActive: true, ...options }).sort({ sortOrder: 1, name: 1 });
};

// Static method to find by category
serviceSchema.statics.findByCategory = function(category, options = {}) {
  return this.find({ category, isActive: true, ...options }).sort({ sortOrder: 1, name: 1 });
};

// Static method to find popular services
serviceSchema.statics.findPopular = function(limit = 6) {
  return this.find({ isPopular: true, isActive: true })
    .sort({ sortOrder: 1, name: 1 })
    .limit(limit);
};

// Instance method to get display name
serviceSchema.methods.getDisplayName = function() {
  return this.name;
};

// Instance method to check if service has freemium packages
serviceSchema.methods.hasFreemiumPackages = function() {
  return this.packages.some(pkg => pkg.type === 'freemium');
};

// Instance method to check if service has premium packages
serviceSchema.methods.hasPremiumPackages = function() {
  return this.packages.some(pkg => pkg.type === 'premium');
};

const Service = mongoose.model('Service', serviceSchema);

module.exports = Service;
