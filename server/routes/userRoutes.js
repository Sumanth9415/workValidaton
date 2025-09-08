// server/routes/userRoutes.js
const express = require('express');
const userController = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { check } = require('express-validator');

const router = express.Router();

// @route   GET api/users/leaderboard
// @desc    Get top users by points
// @access  Private (All authenticated users)
router.get('/leaderboard', protect, userController.getLeaderboard);

// @route   GET api/users/:id
// @desc    Get user profile by ID
// @access  Private (Admin can get any, worker can get self)
router.get('/:id', protect, userController.getUserProfile);

// @route   PUT api/users/redeem
// @desc    Simulate points redemption for logged-in worker
// @access  Private (Worker only)
router.put(
  '/redeem',
  [
    protect,
    authorize('worker'),
    [
      check('pointsToRedeem', 'Points to redeem must be a positive number').isInt({ min: 1 }),
    ],
  ],
  userController.redeemPoints
);

module.exports = router;// User routes will go here
