// server/controllers/taskController.js
const Task = require('../models/Task');
const { validationResult } = require('express-validator');

// @route   POST api/tasks
// @desc    Create a new task
// @access  Private (Admin only)
exports.createTask = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { title, description, difficulty, rewardPoints, deadline } = req.body;

  try {
    const newTask = new Task({
      title,
      description,
      difficulty,
      rewardPoints,
      deadline,
      admin: req.user.id, // ID from authenticated user
    });

    const task = await newTask.save();
    res.json(task);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @route   GET api/tasks
// @desc    Get all tasks
// @access  Private
exports.getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @route   GET api/tasks/:id
// @desc    Get task by ID
// @access  Private
exports.getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ msg: 'Task not found' });
    }

    res.json(task);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Task not found' });
    }
    res.status(500).send('Server error');
  }
};

// @route   DELETE api/tasks/:id
// @desc    Delete a task
// @access  Private (Admin only)
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ msg: 'Task not found' });
    }

    // Check if user owns the task (optional, or just check role)
    if (task.admin.toString() !== req.user.id) {
        return res.status(401).json({ msg: 'User not authorized' });
    }

    await Task.deleteOne({ _id: req.params.id });

    res.json({ msg: 'Task removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Task not found' });
    }
    res.status(500).send('Server error');
  }
};// Task controller logic will go here
