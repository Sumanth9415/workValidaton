// client/src/contexts/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode';
import { loginUser, registerUser, getLoggedInUser as fetchUserAPI } from '../services/authService';
import api from '../services/api'; // Axios instance

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // --- NEW: Theme state management ---
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  // --- NEW: This effect applies the theme to the body tag whenever it changes ---
  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // MOVED UP: Define logout before it's used in other functions
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    delete api.defaults.headers.common['x-auth-token'];
    navigate('/login');
  };

  // Function to decode token and set user data
  const decodeAndSetUser = (currentToken) => {
    if (currentToken) {
      try {
        const decoded = jwtDecode(currentToken);
        // Check if token is expired
        if (decoded.exp * 1000 < Date.now()) {
          console.log('Token expired.');
          logout(); // Now this is safe to call
          return null;
        }
        return decoded.user;
      } catch (error) {
        console.error('Error decoding token:', error);
        logout(); // And this is also safe to call
        return null;
      }
    }
    return null;
  };

  // Effect to load user from token on initial load or token change
  useEffect(() => {
    const loadUser = async () => {
      setLoading(true);
      if (token) {
        api.defaults.headers.common['x-auth-token'] = token;
        const decodedUser = decodeAndSetUser(token);
        if (decodedUser) {
            try {
                // Fetch full user profile to get points, etc.
                const res = await fetchUserAPI();
                setUser(res.data);
            } catch (error) {
                console.error('Failed to fetch user profile:', error);
                logout(); // This is also safe now
            }
        } else {
            setUser(null);
        }
      } else {
        delete api.defaults.headers.common['x-auth-token'];
        setUser(null);
      }
      setLoading(false);
    };

    loadUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]); // We've moved logout outside, so it doesn't need to be a dependency.

  const login = async (credentials) => {
    try {
      const res = await loginUser(credentials);
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      // The useEffect will now handle fetching the user and redirecting
      // Based on the role, you can add more specific logic here or in App.js
      const decoded = jwtDecode(res.data.token);
      if(decoded.user.role === 'admin') {
          navigate('/admin-dashboard');
      } else {
          navigate('/dashboard');
      }
      return { success: true };
    } catch (err) {
      console.error('Login failed:', err.response?.data?.msg || err.message);
      return { success: false, error: err.response?.data?.msg || 'Login failed' };
    }
  };

  const register = async (userData) => {
    try {
      const res = await registerUser(userData);
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      navigate('/dashboard'); // Default to worker dashboard after registration
      return { success: true };
    } catch (err) {
      console.error('Registration failed:', err.response?.data?.msg || err.message);
      return { success: false, error: err.response?.data?.msg || 'Registration failed' };
    }
  };

  // Helper to update user object (e.g., after points change)
  const updateUserPoints = (newPoints) => {
    if (user) {
      setUser(prevUser => ({ ...prevUser, points: newPoints }));
    }
  };

  // --- NEW: Function to toggle the theme ---
  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const value = {
    token,
    user,
    loading,
    login,
    register,
    logout,
    updateUserPoints,
    isAdmin: user && user.role === 'admin',
    isWorker: user && user.role === 'worker',
    theme, // <-- Add theme state to context
    toggleTheme, // <-- Add toggle function to context
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};