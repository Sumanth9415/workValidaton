// client/src/services/taskService.js
import api from './api';

export const createTask = (taskData) => api.post('/tasks', taskData);
export const getAllTasks = () => api.get('/tasks');
export const getTaskById = (id) => api.get(`/tasks/${id}`);
export const deleteTask = (id) => api.delete(`/tasks/${id}`);