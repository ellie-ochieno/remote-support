import express from 'express';
import WorkingHoursModel from '../models/WorkingHours.cjs';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

// @route   GET /api/working-hours
// @desc    Get current working hours
// @access  Public
router.get('/',
  asyncHandler(async (req, res) => {
    try {
      const workingHours = await WorkingHoursModel.getCurrent();

      res.json({
        success: true,
        data: workingHours
      });

    } catch (error) {
      console.error('Get working hours error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get working hours'
      });
    }
  })
);

// @route   GET /api/working-hours/formatted
// @desc    Get formatted working hours for display
// @access  Public
router.get('/formatted',
  asyncHandler(async (req, res) => {
    try {
      const formattedSchedule = await WorkingHoursModel.getFormattedSchedule();

      res.json({
        success: true,
        data: formattedSchedule
      });

    } catch (error) {
      console.error('Get formatted working hours error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get formatted working hours'
      });
    }
  })
);

// @route   GET /api/working-hours/status
// @desc    Check if currently open
// @access  Public
router.get('/status',
  asyncHandler(async (req, res) => {
    try {
      const status = await WorkingHoursModel.isCurrentlyOpen();

      res.json({
        success: true,
        data: status
      });

    } catch (error) {
      console.error('Get business status error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get business status'
      });
    }
  })
);

// @route   PUT /api/working-hours
// @desc    Update working hours
// @access  Private (Admin)
router.put('/',
  authMiddleware,
  adminMiddleware,
  asyncHandler(async (req, res) => {
    try {
      const workingHoursData = req.body;

      // Validate the structure
      if (!workingHoursData.schedule) {
        return res.status(400).json({
          success: false,
          message: 'Schedule is required'
        });
      }

      const updatedHours = await WorkingHoursModel.update(
        workingHoursData,
        req.user.id
      );

      res.json({
        success: true,
        message: 'Working hours updated successfully',
        data: updatedHours
      });

    } catch (error) {
      console.error('Update working hours error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update working hours'
      });
    }
  })
);

// @route   POST /api/working-hours/holiday
// @desc    Add holiday
// @access  Private (Admin)
router.post('/holiday',
  authMiddleware,
  adminMiddleware,
  asyncHandler(async (req, res) => {
    const { date, name, description } = req.body;

    if (!date || !name) {
      return res.status(400).json({
        success: false,
        message: 'Date and name are required'
      });
    }

    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format. Use YYYY-MM-DD'
      });
    }

    try {
      const holidayData = {
        date,
        name,
        description: description || null
      };

      const updatedHours = await WorkingHoursModel.addHoliday(
        holidayData,
        req.user.id
      );

      res.json({
        success: true,
        message: 'Holiday added successfully',
        data: updatedHours
      });

    } catch (error) {
      console.error('Add holiday error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to add holiday'
      });
    }
  })
);

// @route   POST /api/working-hours/special
// @desc    Add special hours for a specific date
// @access  Private (Admin)
router.post('/special',
  authMiddleware,
  adminMiddleware,
  asyncHandler(async (req, res) => {
    const { date, openTime, closeTime, reason } = req.body;

    if (!date || !openTime || !closeTime) {
      return res.status(400).json({
        success: false,
        message: 'Date, open time, and close time are required'
      });
    }

    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format. Use YYYY-MM-DD'
      });
    }

    // Validate time format
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(openTime) || !timeRegex.test(closeTime)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid time format. Use HH:MM'
      });
    }

    try {
      const specialHourData = {
        date,
        openTime,
        closeTime,
        reason: reason || 'Special hours'
      };

      const updatedHours = await WorkingHoursModel.addSpecialHours(
        specialHourData,
        req.user.id
      );

      res.json({
        success: true,
        message: 'Special hours added successfully',
        data: updatedHours
      });

    } catch (error) {
      console.error('Add special hours error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to add special hours'
      });
    }
  })
);

