// client/src/pages/CreateTask.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createTask } from '../services/taskService';
import dayjs from 'dayjs';
import './Forms.css'; // General form styles

const CreateTask = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficulty: 'medium',
    rewardPoints: '',
    deadline: '',
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  const { title, description, difficulty, rewardPoints, deadline } = formData;

  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Basic client-side validation for deadline
    if (dayjs(deadline).isBefore(dayjs())) {
        setError('Deadline must be in the future.');
        return;
    }
    if (rewardPoints <= 0) {
        setError('Reward points must be a positive number.');
        return;
    }

    try {
      await createTask(formData);
      setSuccess('Task created successfully!');
      setFormData({ // Clear form
        title: '',
        description: '',
        difficulty: 'medium',
        rewardPoints: '',
        deadline: '',
      });
      navigate('/admin-dashboard'); // Redirect to admin dashboard
    } catch (err) {
      console.error('Failed to create task:', err.response?.data?.msg || err.message);
      setError(err.response?.data?.msg || 'Failed to create task.');
    }
  };

  return (
    <div className="form-container">
      <h1>Create New Task</h1>
      <form onSubmit={onSubmit} className="app-form">
        <div className="form-group">
          <label htmlFor="title">Task Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={title}
            onChange={onChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={description}
            onChange={onChange}
            rows="5"
            required
          ></textarea>
        </div>
        <div className="form-group">
          <label htmlFor="difficulty">Difficulty</label>
          <select
            id="difficulty"
            name="difficulty"
            value={difficulty}
            onChange={onChange}
            required
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="rewardPoints">Reward Points</label>
          <input
            type="number"
            id="rewardPoints"
            name="rewardPoints"
            value={rewardPoints}
            onChange={onChange}
            min="1"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="deadline">Deadline</label>
          <input
            type="datetime-local"
            id="deadline"
            name="deadline"
            value={deadline}
            onChange={onChange}
            required
          />
        </div>
        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}
        <button type="submit" className="btn btn-primary">Create Task</button>
        <button type="button" onClick={() => navigate('/admin-dashboard')} className="btn btn-secondary cancel-btn">Cancel</button>
      </form>
    </div>
  );
};

export default CreateTask;