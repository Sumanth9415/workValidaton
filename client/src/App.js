// client/src/App.js
import React from 'react';
// REMOVED BrowserRouter from this import, it's no longer needed here
import { Routes, Route } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';

// Import all your page components as before...
import HomePage from './pages/HomePage';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import CreateTask from './pages/CreateTask';
import TaskDetail from './pages/TaskDetail';
import AdminSubmissionReview from './pages/AdminSubmissionReview';
import Leaderboard from './pages/Leaderboard';
import MySubmissions from './pages/MySubmissions';
import Profile from './pages/Profile';

function App() {
  const { user } = useAuth(); // Get user info from AuthContext

  // THE <Router> WRAPPER IS REMOVED FROM HERE
  return (
    <>
      <Navbar /> {/* Navbar will be visible on all pages */}
      <main className="container"> {/* Basic container for content */}
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/leaderboard" element={<Leaderboard />} />

          {/* Worker Routes */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute roles={['worker']}>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/tasks/:id"
            element={
              <PrivateRoute roles={['worker', 'admin']}>
                <TaskDetail />
              </PrivateRoute>
            }
          />
          <Route
            path="/my-submissions"
            element={
              <PrivateRoute roles={['worker']}>
                <MySubmissions />
              </PrivateRoute>
            }
          />
          <Route
            path="/profile/:id"
            element={
              <PrivateRoute roles={['worker', 'admin']}>
                <Profile />
              </PrivateRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin-dashboard"
            element={
              <PrivateRoute roles={['admin']}>
                <AdminDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/create-task"
            element={
              <PrivateRoute roles={['admin']}>
                <CreateTask />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/tasks/:taskId/submissions"
            element={
              <PrivateRoute roles={['admin']}>
                <AdminSubmissionReview />
              </PrivateRoute>
            }
          />

          {/* Add a 404/Not Found route */}
          <Route path="*" element={<div>404 Not Found</div>} />
        </Routes>
      </main>
    </>
  );
}

export default App;