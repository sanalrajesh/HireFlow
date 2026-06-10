import axios from 'axios';

// Ensure the baseURL points to the /api suffix of the backend server.
// If VITE_API_URL is configured without the "/api" suffix in production, append it automatically.
let baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
if (baseUrl && !baseUrl.toLowerCase().endsWith('/api') && !baseUrl.toLowerCase().endsWith('/api/')) {
  // Strip trailing slash and append /api
  baseUrl = baseUrl.replace(/\/$/, '') + '/api';
}

const API = axios.create({
  baseURL: baseUrl,
  timeout: 10000,
});

// Interceptor to attach Authorization header automatically
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default API;
