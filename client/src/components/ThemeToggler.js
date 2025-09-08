// client/src/components/ThemeToggler.js
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import './ThemeToggler.css'; // We'll create this file

const ThemeToggler = () => {
  const { theme, toggleTheme } = useAuth();

  return (
    <button onClick={toggleTheme} className="theme-toggler" title="Toggle Theme">
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  );
};

export default ThemeToggler;