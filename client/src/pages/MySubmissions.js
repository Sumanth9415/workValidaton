// client/src/pages/MySubmissions.js
import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getMySubmissions } from '../services/submissionService';
import LoadingSpinner from '../components/LoadingSpinner';
import dayjs from 'dayjs';
import './MySubmissions.css'; // Specific styling

const MySubmissions = () => {
  const { user, loading: authLoading } = useAuth();
  const [submissions, setSubmissions] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSubmissions = async () => {
      if (authLoading || !user) {
        return;
      }
      setDataLoading(true);
      setError(null);
      try {
        const res = await getMySubmissions();
        setSubmissions(res.data);
      } catch (err) {
        console.error('Failed to fetch my submissions:', err);
        setError('Failed to load your submissions. Please try again.');
      } finally {
        setDataLoading(false);
      }
    };

    fetchSubmissions();
  }, [authLoading, user]);

  if (authLoading || dataLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!user || user.role !== 'worker') {
    return <div className="error-message">Access Denied. You are not authorized to view this page.</div>;
  }

  return (
    <div className="my-submissions-container">
      <h1>My Submissions</h1>
      <p>Here are all the solutions you've submitted:</p>

      {submissions.length === 0 ? (
        <p>You haven't submitted any solutions yet. <a href="/dashboard">Find a task!</a></p>
      ) : (
        <div className="submission-list">
          {submissions.map((submission) => (
            <div key={submission._id} className="submission-card">
              <h3>Task: {submission.task.title}</h3>
              <p><strong>Submitted At:</strong> {dayjs(submission.submittedAt).format('MMM D, YYYY h:mm A')}</p>
              <p><strong>Status:</strong> <span className={`submission-status status-${submission.status}`}>{submission.status}</span></p>
              <p><strong>Reward for Task:</strong> {submission.task.rewardPoints} points</p>
              <div className="submission-content">
                  <h4>Your Solution:</h4>
                  {submission.solutionText && <pre>{submission.solutionText}</pre>}
                  {submission.solutionFile && (
                      <p>File submitted: <a href={`${process.env.REACT_APP_API_BASE_URL}${submission.solutionFile}`} target="_blank" rel="noopener noreferrer">Download File</a></p>
                  )}
              </div>
              <p className="pow-info"><strong>PoW Nonce:</strong> {submission.nonce} | <strong>Hash:</strong> {submission.hash.substring(0, 10)}...</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MySubmissions;