// @route   GET /api/working-hours/availability/:date
// @desc    Get available time slots for a specific date
// @access  Public
router.get('/availability/:date',
  asyncHandler(async (req, res) => {
    const { date } = req.params;
    const { duration = 60 } = req.query;

    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format. Use YYYY-MM-DD'
      });
    }

    // Check if date is in the past
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      return res.status(400).json({
        success: false,
        message: 'Cannot check availability for past dates'
      });
    }

    try {
      const slots = await WorkingHoursModel.getAvailableTimeSlots(
        date,
        parseInt(duration)
      );

      res.json({
        success: true,
        data: {
          date,
          availableSlots: slots,
          totalSlots: slots.length,
          duration: parseInt(duration)
        }
      });

    } catch (error) {
      console.error('Get availability error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get availability'
      });
    }
  })
);

// @route   GET /api/working-hours/admin/history
// @desc    Get working hours change history
// @access  Private (Admin)
router.get('/admin/history',
  authMiddleware,
  adminMiddleware,
  asyncHandler(async (req, res) => {
    try {
      const { limit = 10 } = req.query;

      const history = await WorkingHoursModel.getHistory(parseInt(limit));

      res.json({
        success: true,
        data: history
      });

    } catch (error) {
      console.error('Get working hours history error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get working hours history'
      });
    }
  })
);

// @route   GET /api/working-hours/next-available
// @desc    Get next available appointment time
// @access  Public
router.get('/next-available',
  asyncHandler(async (req, res) => {
    try {
      const workingHours = await WorkingHoursModel.getCurrent();
      const currentTime = new Date();

      // Convert to business timezone
      const businessTime = new Date(currentTime.toLocaleString("en-US", {
        timeZone: workingHours.timezone || 'Africa/Nairobi'
      }));

      const nextOpenTime = WorkingHoursModel.getNextOpenTime(workingHours, businessTime);

      res.json({
        success: true,
        data: {
          nextAvailable: nextOpenTime,
          currentTime: businessTime.toISOString(),
          timezone: workingHours.timezone || 'Africa/Nairobi'
        }
      });

    } catch (error) {
      console.error('Get next available time error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get next available time'
      });
    }
  })
);

// @route   POST /api/working-hours/emergency-override
// @desc    Create emergency availability override
// @access  Private (Admin)
router.post('/emergency-override',
  authMiddleware,
  adminMiddleware,
  asyncHandler(async (req, res) => {
    const {
      startTime,
      endTime,
      reason = 'Emergency availability',
      contactInfo
    } = req.body;

    if (!startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: 'Start time and end time are required'
      });
    }

    try {
      // TODO: Implement emergency override logic
      // This would temporarily override normal working hours

      const override = {
        id: crypto.randomUUID(),
        startTime,
        endTime,
        reason,
        contactInfo,
        createdBy: req.user.id,
        createdAt: new Date().toISOString(),
        active: true
      };

      res.json({
        success: true,
        message: 'Emergency availability override created',
        data: override
      });

    } catch (error) {
      console.error('Create emergency override error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create emergency override'
      });
    }
  })
);

// @route   GET /api/working-hours/timezone-info
// @desc    Get timezone information
// @access  Public
router.get('/timezone-info',
  asyncHandler(async (req, res) => {
    try {
      const workingHours = await WorkingHoursModel.getCurrent();
      const timezone = workingHours.timezone || 'Africa/Nairobi';

      const now = new Date();
      const businessTime = new Date(now.toLocaleString("en-US", {
        timeZone: timezone
      }));

      const timezoneInfo = {
        timezone,
        currentTime: businessTime.toISOString(),
        utcOffset: businessTime.getTimezoneOffset(),
        displayName: 'East Africa Time (EAT)',
        abbreviation: 'EAT'
      };

      res.json({
        success: true,
        data: timezoneInfo
      });

    } catch (error) {
      console.error('Get timezone info error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get timezone information'
      });
    }
  })
);

export default router;
