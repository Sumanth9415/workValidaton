// server/models/Submission.js
const mongoose = require('mongoose');

const SubmissionSchema = new mongoose.Schema({
  task: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    required: true,
  },
  worker: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  solutionText: {
    type: String, // For text/code solutions
    required: function() { return !this.solutionFile; } // Required if no file
  },
  solutionFile: {
    type: String, // Path to uploaded file
    required: function() { return !this.solutionText; } // Required if no text
  },
  nonce: {
    type: String,
    required: true,
  },
  hash: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending',
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Submission', SubmissionSchema);
