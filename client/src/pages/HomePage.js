// client/src/pages/HomePage.js
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './HomePage.css'; // We will create this new CSS file

// Importing simple icons (using emojis for simplicity, but you could use an icon library)
const FeatureIcon = ({ icon, title, children }) => (
  <div className="feature-card">
    <div className="feature-icon">{icon}</div>
    <h3>{title}</h3>
    <p>{children}</p>
  </div>
);

const HomePage = () => {
  const { user } = useAuth();

  return (
    <div className="homepage-container">
      {/* Hero Section */}
      <header className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            Unlock Rewards Through <span className="highlight-text">Proof of Work</span>
          </h1>
          <p className="hero-subtitle">
            Join a community of problem solvers. Complete tasks, submit your solutions, and earn points for your computational effort.
          </p>
          <div className="hero-buttons">
            {!user ? (
              <>
                <Link to="/register" className="btn btn-primary btn-large">Get Started Now</Link>
                <Link to="/login" className="btn btn-secondary btn-large">I have an account</Link>
              </>
            ) : (
              <>
                {user.role === 'worker' && <Link to="/dashboard" className="btn btn-primary btn-large">Go to My Dashboard</Link>}
                {user.role === 'admin' && <Link to="/admin-dashboard" className="btn btn-primary btn-large">Go to Admin Dashboard</Link>}
              </>
            )}
          </div>
        </div>
      </header>

      {/* "How It Works" Section */}
      <section className="features-section">
        <h2 className="section-title">How It Works</h2>
        <div className="features-grid">
          <FeatureIcon icon="📝" title="1. Find a Task">
            Browse a list of available tasks posted by administrators. Each task has a title, description, and reward points.
          </FeatureIcon>
          <FeatureIcon icon="💻" title="2. Solve & Submit">
            Work on the task and prepare your solution. Our system requires a simple "Proof of Work" to ensure fair submissions.
          </FeatureIcon>
          <FeatureIcon icon="🏆" title="3. Earn Rewards">
            Once your submission is verified and accepted by an admin, points are added to your account. Climb the leaderboard!
          </FeatureIcon>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="cta-section">
        <h2>Ready to Start Earning?</h2>
        <p>Your next challenge is just a click away. Join now and prove your skills!</p>
        {!user && (
          <Link to="/register" className="btn btn-primary btn-large">Sign Up for Free</Link>
        )}
      </section>
    </div>
  );
};

export default HomePage;