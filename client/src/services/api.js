// client/src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['x-auth-token'] = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Optional: Interceptor to handle expired tokens globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid, handle logout
      console.log('API call returned 401, token likely expired or invalid.');
      localStorage.removeItem('token');
      // You might want to dispatch a logout action or redirect to login here
      // window.location.href = '/login'; // Example: force redirect
    }
    return Promise.reject(error);
  }
);

export default api;