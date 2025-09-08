// server/routes/taskRoutes.js
const express = require('express');
const { check } = require('express-validator');
const taskController = require('../controllers/taskController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// @route   POST api/tasks
// @desc    Create a new task
// @access  Private (Admin only)
router.post(
  '/',
  [
    protect,
    authorize('admin'),
    [
      check('title', 'Title is required').not().isEmpty(),
      check('description', 'Description is required').not().isEmpty(),
      check('difficulty', 'Difficulty is required').isIn(['easy', 'medium', 'hard']),
      check('rewardPoints', 'Reward points must be a positive number').isInt({ min: 1 }),
      check('deadline', 'Deadline is required and must be a future date').isISO8601().toDate().custom((value, { req }) => {
        if (new Date(value) < new Date()) {
          throw new Error('Deadline must be in the future');
        }
        return true;
      }),
    ],
  ],
  taskController.createTask
);

// @route   GET api/tasks
// @desc    Get all tasks
// @access  Private (All authenticated users)
router.get('/', protect, taskController.getAllTasks);

// @route   GET api/tasks/:id
// @desc    Get task by ID
// @access  Private
router.get('/:id', protect, taskController.getTaskById);

// @route   DELETE api/tasks/:id
// @desc    Delete a task
// @access  Private (Admin only)
router.delete('/:id', protect, authorize('admin'), taskController.deleteTask);

module.exports = router;// Task routes will go here
