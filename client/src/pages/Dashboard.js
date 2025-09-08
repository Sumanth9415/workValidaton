// client/src/pages/Dashboard.js
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getAllTasks } from '../services/taskService';
import dayjs from 'dayjs';
import LoadingSpinner from '../components/LoadingSpinner';
import './Dashboard.css'; // Add a CSS file for dashboards

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTasks = async () => {
      if (authLoading || !user) {
        return; // Wait for auth to load or ensure user is present
      }

      setDataLoading(true);
      setError(null);
      try {
        const res = await getAllTasks();
        // Filter out tasks that have passed their deadline
        const activeTasks = res.data.filter(task => dayjs(task.deadline).isAfter(dayjs()));
        setTasks(activeTasks);
      } catch (err) {
        console.error('Failed to fetch tasks:', err);
        setError('Failed to load tasks. Please try again.');
      } finally {
        setDataLoading(false);
      }
    };

    fetchTasks();
  }, [authLoading, user]); // Refetch if auth state changes

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
    <div className="dashboard-container">
      <h1>Worker Dashboard</h1>
      <p className="welcome-message">Welcome, {user.username}! You have {user.points} points.</p>

      <h2 className="section-title">Available Tasks</h2>
      {tasks.length === 0 ? (
        <p>No active tasks available at the moment. Check back later!</p>
      ) : (
        <div className="task-list">
          {tasks.map((task) => (
            <div key={task._id} className="task-card">
              <h3>{task.title}</h3>
              <p>{task.description.substring(0, 100)}...</p>
              <div className="task-meta">
                <span>Difficulty: <span className={`difficulty-${task.difficulty}`}>{task.difficulty}</span></span>
                <span>Reward: {task.rewardPoints} points</span>
                <span>Deadline: {dayjs(task.deadline).format('MMM D, YYYY h:mm A')}</span>
              </div>
              <Link to={`/tasks/${task._id}`} className="btn btn-primary btn-small">
                View & Submit
              </Link>
            </div>
          ))}
        </div>
      )}

      <h2 className="section-title">Quick Links</h2>
      <div className="quick-links">
        <Link to="/my-submissions" className="btn btn-secondary">My Submissions</Link>
        <Link to={`/profile/${user._id}`} className="btn btn-secondary">My Profile</Link>
        <Link to="/leaderboard" className="btn btn-secondary">Leaderboard</Link>
      </div>
    </div>
  );
};

export default Dashboard;