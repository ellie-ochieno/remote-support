import express from 'express';
import { SupportTicketModel } from '../models/SupportTicket.cjs';
import { authMiddleware, optionalAuthMiddleware } from '../middleware/auth.js';
import {
  validateSupportTicket,
  validateBotProtection,
  validatePagination,
  validateUUID,
  verifyRecaptcha,
  validateInstantRemoteSupport,
  validateInstantSupport,
  validateTechnicalSupportRequest
} from '../middleware/validation.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

// @route   POST /api/support/instant-remote
// @desc    Handle instant remote support request with email capture
// @access  Public
router.post('/instant-remote',
  verifyRecaptcha,
  validateInstantRemoteSupport,
  asyncHandler(async (req, res) => {
    const { email, supportType, timestamp } = req.body;

    // Basic validation
    if (!email || !email.includes('@')) {
      return res.status(400).json({
        success: false,
        message: 'Valid email address is required'
      });
    }

    try {
      // Generate a unique meeting link or session ID
      const sessionId = `remote-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const meetingLink = `https://connect.remotcyberhelp.com/session/${sessionId}`;

      // Create support ticket for tracking
      const ticketData = {
        subject: 'Instant Remote Support Request',
        description: `Remote support session requested via instant support.\nEmail: ${email}\nSupport Type: ${supportType}\nSession ID: ${sessionId}`,
        priority: 'high',
        category: 'remote-support',
        userId: null,
        email: email,
        metadata: {
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          source: 'instant-support-remote',
          sessionId: sessionId,
          meetingLink: meetingLink,
          supportType: supportType,
          requestedAt: timestamp
        }
      };

      const ticket = await SupportTicketModel.create(ticketData);

      // TODO: Send email with download link for remote support app
      // For now, we'll simulate this with a success response

      res.status(201).json({
        success: true,
        message: 'Remote support link sent successfully',
        data: {
          ticketId: ticket.ticket_number,
          sessionId: sessionId,
          email: email,
          estimatedResponseTime: '8 minutes'
        }
      });

    } catch (error) {
      console.error('Instant remote support error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to process remote support request'
      });
    }
  })
);

