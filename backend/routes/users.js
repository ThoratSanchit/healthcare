const express = require('express');
const { query } = require('express-validator');
const {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
} = require('../controllers/users');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes are protected and admin only
router.use(protect);
router.use(authorize('admin'));
// List users with optional filters
router.get('/', [
  query('role').optional().isIn(['patient', 'doctor', 'admin', 'all']),
  query('status').optional().isIn(['active', 'inactive', 'all']),
  query('search').optional().isString(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
], getUsers);
router.route('/')
  .get(getUsers);

router.route('/:id')
  .get(getUser)
  .put(updateUser)
  .delete(deleteUser);

module.exports = router;
