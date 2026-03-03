import axios from 'axios';

// Use relative path to go through Vite proxy
const API_URL = '/api';

// Get auth token
const getToken = () => localStorage.getItem('accessToken');

// Create axios instance for uploads
const uploadApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});

// Add auth header to upload requests
uploadApi.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await uploadApi.post('/upload/image', formData);
  return response.data.data;
};

export const uploadAvatar = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await uploadApi.post('/upload/avatar', formData);
  return response.data.data;
};

export const uploadTaskAttachment = async (taskId, file) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await uploadApi.post(`/upload/task/${taskId}`, formData);
  return response.data.data;
};

export const deleteImage = async (publicId) => {
  const response = await uploadApi.delete(`/upload/${publicId}`);
  return response.data;
};

export default {
  uploadImage,
  uploadAvatar,
  uploadTaskAttachment,
  deleteImage,
};