// @route   POST /api/support/ticket
// @desc    Create a new support ticket (Updated for instant support)
// @access  Private or Public (with email)
router.post('/ticket',
  verifyRecaptcha,
  validateBotProtection,
  validateSupportTicket,
  optionalAuthMiddleware,
  asyncHandler(async (req, res) => {
    const {
      name,
      phone,
      email,
      message,
      urgency,
      service,
      type,
      metadata
    } = req.body;

    try {
      // For instant support, create more detailed ticket
      const isInstantSupport = type === 'instant-support';

      const ticketData = {
        subject: isInstantSupport ? `Instant Support - ${service}` : 'Support Request',
        description: isInstantSupport
          ? `Instant Support Request\n\nName: ${name}\nPhone: ${phone}\nEmail: ${email || 'Not provided'}\nSupport Type: ${service}\nUrgency: ${urgency}\n\nIssue Description:\n${message}`
          : message,
        priority: urgency || 'medium',
        category: isInstantSupport ? 'instant-support' : 'general',
        userId: req.user?.id || null,
        email: req.user?.email || email,
        metadata: {
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          referrer: req.get('Referer'),
          source: isInstantSupport ? 'instant_support_page' : 'website_support_form',
          customerName: name,
          customerPhone: phone,
          supportType: service,
          urgency: urgency,
          ...metadata
        }
      };

      const ticket = await SupportTicketModel.create(ticketData);

      // For instant support, generate connection details
      let responseData = {
        ticketId: ticket.ticket_number,
        status: ticket.status,
        priority: ticket.priority,
        createdAt: ticket.created_at
      };

      if (isInstantSupport) {
        const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const connectionCode = Math.random().toString(36).substr(2, 8).toUpperCase();

        responseData = {
          ...responseData,
          sessionId: sessionId,
          connectionCode: connectionCode,
          estimatedResponseTime: getResponseTime(service, urgency)
        };

        // Update ticket with session details
        await SupportTicketModel.updateMetadata(ticket.id, {
          sessionId: sessionId,
          connectionCode: connectionCode
        });
      }

      // TODO: Send confirmation email to user
      // TODO: Send notification to admin
      // TODO: For instant support, send SMS with connection details

      res.status(201).json({
        success: true,
        message: isInstantSupport
          ? 'Support session created! Connection details will be sent via SMS and email.'
          : 'Support ticket created successfully. You will receive updates via email.',
        data: responseData
      });

    } catch (error) {
      console.error('Create support ticket error:', error);

      // Provide user-friendly error messages
      let errorMessage = 'Failed to create support ticket. Please try again.';
      let statusCode = 500;

      if (error.message && error.message.includes('ticket number')) {
        errorMessage = 'Unable to generate ticket number. Please try again in a moment.';
      } else if (error.code === 11000) {
        errorMessage = 'A duplicate ticket was detected. Please try again.';
      } else if (error.name === 'ValidationError') {
        errorMessage = 'Please check all required fields and try again.';
        statusCode = 400;
      }

      res.status(statusCode).json({
        success: false,
        message: errorMessage,
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  })
);

// @route   POST /api/support/tickets
// @desc    Create a new support ticket from support page
// @access  Public
router.post('/tickets',
  verifyRecaptcha,
  validateBotProtection,
  optionalAuthMiddleware,
  asyncHandler(async (req, res) => {
    const {
      firstName,
      lastName,
      email,
      phone,
      issueCategory,
      description,
      priority = 'medium',
      businessType = 'individual',
      preferredContact = 'phone',
      supportType,
      supportLevel,
      expectedResponseTime
    } = req.body;

    // Basic validation
    if (!firstName || !phone || !description || !issueCategory) {
      return res.status(400).json({
        success: false,
        message: 'Required fields: firstName, phone, description, issueCategory'
      });
    }

    try {
      const fullName = `${firstName} ${lastName || ''}`.trim();

      const ticketData = {
        subject: `${supportLevel || 'Support Request'} - ${issueCategory}`,
        description: `Name: ${fullName}\nPhone: ${phone}\nEmail: ${email || 'Not provided'}\nBusiness Type: ${businessType}\nIssue Category: ${issueCategory}\nPriority: ${priority}\nSupport Type: ${supportType || 'General'}\nPreferred Contact: ${preferredContact}\n\nIssue Description:\n${description}`,
        priority: priority,
        category: supportType || 'general-support',
        userId: req.user?.id || null,
        email: req.user?.email || email || null,
        metadata: {
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          source: 'support_page_form',
          customerName: fullName,
          customerPhone: phone,
          customerEmail: email,
          businessType: businessType,
          issueCategory: issueCategory,
          supportType: supportType,
          supportLevel: supportLevel,
          preferredContact: preferredContact,
          expectedResponseTime: expectedResponseTime,
          submissionTimestamp: new Date().toISOString()
        }
      };

      const ticket = await SupportTicketModel.create(ticketData);

      // Determine response time based on priority
      let responseTimeMessage = '4-6 hours';
      if (priority === 'high') {
        responseTimeMessage = '30 minutes';
      } else if (priority === 'medium') {
        responseTimeMessage = '2-3 hours';
      }

      res.status(201).json({
        success: true,
        message: 'Support ticket created successfully. We will contact you shortly.',
        data: {
          ticketId: ticket.ticket_number,
          status: ticket.status,
          priority: ticket.priority,
          expectedResponseTime: responseTimeMessage,
          createdAt: ticket.created_at,
          contactMethod: preferredContact,
          supportLevel: supportLevel
        }
      });

    } catch (error) {
      console.error('Create support ticket error:', error);

      // Provide user-friendly error messages
      let errorMessage = 'Failed to create support ticket. Please try again.';
      let statusCode = 500;

      if (error.message && error.message.includes('ticket number')) {
        errorMessage = 'Unable to generate ticket number. Please try again in a moment.';
      } else if (error.code === 11000) {
        errorMessage = 'A duplicate ticket was detected. Please try again.';
      } else if (error.name === 'ValidationError') {
        errorMessage = 'Please check all required fields and try again.';
        statusCode = 400;
      }

      res.status(statusCode).json({
        success: false,
        message: errorMessage,
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  })
);

// Helper function to determine response time
function getResponseTime(service, urgency) {
  const baseTimes = {
    'live-chat': '5 minutes',
    'remote-support': '8 minutes',
    'phone-support': '6 minutes'
  };

  const urgencyMultiplier = {
    'low': 1,
    'medium': 0.8,
    'high': 0.6,
    'critical': 0.3
  };

  return baseTimes[service] || '10 minutes';
}

// @route   GET /api/support/ticket/:id
// @desc    Get support ticket by ID
// @access  Private (Admin or ticket owner)
router.get('/ticket/:id',
  authMiddleware,
  validateUUID,
  asyncHandler(async (req, res) => {
    try {
      const ticket = await SupportTicketModel.getById(req.params.id);

      // Check if user can access this ticket
      if (req.user.role !== 'admin' && ticket.user_id !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      res.json({
        success: true,
        data: ticket
      });

    } catch (error) {
      console.error('Get support ticket error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get support ticket'
      });
    }
  })
);

// @route   GET /api/support/ticket/number/:ticketNumber
// @desc    Get support ticket by ticket number
// @access  Public (with email verification)
router.get('/ticket/number/:ticketNumber',
  asyncHandler(async (req, res) => {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required to access ticket'
      });
    }

    try {
      const ticket = await SupportTicketModel.getByTicketNumber(req.params.ticketNumber);

      // Verify email matches
      if (ticket.email !== email) {
        return res.status(403).json({
          success: false,
          message: 'Invalid email for this ticket'
        });
      }

      res.json({
        success: true,
        data: ticket
      });

    } catch (error) {
      console.error('Get ticket by number error:', error);
      if (error.code === 'PGRST116') {
        res.status(404).json({
          success: false,
          message: 'Ticket not found'
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Failed to get support ticket'
        });
      }
    }
  })
);

// @route   GET /api/support/tickets
// @desc    Get all support tickets (admin) or user's tickets
// @access  Private
router.get('/tickets',
  authMiddleware,
  validatePagination,
  asyncHandler(async (req, res) => {
    try {
      const {
        status,
        priority,
        category,
        assignedTo,
        page,
        limit,
        sortBy = 'created_at',
        sortOrder = 'desc',
        searchTerm
      } = req.query;

      let tickets;

      if (req.user.role === 'admin') {
        // Admin can see all tickets
        tickets = await SupportTicketModel.getAll({
          status,
          priority,
          category,
          assignedTo,
          page: parseInt(page) || 1,
          limit: parseInt(limit) || 20,
          sortBy,
          sortOrder,
          searchTerm
        });
      } else {
        // Users can only see their own tickets
        tickets = await SupportTicketModel.getUserTickets(req.user.id, {
          page: parseInt(page) || 1,
          limit: parseInt(limit) || 10,
          status
        });
      }

      res.json({
        success: true,
        data: tickets,
        pagination: {
          page: parseInt(page) || 1,
          limit: parseInt(limit) || (req.user.role === 'admin' ? 20 : 10),
          total: tickets.length
        }
      });

    } catch (error) {
      console.error('Get support tickets error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get support tickets'
      });
    }
  })
);

// @route   PATCH /api/support/ticket/:id/status
// @desc    Update support ticket status (admin only)
// @access  Private (Admin)
router.patch('/ticket/:id/status',
  authMiddleware,
  validateUUID,
  asyncHandler(async (req, res) => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const { status, adminNotes } = req.body;
    const validStatuses = ['open', 'in_progress', 'resolved', 'closed'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    try {
      const ticket = await SupportTicketModel.updateStatus(
        req.params.id,
        status,
        req.user.id,
        adminNotes
      );

      // TODO: Send status update email to user

      res.json({
        success: true,
        message: 'Ticket status updated successfully',
        data: ticket
      });

    } catch (error) {
      console.error('Update ticket status error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update ticket status'
      });
    }
  })
);

// @route   POST /api/support/ticket/:id/response
// @desc    Add response to support ticket
// @access  Private (Admin or ticket owner)
router.post('/ticket/:id/response',
  authMiddleware,
  validateUUID,
  asyncHandler(async (req, res) => {
    const { message, attachments = [] } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Response message is required'
      });
    }

    try {
      const ticket = await SupportTicketModel.getById(req.params.id);

      // Check if user can respond to this ticket
      const isAdmin = req.user.role === 'admin';
      const isOwner = ticket.user_id === req.user.id;

      if (!isAdmin && !isOwner) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      const response = await SupportTicketModel.addResponse(req.params.id, {
        message,
        isAdminResponse: isAdmin,
        adminId: isAdmin ? req.user.id : null,
        attachments
      });

      // TODO: Send notification email to the other party

      res.status(201).json({
        success: true,
        message: 'Response added successfully',
        data: response
      });

    } catch (error) {
      console.error('Add ticket response error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to add response'
      });
    }
  })
);

