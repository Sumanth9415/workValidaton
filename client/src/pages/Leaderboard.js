// client/src/pages/Leaderboard.js
import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getLeaderboard } from '../services/userService';
import LoadingSpinner from '../components/LoadingSpinner';
import './Leaderboard.css'; // This will now apply our beautiful styles

const Leaderboard = () => {
  const { loading: authLoading } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      if (authLoading) return; // Wait for auth to load

      setDataLoading(true);
      setError(null);
      try {
        const res = await getLeaderboard();
        setLeaderboard(res.data);
      } catch (err) {
        console.error('Failed to fetch leaderboard:', err);
        setError('Failed to load leaderboard. Please try again.');
      } finally {
        setDataLoading(false);
      }
    };

    fetchLeaderboard();
  }, [authLoading]);

  if (authLoading || dataLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="leaderboard-container">
      <h1>Leaderboard</h1>
      <p>Top earners in the system!</p>

      {leaderboard.length === 0 ? (
        <p>No users on the leaderboard yet. Be the first to earn points!</p>
      ) : (
        // UPDATED: Added a wrapper for responsiveness and classNames for styling
        <div className="table-wrapper">
          <table className="leaderboard-table">
            <thead>
              <tr>
                <th className="rank-header">Rank</th>
                <th className="username-header">Username</th>
                <th className="role-header">Role</th>
                <th className="points-header">Points</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((user, index) => (
                <tr key={user._id}>
                  <td className="rank-cell">{index + 1}</td>
                  <td className="username-cell">{user.username}</td>
                  <td className="role-cell">{user.role}</td>
                  <td className="points-cell">{user.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;

