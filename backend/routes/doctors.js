const express = require('express');
const { query } = require('express-validator');
const {
  getDoctors,
  getDoctor,
  updateAvailability,
  getDoctorStats,
} = require('../controllers/doctors');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', [
  query('specialization').optional().isString(),
  query('city').optional().isString(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 }),
], getDoctors);

router.get('/:id', getDoctor);

// Protected routes
router.use(protect);

router.put('/availability', authorize('doctor'), updateAvailability);
router.get('/stats/dashboard', authorize('doctor'), getDoctorStats);

module.exports = router;