// @route   POST /api/support/ticket/:id/assign
// @desc    Assign ticket to admin
// @access  Private (Admin)
router.post('/ticket/:id/assign',
  authMiddleware,
  validateUUID,
  asyncHandler(async (req, res) => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const { adminId } = req.body;

    try {
      const ticket = await SupportTicketModel.assignToAdmin(req.params.id, adminId);

      res.json({
        success: true,
        message: 'Ticket assigned successfully',
        data: ticket
      });

    } catch (error) {
      console.error('Assign ticket error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to assign ticket'
      });
    }
  })
);

// @route   POST /api/support/ticket/:id/escalate
// @desc    Escalate support ticket
// @access  Private (Admin)
router.post('/ticket/:id/escalate',
  authMiddleware,
  validateUUID,
  asyncHandler(async (req, res) => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const { reason } = req.body;

    if (!reason || reason.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Escalation reason is required'
      });
    }

    try {
      const ticket = await SupportTicketModel.escalate(
        req.params.id,
        reason,
        req.user.id
      );

      // TODO: Send escalation notification

      res.json({
        success: true,
        message: 'Ticket escalated successfully',
        data: ticket
      });

    } catch (error) {
      console.error('Escalate ticket error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to escalate ticket'
      });
    }
  })
);

// @route   DELETE /api/support/ticket/:id
// @desc    Delete support ticket
// @access  Private (Admin)
router.delete('/ticket/:id',
  authMiddleware,
  validateUUID,
  asyncHandler(async (req, res) => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    try {
      await SupportTicketModel.delete(req.params.id);

      res.json({
        success: true,
        message: 'Support ticket deleted successfully'
      });

    } catch (error) {
      console.error('Delete support ticket error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete support ticket'
      });
    }
  })
);

