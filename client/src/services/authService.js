// client/src/services/authService.js
import api from './api';

export const registerUser = (userData) => api.post('/auth/register', userData);
export const loginUser = (credentials) => api.post('/auth/login', credentials);
export const getLoggedInUser = () => api.get('/auth/user');