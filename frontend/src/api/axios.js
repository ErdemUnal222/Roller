// /src/api/axios.js
import axios from 'axios';

// Base API URL — must include /api/v1
// Netlify env var MUST be named exactly VITE_API_URL to match the line below.
const baseURL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL,
  withCredentials: false,
});

// Automatically attach JWT + handle FormData headers
api.interceptors.request.use(
  (config) => {
    let token = null;
    const stored = localStorage.getItem('user');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        token = parsed?.token || null;
      } catch {
        // ignore parse error
      }
    }
    if (!token) {
      token = localStorage.getItem('token');
    }
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (config.data instanceof FormData) {
      if (config.headers['Content-Type']) {
        delete config.headers['Content-Type'];
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    let formattedMessage = 'Request failed.';
    if (error.response) {
      const { status, data } = error.response;
      if (status === 401) formattedMessage = data?.message || 'Unauthorized.';
      else if (status === 403) formattedMessage = data?.message || 'Forbidden.';
      else formattedMessage = data?.message || data?.error || `HTTP ${status}`;
    } else if (error.request) {
      formattedMessage = 'No response from the server.';
    } else {
      formattedMessage = error.message;
    }
    error.formattedMessage = formattedMessage;
    return Promise.reject(error);
  }
);

export default api;