// @route   GET /api/support/admin/stats
// @desc    Get support ticket statistics
// @access  Private (Admin)
router.get('/admin/stats',
  authMiddleware,
  asyncHandler(async (req, res) => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    try {
      const { startDate, endDate, adminId } = req.query;

      const stats = await SupportTicketModel.getStats({
        startDate,
        endDate,
        adminId
      });

      res.json({
        success: true,
        data: stats
      });

    } catch (error) {
      console.error('Get support stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get support statistics'
      });
    }
  })
);

// @route   GET /api/support/admin/attention
// @desc    Get tickets requiring attention
// @access  Private (Admin)
router.get('/admin/attention',
  authMiddleware,
  asyncHandler(async (req, res) => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    try {
      const tickets = await SupportTicketModel.getAttentionRequired();

      res.json({
        success: true,
        data: tickets
      });

    } catch (error) {
      console.error('Get attention required tickets error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get tickets requiring attention'
      });
    }
  })
);

// @route   GET /api/support/admin/assigned/:adminId
// @desc    Get tickets assigned to specific admin
// @access  Private (Admin)
router.get('/admin/assigned/:adminId',
  authMiddleware,
  asyncHandler(async (req, res) => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    try {
      const { status, priority, page = 1, limit = 20 } = req.query;

      const tickets = await SupportTicketModel.getAssignedTickets(req.params.adminId, {
        status,
        priority,
        page: parseInt(page),
        limit: parseInt(limit)
      });

      res.json({
        success: true,
        data: tickets,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: tickets.length
        }
      });

    } catch (error) {
      console.error('Get assigned tickets error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get assigned tickets'
      });
    }
  })
);

