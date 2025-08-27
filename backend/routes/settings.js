const express = require('express');
const { getSettings, updateSettings } = require('../controllers/settings');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router.get('/', getSettings);
router.put('/', updateSettings);

module.exports = router;


