const express = require('express');
const { body, query } = require('express-validator');
const {
  getAppointments,
  getAppointment,
  createAppointment,
  updateAppointment,
  cancelAppointment,
  getAvailableSlots,
  rateAppointment,
} = require('../controllers/appointments');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const createAppointmentValidation = [
  body('doctor')
    .isMongoId()
    .withMessage('Please provide a valid doctor ID'),
  body('appointmentDate')
    .isISO8601()
    .withMessage('Please provide a valid appointment date'),
  body('timeSlot.startTime')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Please provide a valid start time (HH:MM format)'),
  body('timeSlot.endTime')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Please provide a valid end time (HH:MM format)'),
  body('reason')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Reason must be between 10 and 500 characters'),
  body('type')
    .optional()
    .isIn(['consultation', 'follow-up', 'emergency', 'routine-checkup'])
    .withMessage('Invalid appointment type'),
];

const updateAppointmentValidation = [
  body('status')
    .optional()
    .isIn(['scheduled', 'confirmed', 'completed', 'cancelled', 'no-show'])
    .withMessage('Invalid status'),
  body('notes.doctor')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Doctor notes cannot exceed 1000 characters'),
  body('diagnosis')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Diagnosis cannot exceed 500 characters'),
];

const rateAppointmentValidation = [
  body('score')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating score must be between 1 and 5'),
  body('review')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Review cannot exceed 500 characters'),
];

// All routes are protected
router.use(protect);

// Routes
router.route('/')
  .get(getAppointments)
  .post(authorize('patient'), createAppointmentValidation, createAppointment);

router.route('/:id')
  .get(getAppointment)
  .put(updateAppointmentValidation, updateAppointment);

router.put('/:id/cancel', cancelAppointment);
router.put('/:id/rate', authorize('patient'), rateAppointmentValidation, rateAppointment);

// Get available slots for a doctor
router.get('/slots/available', protect, [
  query('doctor').isMongoId().withMessage('Please provide a valid doctor ID'),
  query('date').isISO8601().withMessage('Please provide a valid date'),
], getAvailableSlots);

module.exports = router;
