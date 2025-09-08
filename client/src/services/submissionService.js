// client/src/services/submissionService.js
import api from './api';

export const submitSolution = (taskId, submissionData, file) => {
  const formData = new FormData();
  formData.append('solutionText', submissionData.solutionText);
  formData.append('nonce', submissionData.nonce);
  formData.append('hash', submissionData.hash);
  if (file) {
    formData.append('solutionFile', file);
  }

  return api.post(`/submissions/${taskId}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data', // Important for file uploads
    },
  });
};

export const getSubmissionsForTask = (taskId) => api.get(`/submissions/task/${taskId}`);
export const getMySubmissions = () => api.get('/submissions/me');
export const updateSubmissionStatus = (submissionId, status) =>
  api.put(`/submissions/${submissionId}/status`, { status });