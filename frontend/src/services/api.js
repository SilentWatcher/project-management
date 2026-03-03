import axios from 'axios';

// Use relative path to go through Vite proxy
const API_URL = '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  timeout: 10000, // 10 second timeout
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Handle timeout errors
    if (error.code === 'ECONNABORTED' || error.message === 'timeout of 10000ms exceeded') {
      console.error('Request timeout:', error);
      return Promise.reject(new Error('Request timed out. Please try again.'));
    }
    const originalRequest = error.config;

    // If error is 401 and we haven't tried to refresh token yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      const errorCode = error.response.data?.code;
      
      if (errorCode === 'TOKEN_EXPIRED') {
        originalRequest._retry = true;

        try {
          // Try to refresh the token
          const response = await axios.post(
            `/auth/refresh`,
            {},
            { withCredentials: true }
          );

          const { accessToken } = response.data.data;
          localStorage.setItem('accessToken', accessToken);

          // Retry the original request
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          // Refresh failed, clear token and redirect to login
          localStorage.removeItem('accessToken');
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;
