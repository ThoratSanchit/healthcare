const express = require('express');
const {
  getPatientProfile,
  updateMedicalHistory,
  getPatientStats,
} = require('../controllers/patients');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.use(protect);

// Patient routes
router.get('/profile', authorize('patient'), getPatientProfile);
router.put('/medical-history', authorize('patient'), updateMedicalHistory);
router.get('/stats/dashboard', authorize('patient'), getPatientStats);

module.exports = router;
