// client/src/pages/Register.js
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './AuthForms.css'; // Shared CSS for auth forms

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password2: '', // Confirm password
  });
  const [error, setError] = useState(null);
  const { register } = useAuth();
  const navigate = useNavigate();

  const { username, email, password, password2 } = formData;

  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    if (password !== password2) {
      setError('Passwords do not match');
      return;
    }
    setError(null);
    const result = await register({ username, email, password });
    if (!result.success) {
      setError(result.error);
    } else {
      navigate('/dashboard'); // AuthContext handles actual navigation after successful login
    }
  };

  return (
    <div className="auth-form-container">
      <h1>Sign Up</h1>
      <p>Create your account</p>
      <form onSubmit={onSubmit} className="auth-form">
        <div className="form-group">
          <input
            type="text"
            placeholder="Username"
            name="username"
            value={username}
            onChange={onChange}
            required
          />
        </div>
        <div className="form-group">
          <input
            type="email"
            placeholder="Email Address"
            name="email"
            value={email}
            onChange={onChange}
            required
          />
        </div>
        <div className="form-group">
          <input
            type="password"
            placeholder="Password"
            name="password"
            value={password}
            onChange={onChange}
            minLength="6"
            required
          />
        </div>
        <div className="form-group">
          <input
            type="password"
            placeholder="Confirm Password"
            name="password2"
            value={password2}
            onChange={onChange}
            minLength="6"
            required
          />
        </div>
        {error && <p className="error-message">{error}</p>}
        <input type="submit" className="btn btn-primary" value="Register" />
      </form>
      <p className="my-1">
        Already have an account? <Link to="/login">Sign In</Link>
      </p>
    </div>
  );
};

export default Register;