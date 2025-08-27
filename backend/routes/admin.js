const express = require('express');
const {
  getDashboardStats,
  getSystemAnalytics,
  createDoctor,
  createPatient,
} = require('../controllers/admin');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes are protected and admin only
router.use(protect);
router.use(authorize('admin'));

router.get('/dashboard', getDashboardStats);
router.get('/analytics', getSystemAnalytics);
router.post('/doctors', createDoctor);
router.post('/patients', createPatient);

module.exports = router;
