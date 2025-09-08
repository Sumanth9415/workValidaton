// server/controllers/submissionController.js
const Submission = require('../models/Submission');
const Task = require('../models/Task');
const User = require('../models/User');
const { verifyProofOfWork } = require('../utils/powUtils');
const { validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${req.user.id}-${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage: storage });

// @route   POST api/submissions/:taskId
// @desc    Submit a solution for a task
// @access  Private (Worker only)
exports.submitSolution = [
  upload.single('solutionFile'), // Use multer for file upload
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const taskId = req.params.taskId;
    const workerId = req.user.id;
    const { solutionText, nonce, hash } = req.body; // solutionText can be empty if file is uploaded

    let solutionPath = req.file ? `/uploads/${req.file.filename}` : null;

    try {
      const task = await Task.findById(taskId);
      if (!task) {
        return res.status(404).json({ msg: 'Task not found' });
      }

      // 1. Check deadline validity
      if (new Date() > task.deadline) {
        return res.status(400).json({ msg: 'Task deadline has passed' });
      }

      // 2. Proof-of-work nonce + hash validity
      // The data to hash should ideally include task details + worker ID + solution
      // For simplicity, let's use a combination of taskId and workerId for now
      const powData = `${taskId}-${workerId}`;
      if (!verifyProofOfWork(powData, nonce, hash, '000')) {
        return res.status(400).json({ msg: 'Invalid Proof of Work (nonce or hash is incorrect)' });
      }

      // 3. Whether the solution was already submitted by this worker for this task
      const existingSubmission = await Submission.findOne({
        task: taskId,
        worker: workerId,
        status: { $in: ['pending', 'accepted'] },
      });

      if (existingSubmission) {
        return res.status(400).json({ msg: 'You have already submitted a solution for this task.' });
      }

      const newSubmission = new Submission({
        task: taskId,
        worker: workerId,
        solutionText: solutionText,
        solutionFile: solutionPath,
        nonce,
        hash,
        status: 'pending', // Awaiting admin review (or directly accepted if fully automated)
      });

      await newSubmission.save();
      res.json(newSubmission);

    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  },
];


// @route   GET api/submissions/task/:taskId
// @desc    Get all submissions for a specific task (Admin only)
// @access  Private (Admin only)
exports.getSubmissionsForTask = async (req, res) => {
  try {
    const submissions = await Submission.find({ task: req.params.taskId })
      .populate('worker', ['username', 'email'])
      .sort({ submittedAt: -1 });
    res.json(submissions);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @route   GET api/submissions/worker/:workerId
// @desc    Get all submissions by a specific worker
// @access  Private (Admin can see all, worker can see their own)
exports.getSubmissionsByWorker = async (req, res) => {
  try {
    const workerId = req.params.workerId;

    // A worker can only see their own submissions unless they are admin
    if (req.user.role === 'worker' && req.user.id !== workerId) {
      return res.status(403).json({ msg: 'Not authorized to view other worker\'s submissions' });
    }

    const submissions = await Submission.find({ worker: workerId })
      .populate('task', ['title', 'rewardPoints'])
      .sort({ submittedAt: -1 });
    res.json(submissions);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};


// @route   PUT api/submissions/:submissionId/status
// @desc    Update submission status (Accept/Reject) and reward worker
// @access  Private (Admin only)
exports.updateSubmissionStatus = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { status } = req.body; // 'accepted' or 'rejected'

  try {
    const submission = await Submission.findById(req.params.submissionId).populate('task');
    if (!submission) {
      return res.status(404).json({ msg: 'Submission not found' });
    }

    if (submission.status !== 'pending') {
      return res.status(400).json({ msg: 'Submission already processed' });
    }

    submission.status = status;
    await submission.save();

    if (status === 'accepted') {
      const worker = await User.findById(submission.worker);
      if (worker) {
        worker.points += submission.task.rewardPoints;
        await worker.save();
      }
    }

    res.json(submission);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @route   GET api/submissions/me
// @desc    Get logged in worker's own submissions
// @access  Private (Worker only)
exports.getMySubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find({ worker: req.user.id })
      .populate('task', ['title', 'rewardPoints', 'deadline'])
      .sort({ submittedAt: -1 });
    res.json(submissions);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};// Submission controller logic will go here
