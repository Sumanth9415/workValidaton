// server/routes/submissionRoutes.js
const express = require('express');
const { check } = require('express-validator');
const submissionController = require('../controllers/submissionController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Middleware for file upload (specific to this route)
// We access the multer middleware from the submitSolution array.
// submitSolution is defined as an array in the controller: [upload.single('solutionFile'), async (req, res) => {...}]
const upload = submissionController.submitSolution[0];

// @route   POST api/submissions/:taskId
// @desc    Submit a solution for a task
// @access  Private (Worker only)
router.post(
  '/:taskId',
  [
    protect, // Ensure user is authenticated
    authorize('worker'), // Ensure user has 'worker' role
    upload, // Handle file upload (if any)
    [
      // Validation for submission content
      check('solutionText').custom((value, { req }) => {
        if (!value && !req.file) { // Either solutionText or a file must be present
          throw new Error('Solution text or a file upload is required');
        }
        return true;
      }),
      check('nonce', 'Nonce is required').not().isEmpty(),
      check('hash', 'Hash is required').not().isEmpty(),
    ],
  ],
  submissionController.submitSolution[1] // The actual controller function
);


// @route   GET api/submissions/task/:taskId
// @desc    Get all submissions for a specific task
// @access  Private (Admin only)
router.get('/task/:taskId', protect, authorize('admin'), submissionController.getSubmissionsForTask);

// @route   GET api/submissions/worker/:workerId
// @desc    Get all submissions by a specific worker
// @access  Private (Admin can see all, worker can see their own)
router.get('/worker/:workerId', protect, submissionController.getSubmissionsByWorker);

// @route   GET api/submissions/me
// @desc    Get logged in worker's own submissions
// @access  Private (Worker only)
router.get('/me', protect, authorize('worker'), submissionController.getMySubmissions);


// @route   PUT api/submissions/:submissionId/status
// @desc    Update submission status (Accept/Reject) and reward worker
// @access  Private (Admin only)
router.put(
  '/:submissionId/status', // Corrected endpoint path
  [
    protect, // Ensure user is authenticated
    authorize('admin'), // Ensure user has 'admin' role
    [
      // Validate that 'status' is either 'accepted' or 'rejected'
      check('status', 'Status must be either "accepted" or "rejected"').isIn(['accepted', 'rejected']),
    ],
  ],
  submissionController.updateSubmissionStatus
);

module.exports = router;