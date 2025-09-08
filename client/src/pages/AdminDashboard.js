// client/src/pages/AdminDashboard.js
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getAllTasks, deleteTask } from '../services/taskService';
import dayjs from 'dayjs';
import LoadingSpinner from '../components/LoadingSpinner';
import './Dashboard.css'; // Reusing dashboard styles

const AdminDashboard = () => {
  const { user, loading: authLoading, isAdmin } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(null); // Task ID to confirm deletion

  useEffect(() => {
    const fetchTasks = async () => {
      if (authLoading || !user) {
        return;
      }
      setDataLoading(true);
      setError(null);
      try {
        const res = await getAllTasks();
        setTasks(res.data);
      } catch (err) {
        console.error('Failed to fetch tasks:', err);
        setError('Failed to load tasks. Please try again.');
      } finally {
        setDataLoading(false);
      }
    };

    fetchTasks();
  }, [authLoading, user]);

  const handleDelete = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task? All associated submissions will also be orphaned (though not deleted by this action).')) {
      try {
        await deleteTask(taskId);
        setTasks(tasks.filter(task => task._id !== taskId));
        setShowConfirmation(null); // Hide confirmation after deletion
      } catch (err) {
        console.error('Failed to delete task:', err);
        setError('Failed to delete task. You might not have permission or there was a server error.');
      }
    }
  };

  if (authLoading || dataLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!user || !isAdmin) {
    return <div className="error-message">Access Denied. You are not authorized to view this page.</div>;
  }

  return (
    <div className="dashboard-container">
      <h1>Admin Dashboard</h1>
      <p className="welcome-message">Welcome back, {user.username}!</p>

      <div className="admin-actions">
        <Link to="/create-task" className="btn btn-primary">Create New Task</Link>
        {/* Potentially other admin links */}
      </div>

      <h2 className="section-title">All Tasks</h2>
      {tasks.length === 0 ? (
        <p>No tasks created yet.</p>
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
                <span>Created: {dayjs(task.createdAt).format('MMM D, YYYY')}</span>
              </div>
              <div className="task-actions">
                <Link to={`/admin/tasks/${task._id}/submissions`} className="btn btn-info btn-small">
                  Review Submissions
                </Link>
                {/* <Link to={`/admin/tasks/edit/${task._id}`} className="btn btn-secondary btn-small">
                  Edit Task
                </Link> */}
                <button onClick={() => handleDelete(task._id)} className="btn btn-danger btn-small">
                  Delete Task
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;