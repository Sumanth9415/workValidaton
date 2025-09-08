// client/src/pages/AdminSubmissionReview.js
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getSubmissionsForTask, updateSubmissionStatus } from '../services/submissionService';
import { getTaskById } from '../services/taskService';
import { verifyProofOfWork } from '../utils/powClient'; // Use client-side PoW verification for display
import LoadingSpinner from '../components/LoadingSpinner';
import dayjs from 'dayjs';
import './AdminSubmissionReview.css'; // Specific styles

const AdminSubmissionReview = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading, isAdmin } = useAuth();
  const [task, setTask] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (authLoading || !user || !isAdmin) {
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const [taskRes, submissionsRes] = await Promise.all([
          getTaskById(taskId),
          getSubmissionsForTask(taskId),
        ]);
        setTask(taskRes.data);
        setSubmissions(submissionsRes.data);
      } catch (err) {
        console.error('Failed to fetch data:', err);
        setError('Failed to load task or submissions. You might not have access or they don\'t exist.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [taskId, authLoading, user, isAdmin]);

  const handleStatusUpdate = async (submissionId, status) => {
    try {
      await updateSubmissionStatus(submissionId, status);
      // Update local state to reflect the change
      setSubmissions(
        submissions.map((sub) =>
          sub._id === submissionId ? { ...sub, status } : sub
        )
      );
      // Optionally show a success message
    } catch (err) {
      console.error('Failed to update submission status:', err);
      setError('Failed to update submission status.');
    }
  };

  const verifyPoWOnClient = (submission) => {
      // Reconstruct powInputData as it would have been on submission
      // This must exactly match the backend's logic in submissionController.js
      const powData = `${submission.task._id}-${submission.worker._id}-${submission.solutionText || (submission.solutionFile ? 'file_placeholder' : '')}`; // 'file_placeholder' as we don't have filename easily on client for this logic
      return verifyProofOfWork(powData, submission.nonce, submission.hash, '000');
  }


  if (authLoading || loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!user || !isAdmin) {
    return <div className="error-message">Access Denied. You are not authorized to view this page.</div>;
  }

  return (
    <div className="admin-submission-review-container">
      <h1>Review Submissions for: {task?.title}</h1>
      <p className="task-description">{task?.description}</p>
      <p className="task-info">Reward: {task?.rewardPoints} points | Deadline: {dayjs(task?.deadline).format('MMM D, YYYY h:mm A')}</p>

      {submissions.length === 0 ? (
        <p>No submissions yet for this task.</p>
      ) : (
        <div className="submission-list">
          {submissions.map((submission) => (
            <div key={submission._id} className="submission-card">
              <h3>Submitted by: {submission.worker.username} ({submission.worker.email})</h3>
              <p><strong>Status:</strong> <span className={`submission-status status-${submission.status}`}>{submission.status}</span></p>
              <p><strong>Submitted At:</strong> {dayjs(submission.submittedAt).format('MMM D, YYYY h:mm A')}</p>
              <div className="submission-content">
                  <h4>Solution:</h4>
                  {submission.solutionText && <pre>{submission.solutionText}</pre>}
                  {submission.solutionFile && (
                      <p>File submitted: <a href={`${process.env.REACT_APP_API_BASE_URL}${submission.solutionFile}`} target="_blank" rel="noopener noreferrer">Download File</a></p>
                  )}
              </div>
              <div className="pow-details">
                <h4>Proof of Work:</h4>
                <p><strong>Nonce:</strong> {submission.nonce}</p>
                {/* <p><strong>Hash:</strong> {submission.hash}</p> */}
                <p>
                    <strong>PoW Valid:</strong>{' '}
                    <span className={verifyPoWOnClient(submission) ? 'text-success' : 'text-danger'}>
                        {verifyPoWOnClient(submission) ? 'Yes' : 'No (Potential Tampering!)'}
                    </span>
                </p>
              </div>

              {submission.status === 'pending' && (
                <div className="submission-actions">
                  <button
                    onClick={() => handleStatusUpdate(submission._id, 'accepted')}
                    className="btn btn-success btn-small"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(submission._id, 'rejected')}
                    className="btn btn-danger btn-small"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      <button onClick={() => navigate('/admin-dashboard')} className="btn btn-secondary back-btn">
        Back to Admin Dashboard
      </button>
    </div>
  );
};

export default AdminSubmissionReview;