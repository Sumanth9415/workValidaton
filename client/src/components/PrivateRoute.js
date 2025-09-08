// client/src/components/PrivateRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from './LoadingSpinner'; // Assuming you have a LoadingSpinner component

const PrivateRoute = ({ children, roles }) => {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    // Not logged in, redirect to login page
    return <Navigate to="/login" replace />;
  }

  if (roles && roles.length > 0 && !roles.includes(user.role)) {
    // Logged in but unauthorized role
    alert("You don't have permission to view this page.");
    logout(); // Optional: log out unauthorized users
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default PrivateRoute;