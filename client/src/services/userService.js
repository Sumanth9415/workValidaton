// client/src/services/userService.js
import api from './api';

export const getLeaderboard = () => api.get('/users/leaderboard');
export const getUserProfile = (userId) => api.get(`/users/${userId}`);
export const redeemPoints = (pointsToRedeem) => api.put('/users/redeem', { pointsToRedeem });