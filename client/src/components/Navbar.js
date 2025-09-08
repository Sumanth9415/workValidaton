// client/src/components/Navbar.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Navbar.css'; // Create a CSS file for styling

const Navbar = () => {
  const { user, logout, loading, isAdmin, isWorker } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) return null; // Don't render navbar while auth is loading

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">PoW System</Link>
      </div>
      <ul className="navbar-links">
        <li><Link to="/leaderboard">Leaderboard</Link></li>
        {user ? (
          <>
            {isWorker && <li><Link to="/dashboard">Tasks</Link></li>}
            {isWorker && <li><Link to="/my-submissions">My Submissions</Link></li>}
            {isAdmin && <li><Link to="/admin-dashboard">Admin Dashboard</Link></li>}
            <li><Link to={`/profile/${user._id}`}>Profile</Link></li>
            <li>
              <button onClick={handleLogout} className="logout-btn">
                Logout ({user.username})
              </button>
            </li>
          </>
        ) : (
          <>
            <li><Link to="/login">Login</Link></li>
            <li><Link to="/register">Register</Link></li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;