// @route   POST /api/support/request-technical-support
// @desc    Submit technical support request
// @access  Public
router.post('/request-technical-support',
  verifyRecaptcha,
  validateBotProtection,
  validateTechnicalSupportRequest,
  optionalAuthMiddleware,
  asyncHandler(async (req, res) => {
    const {
      name,
      email,
      phone,
      issueType,
      description,
      urgency = 'medium'
    } = req.body;

    try {
      const ticketData = {
        subject: `Technical Support Request - ${issueType}`,
        description: `Name: ${name}\nPhone: ${phone}\nIssue Type: ${issueType}\n\nDescription:\n${description}`,
        priority: urgency,
        category: 'technical-issue',
        userId: req.user?.id || null,
        email: req.user?.email || email,
        metadata: {
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          source: 'technical_support_form',
          issue_type: issueType,
          customer_phone: phone
        }
      };

      const ticket = await SupportTicketModel.create(ticketData);

      res.status(201).json({
        success: true,
        message: 'Technical support request submitted successfully. We will contact you shortly.',
        data: {
          id: ticket.id,
          ticketNumber: ticket.ticket_number,
          estimatedResponseTime: urgency === 'critical' ? '30 minutes' : urgency === 'high' ? '2 hours' : '24 hours'
        }
      });

    } catch (error) {
      console.error('Technical support request error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to submit technical support request'
      });
    }
  })
);

// Add this before "export default router;" in support.js

// @route   POST /api/support/service-request
// @desc    Submit service request from service pages
// @access  Public
router.post('/service-request',
  verifyRecaptcha,
  optionalAuthMiddleware,
  asyncHandler(async (req, res) => {
    const {
      name,
      phone,
      email,
      serviceName,
      servicePrice,
      serviceCategory
    } = req.body;

    // Basic validation
    if (!name || !phone || !serviceName) {
      return res.status(400).json({
        success: false,
        message: 'Required fields: name, phone, serviceName'
      });
    }

    // Phone validation (Kenya format)
    const phoneRegex = /^(\+254|254|0)?[17]\d{8}$/;
    if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid phone number'
      });
    }

    // Email validation (optional but if provided must be valid)
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address'
      });
    }

    try {
      const ticketData = {
        subject: `Service Request: ${serviceName}`,
        description: `Service Request Details:\n\nCustomer Name: ${name}\nPhone: ${phone}\nEmail: ${email || 'Not provided'}\n\nRequested Service: ${serviceName}\nService Category: ${serviceCategory}\nPrice: ${servicePrice}\n\nSubmitted via service page modal form.`,
        priority: 'medium',
        category: 'service-request',
        userId: req.user?.id || null,
        email: req.user?.email || email || null,
        metadata: {
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          source: 'service_page_modal',
          customerName: name,
          customerPhone: phone,
          customerEmail: email,
          serviceName: serviceName,
          serviceCategory: serviceCategory,
          servicePrice: servicePrice,
          submissionTimestamp: new Date().toISOString()
        }
      };

      const ticket = await SupportTicketModel.create(ticketData);

      // Send email notification to admin/support team
      try {
        const emailUtils = await import('../utils/email.js');
        await emailUtils.sendServiceRequestEmail({
          customerName: name,
          customerPhone: phone,
          customerEmail: email || 'Not provided',
          serviceName,
          serviceCategory,
          servicePrice,
          ticketNumber: ticket.ticket_number
        });
      } catch (emailError) {
        console.error('Failed to send service request email:', emailError);
        // Don't fail the request if email fails
      }

      res.status(201).json({
        success: true,
        message: 'Service request submitted successfully',
        data: {
          ticketNumber: ticket.ticket_number,
          message: 'We will contact you shortly to confirm your request'
        }
      });

    } catch (error) {
      console.error('Service request submission error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to submit service request. Please try again.'
      });
    }
  })
);

export default router;
