// client/src/components/LoadingSpinner.js
import React from 'react';
import './LoadingSpinner.css'; // Add some basic CSS

const LoadingSpinner = () => {
  return (
    <div className="spinner-container">
      <div className="loading-spinner"></div>
    </div>
  );
};

export default LoadingSpinner;