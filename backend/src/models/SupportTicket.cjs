const mongoose = require('mongoose');

// Ticket Response Schema
const ticketResponseSchema = new mongoose.Schema({
  ticketId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SupportTicket',
    required: true
  },
  message: {
    type: String,
    required: true
  },
  isAdminResponse: {
    type: Boolean,
    default: false
  },
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  attachments: [{
    filename: String,
    originalName: String,
    mimeType: String,
    size: Number,
    url: String
  }]
}, {
  timestamps: true,
  collection: 'ticket_responses'
});

// Support Ticket Schema
const supportTicketSchema = new mongoose.Schema({
  ticketNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  priority: {
    type: String,
    required: true,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  category: {
    type: String,
    required: true,
    enum: [
      // Title case format
      'Technical Support',
      'Account Issues',
      'Billing',
      'Feature Request',
      'Bug Report',
      'General Inquiry',
      'Emergency Support',
      // Lowercase format (from forms)
      'technical',
      'account',
      'billing',
      'feature',
      'bug',
      'general',
      'emergency',
      'instant',
      'consultation',
      'scheduled',
      'scheduled-consultation',
      'service-request',
      'general-support',
      'other'
    ]
  },
  status: {
    type: String,
    enum: ['open', 'in_progress', 'resolved', 'closed', 'on_hold'],
    default: 'open'
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  email: {
    type: String,
    required: false,  // Made optional - phone can be used instead
    trim: true,
    lowercase: true,
    default: null
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  adminNotes: {
    type: String,
    default: ''
  },
  escalated: {
    type: Boolean,
    default: false
  },
  escalationReason: {
    type: String,
    default: ''
  },
  escalatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  escalatedAt: {
    type: Date,
    default: null
  },
  assignedAt: {
    type: Date,
    default: null
  },
  inProgressAt: {
    type: Date,
    default: null
  },
  resolvedAt: {
    type: Date,
    default: null
  },
  closedAt: {
    type: Date,
    default: null
  },
  lastResponseAt: {
    type: Date,
    default: null
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true,
  collection: 'support_tickets'
});

// Indexes for better query performance
// supportTicketSchema.index({ ticketNumber: 1 });
supportTicketSchema.index({ status: 1, priority: -1, createdAt: -1 });
supportTicketSchema.index({ userId: 1, createdAt: -1 });
supportTicketSchema.index({ assignedTo: 1, status: 1 });
supportTicketSchema.index({ category: 1 });
supportTicketSchema.index({ escalated: 1, priority: -1 });

ticketResponseSchema.index({ ticketId: 1, createdAt: -1 });

const SupportTicket = mongoose.model('SupportTicket', supportTicketSchema);
const TicketResponse = mongoose.model('TicketResponse', ticketResponseSchema);

class SupportTicketModel {
  // Create a new support ticket
  static async create(ticketData) {
    try {
      // Generate unique ticket number
      const ticketNumber = await this.generateTicketNumber();

      const ticket = new SupportTicket({
        ...ticketData,
        ticketNumber
      });

      const savedTicket = await ticket.save();
      return savedTicket;
    } catch (error) {
      throw error;
    }
  }

  // Get support ticket by ID
  static async getById(ticketId) {
    try {
      const ticket = await SupportTicket.findById(ticketId)
        .populate('userId', 'email fullName')
        .populate('assignedTo', 'email fullName')
        .populate('escalatedBy', 'email fullName');

      if (!ticket) {
        throw new Error('Support ticket not found');
      }

      // Get responses for this ticket
      const responses = await TicketResponse.find({ ticketId })
        .populate('adminId', 'email fullName')
        .sort({ createdAt: 1 });

      return {
        ...ticket.toObject(),
        responses
      };
    } catch (error) {
      throw error;
    }
  }

  // Get support ticket by ticket number
  static async getByTicketNumber(ticketNumber) {
    try {
      const ticket = await SupportTicket.findOne({ ticketNumber })
        .populate('userId', 'email fullName')
        .populate('assignedTo', 'email fullName');

      if (!ticket) {
        throw new Error('Support ticket not found');
      }

      // Get responses for this ticket
      const responses = await TicketResponse.find({ ticketId: ticket._id })
        .populate('adminId', 'email fullName')
        .sort({ createdAt: 1 });

      return {
        ...ticket.toObject(),
        responses
      };
    } catch (error) {
      throw error;
    }
  }

  // Get all support tickets with filtering and pagination
  static async getAll(filters = {}) {
    try {
      const {
        status,
        priority,
        category,
        assignedTo,
        page = 1,
        limit = 20,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        searchTerm
      } = filters;

      let query = {};

      // Apply filters
      if (status) query.status = status;
      if (priority) query.priority = priority;
      if (category) query.category = category;
      if (assignedTo) query.assignedTo = assignedTo;

      // Search functionality
      if (searchTerm) {
        query.$or = [
          { ticketNumber: { $regex: searchTerm, $options: 'i' } },
          { subject: { $regex: searchTerm, $options: 'i' } },
          { description: { $regex: searchTerm, $options: 'i' } },
          { email: { $regex: searchTerm, $options: 'i' } }
        ];
      }

      // Sorting
      const sort = {};
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

      // Pagination
      const skip = (page - 1) * limit;

      const tickets = await SupportTicket.find(query)
        .populate('userId', 'email fullName')
        .populate('assignedTo', 'email fullName')
        .sort(sort)
        .skip(skip)
        .limit(limit);

      const total = await SupportTicket.countDocuments(query);

      return {
        tickets,
        pagination: {
          current: page,
          total: Math.ceil(total / limit),
          count: tickets.length,
          totalRecords: total
        }
      };
    } catch (error) {
      throw error;
    }
  }

  // Update support ticket status
  static async updateStatus(ticketId, status, adminId = null, adminNotes = null) {
    try {
      const updateData = { status };

      if (adminId) {
        updateData.assignedTo = adminId;
      }

      if (adminNotes) {
        updateData.adminNotes = adminNotes;
      }

      // Set status-specific timestamps
      switch (status) {
        case 'in_progress':
          updateData.inProgressAt = new Date();
          break;
        case 'resolved':
          updateData.resolvedAt = new Date();
          break;
        case 'closed':
          updateData.closedAt = new Date();
          break;
      }

      const ticket = await SupportTicket.findByIdAndUpdate(
        ticketId,
        updateData,
        { new: true, runValidators: true }
      ).populate('assignedTo', 'email fullName');

      if (!ticket) {
        throw new Error('Support ticket not found');
      }

      return ticket;
    } catch (error) {
      throw error;
    }
  }

  // Add response to support ticket
  static async addResponse(ticketId, responseData) {
    try {
      const response = new TicketResponse({
        ticketId,
        ...responseData
      });

      const savedResponse = await response.save();

      // Update ticket's last response time
      await SupportTicket.findByIdAndUpdate(ticketId, {
        lastResponseAt: new Date()
      });

      // Populate admin info if it's an admin response
      if (savedResponse.isAdminResponse && savedResponse.adminId) {
        await savedResponse.populate('adminId', 'email fullName');
      }

      return savedResponse;
    } catch (error) {
      throw error;
    }
  }

  // Assign ticket to admin
  static async assignToAdmin(ticketId, adminId) {
    try {
      const ticket = await SupportTicket.findByIdAndUpdate(
        ticketId,
        {
          assignedTo: adminId,
          status: 'in_progress',
          assignedAt: new Date()
        },
        { new: true, runValidators: true }
      ).populate('assignedTo', 'email fullName');

      if (!ticket) {
        throw new Error('Support ticket not found');
      }

      return ticket;
    } catch (error) {
      throw error;
    }
  }

  // Delete support ticket
  static async delete(ticketId) {
    try {
      // First delete associated responses
      await TicketResponse.deleteMany({ ticketId });

      // Then delete the ticket
      const ticket = await SupportTicket.findByIdAndDelete(ticketId);
      if (!ticket) {
        throw new Error('Support ticket not found');
      }

      return { success: true };
    } catch (error) {
      throw error;
    }
  }

  // Get user's support tickets
  static async getUserTickets(userId, filters = {}) {
    try {
      const { page = 1, limit = 10, status } = filters;
      const skip = (page - 1) * limit;

      let query = { userId };
      if (status) query.status = status;

      const tickets = await SupportTicket.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      // Get response counts for each ticket
      const ticketsWithResponses = await Promise.all(
        tickets.map(async (ticket) => {
          const responseCount = await TicketResponse.countDocuments({
            ticketId: ticket._id
          });
          return {
            ...ticket.toObject(),
            responseCount
          };
        })
      );

      const total = await SupportTicket.countDocuments(query);

      return {
        tickets: ticketsWithResponses,
        pagination: {
          current: page,
          total: Math.ceil(total / limit),
          count: tickets.length,
          totalRecords: total
        }
      };
    } catch (error) {
      throw error;
    }
  }

  // Get support ticket statistics
  static async getStats(filters = {}) {
    try {
      const { startDate, endDate, adminId } = filters;

      let matchQuery = {};
      if (startDate || endDate) {
        matchQuery.createdAt = {};
        if (startDate) matchQuery.createdAt.$gte = new Date(startDate);
        if (endDate) matchQuery.createdAt.$lte = new Date(endDate);
      }
      if (adminId) {
        matchQuery.assignedTo = new mongoose.Types.ObjectId(adminId);
      }

      const stats = await SupportTicket.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            statuses: { $push: '$status' },
            priorities: { $push: '$priority' },
            categories: { $push: '$category' },
            assignees: { $push: '$assignedTo' },
            resolutionTimes: {
              $push: {
                $cond: [
                  { $ne: ['$resolvedAt', null] },
                  { $subtract: ['$resolvedAt', '$createdAt'] },
                  null
                ]
              }
            }
          }
        }
      ]);

      if (stats.length === 0) {
        return {
          total: 0,
          byStatus: {},
          byPriority: {},
          byCategory: {},
          byAssignee: {},
          averageResolutionTime: 0,
          resolvedCount: 0
        };
      }

      const result = {
        total: stats[0].total,
        byStatus: {},
        byPriority: {},
        byCategory: {},
        byAssignee: {},
        averageResolutionTime: 0,
        resolvedCount: 0
      };

      // Count occurrences
      stats[0].statuses.forEach(status => {
        result.byStatus[status] = (result.byStatus[status] || 0) + 1;
      });

      stats[0].priorities.forEach(priority => {
        result.byPriority[priority] = (result.byPriority[priority] || 0) + 1;
      });

      stats[0].categories.forEach(category => {
        result.byCategory[category] = (result.byCategory[category] || 0) + 1;
      });

      stats[0].assignees.forEach(assignee => {
        if (assignee) {
          result.byAssignee[assignee] = (result.byAssignee[assignee] || 0) + 1;
        }
      });

      // Calculate average resolution time
      const validResolutionTimes = stats[0].resolutionTimes.filter(time => time !== null);
      if (validResolutionTimes.length > 0) {
        const totalTime = validResolutionTimes.reduce((sum, time) => sum + time, 0);
        result.averageResolutionTime = Math.round(totalTime / validResolutionTimes.length / (1000 * 60 * 60)); // in hours
        result.resolvedCount = validResolutionTimes.length;
      }

      return result;
    } catch (error) {
      throw error;
    }
  }

  // Get high priority tickets requiring attention
  static async getAttentionRequired() {
    try {
      const twelveHoursAgo = new Date();
      twelveHoursAgo.setHours(twelveHoursAgo.getHours() - 12);

      const tickets = await SupportTicket.find({
        $or: [
          { priority: 'critical' },
          { priority: 'high', createdAt: { $lt: twelveHoursAgo } },
          { status: 'open', createdAt: { $lt: twelveHoursAgo } }
        ]
      })
        .populate('userId', 'email fullName')
        .populate('assignedTo', 'email fullName')
        .sort({ priority: -1, createdAt: 1 });

      return tickets;
    } catch (error) {
      throw error;
    }
  }

  // Generate unique ticket number with retry logic to prevent duplicates
  static async generateTicketNumber() {
    const maxRetries = 5;
    let attempt = 0;

    // Define Counter model only once (check if it exists first)
    let Counter;
    try {
      Counter = mongoose.model('Counter');
    } catch (error) {
      // Model doesn't exist, create it
      const counterSchema = new mongoose.Schema({
        _id: String,
        sequence: { type: Number, default: 0 },
        date: String
      });
      Counter = mongoose.model('Counter', counterSchema);
    }

    while (attempt < maxRetries) {
      try {
        const prefix = 'RCH';
        const date = new Date();
        const year = date.getFullYear().toString().slice(-2);
        const month = (date.getMonth() + 1).toString().padStart(2, '0');

        const dateKey = `${year}${month}`;
        const counter = await Counter.findOneAndUpdate(
          { _id: `ticket_${dateKey}` },
          {
            $inc: { sequence: 1 },
            $set: { date: dateKey }
          },
          {
            new: true,
            upsert: true,
            runValidators: false
          }
        );

        const sequence = counter.sequence.toString().padStart(4, '0');
        const ticketNumber = `${prefix}${year}${month}${sequence}`;

        // Verify uniqueness
        const existing = await SupportTicket.findOne({ ticketNumber });
        if (!existing) {
          return ticketNumber;
        }

        // If duplicate found, retry
        attempt++;
        console.warn(`Duplicate ticket number ${ticketNumber} found, retrying... (attempt ${attempt}/${maxRetries})`);

      } catch (error) {
        attempt++;
        if (attempt >= maxRetries) {
          console.error('Failed to generate unique ticket number:', error);
          throw new Error(`Failed to generate unique ticket number after ${maxRetries} attempts. Please try again.`);
        }
        console.warn(`Error generating ticket number, retrying... (attempt ${attempt}/${maxRetries})`, error);
        await new Promise(resolve => setTimeout(resolve, 100 * attempt)); // Exponential backoff
      }
    }

    throw new Error('Failed to generate unique ticket number. Please try again.');
  }

  // Escalate ticket
  static async escalate(ticketId, escalationReason, escalatedBy) {
    try {
      const ticket = await SupportTicket.findByIdAndUpdate(
        ticketId,
        {
          priority: 'critical',
          escalated: true,
          escalationReason,
          escalatedBy,
          escalatedAt: new Date()
        },
        { new: true, runValidators: true }
      ).populate('escalatedBy', 'email fullName');

      if (!ticket) {
        throw new Error('Support ticket not found');
      }

      return ticket;
    } catch (error) {
      throw error;
    }
  }

  // Get tickets assigned to specific admin
  static async getAssignedTickets(adminId, filters = {}) {
    try {
      const { status, priority, page = 1, limit = 20 } = filters;
      const skip = (page - 1) * limit;

      let query = { assignedTo: adminId };
      if (status) query.status = status;
      if (priority) query.priority = priority;

      const tickets = await SupportTicket.find(query)
        .populate('userId', 'email fullName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await SupportTicket.countDocuments(query);

      return {
        tickets,
        pagination: {
          current: page,
          total: Math.ceil(total / limit),
          count: tickets.length,
          totalRecords: total
        }
      };
    } catch (error) {
      throw error;
    }
  }

  // Response management methods
  static async getTicketResponses(ticketId) {
    try {
      const responses = await TicketResponse.find({ ticketId })
        .populate('adminId', 'email fullName')
        .sort({ createdAt: 1 });

      return responses;
    } catch (error) {
      throw error;
    }
  }

  static async deleteResponse(responseId) {
    try {
      const response = await TicketResponse.findByIdAndDelete(responseId);
      if (!response) {
        throw new Error('Response not found');
      }

      return { success: true };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = { SupportTicket, TicketResponse, SupportTicketModel };
