// client/src/pages/TaskDetail.js
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getTaskById } from '../services/taskService';
import { submitSolution } from '../services/submissionService';
import { findClientNonce } from '../utils/powClient';
import LoadingSpinner from '../components/LoadingSpinner';
import dayjs from 'dayjs';
import './TaskDetail.css'; // Specific styles for TaskDetail

const TaskDetail = () => {
  const { id } = useParams(); // Task ID from URL
  const navigate = useNavigate();
  const { user, loading: authLoading, isWorker, isAdmin } = useAuth();

  const [task, setTask] = useState(null);
  const [taskLoading, setTaskLoading] = useState(true);
  const [taskError, setTaskError] = useState(null);

  // Submission Form State
  const [solutionText, setSolutionText] = useState('');
  const [solutionFile, setSolutionFile] = useState(null);
  const [powNonce, setPowNonce] = useState('');
  const [powHash, setPowHash] = useState(''); // <-- State for hash is required
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState(null);
  const [submissionSuccess, setSubmissionSuccess] = useState(null);
  const [isPoWCalculating, setIsPoWCalculating] = useState(false);

  useEffect(() => {
    const fetchTask = async () => {
      if (authLoading || !user) {
        return;
      }
      setTaskLoading(true);
      setTaskError(null);
      try {
        const res = await getTaskById(id);
        setTask(res.data);
      } catch (err) {
        console.error('Failed to fetch task:', err);
        setTaskError('Failed to load task. It might not exist or you don\'t have access.');
      } finally {
        setTaskLoading(false);
      }
    };

    fetchTask();
  }, [id, authLoading, user]);

  const handleFileChange = (e) => {
    setSolutionFile(e.target.files[0]);
  };

  const calculatePoW = async () => {
    setIsPoWCalculating(true);
    setSubmissionError(null);
    try {
      // CORRECTED: Use the standardized data string (TaskID-UserID)
      const powInputData = `${id}-${user._id}`;
      const { nonce, hash } = findClientNonce(powInputData, '000'); // findClientNonce returns both

      if (nonce === -1) {
        setSubmissionError('Could not find Proof of Work within allowed attempts. Please try again.');
        setPowNonce('');
        setPowHash('');
      } else {
        setPowNonce(nonce.toString());
        setPowHash(hash); // <-- Set the hash
        setSubmissionSuccess('Proof of Work calculated! Now you can submit your solution.');
      }
    } catch (err) {
      console.error('PoW calculation error:', err);
      setSubmissionError('Error during Proof of Work calculation.');
    } finally {
      setIsPoWCalculating(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmissionError(null);
    setSubmissionSuccess(null);

    if (!solutionText && !solutionFile) {
      setSubmissionError('Please provide a solution (text or file).');
      setIsSubmitting(false);
      return;
    }

    // CORRECTED: Check for both nonce and hash
    if (!powNonce || !powHash) {
      setSubmissionError('Please calculate Proof of Work before submitting.');
      setIsSubmitting(false);
      return;
    }

    try {
      // CORRECTED: Pass the hash along with the nonce
      const submissionData = {
        solutionText,
        nonce: powNonce,
        hash: powHash,
      };
      
      await submitSolution(id, submissionData, solutionFile);

      setSubmissionSuccess('Solution submitted successfully! It is now pending review.');
      setSolutionText('');
      setSolutionFile(null);
      setPowNonce('');
      setPowHash(''); // <-- Reset the hash as well
    } catch (err)      {
      console.error('Submission failed:', err.response?.data?.msg || err.message);
      setSubmissionError(err.response?.data?.msg || 'Failed to submit solution. Please check your input and PoW.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || taskLoading) {
    return <LoadingSpinner />;
  }

  if (taskError) {
    return <div className="error-message">{taskError}</div>;
  }

  if (!task) {
    return <div className="error-message">Task not found.</div>;
  }

  const isDeadlinePassed = dayjs(task.deadline).isBefore(dayjs());

  return (
    <div className="task-detail-container">
      <h1>Task: {task.title}</h1>
      <p className="task-description">{task.description}</p>
      <div className="task-meta-detail">
        <p><strong>Difficulty:</strong> <span className={`difficulty-${task.difficulty}`}>{task.difficulty}</span></p>
        <p><strong>Reward:</strong> {task.rewardPoints} points</p>
        <p><strong>Deadline:</strong> {dayjs(task.deadline).format('MMM D, YYYY h:mm A')} {isDeadlinePassed && <span className="deadline-passed">(Passed)</span>}</p>
        <p><strong>Created by:</strong> {task.admin ? task.admin.username : 'Admin'}</p>
      </div>

      {isWorker && !isDeadlinePassed && (
        <div className="submission-section">
          <h2>Submit Your Solution</h2>
          {submissionError && <p className="error-message">{submissionError}</p>}
          {submissionSuccess && <p className="success-message">{submissionSuccess}</p>}
          <form onSubmit={handleSubmit} className="app-form">
            <div className="form-group">
              <label htmlFor="solutionText">Solution Text/Code</label>
              <textarea
                id="solutionText"
                value={solutionText}
                onChange={(e) => {
                    setSolutionText(e.target.value);
                    setPowNonce(''); setPowHash(''); // Reset PoW on solution change
                }}
                rows="8"
                placeholder="Enter your solution code or text here..."
                disabled={isSubmitting || isPoWCalculating}
              ></textarea>
            </div>
            <div className="form-group">
              <label htmlFor="solutionFile">Upload Solution File (optional)</label>
              <input
                type="file"
                id="solutionFile"
                onChange={(e) => {
                    handleFileChange(e);
                    setPowNonce(''); setPowHash(''); // Reset PoW on file change
                }}
                disabled={isSubmitting || isPoWCalculating}
              />
              {solutionFile && <p>File selected: {solutionFile.name}</p>}
            </div>

            <div className="pow-section">
              <h3>Proof of Work</h3>
              <p>Click "Calculate PoW" to generate the nonce and hash required for submission. This simulates a computational effort.</p>
              <button
                type="button"
                onClick={calculatePoW}
                className="btn btn-secondary"
                disabled={isPoWCalculating || isSubmitting || (!solutionText && !solutionFile)}
              >
                {isPoWCalculating ? 'Calculating...' : 'Calculate PoW'}
              </button>
              {powNonce && powHash && ( // <-- Display results only when both are present
                <div className="pow-results">
                  <p><strong>Nonce:</strong> {powNonce}</p>
                  <p><strong>Hash (starts with '000'):</strong> {powHash}</p>
                  <p className="success-message">PoW is ready!</p>
                </div>
              )}
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting || isPoWCalculating || (!solutionText && !solutionFile) || !powNonce || !powHash} // <-- Check for hash here too
            >
              {isSubmitting ? 'Submitting...' : 'Submit Solution'}
            </button>
          </form>
        </div>
      )}

      {isWorker && isDeadlinePassed && (
          <div className="deadline-message">
              <p>The deadline for this task has passed. You can no longer submit a solution.</p>
          </div>
      )}

      {isAdmin && (
        <div className="admin-task-actions">
          <h2>Admin Actions</h2>
          <Link to={`/admin/tasks/${id}/submissions`} className="btn btn-info">
            Review Submissions for this Task
          </Link>
        </div>
      )}

      <button onClick={() => navigate(-1)} className="btn btn-secondary back-btn">
        Back
      </button>
    </div>
  );
};

export default TaskDetail;