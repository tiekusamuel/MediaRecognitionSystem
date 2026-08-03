import axios, {AxiosError } from 'axios';
import type{AxiosInstance, InternalAxiosRequestConfig, AxiosResponse} from 'axios';

// Base API configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5273/api';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 180000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - attach JWT token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors globally
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    if (error.response) {
      // Handle 401 Unauthorized - logout user
      if (error.response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }

      // Handle other error status codes
      if (error.response.status === 403) {
        console.error('Access forbidden');
      }

      if (error.response.status === 404) {
        console.error('Resource not found');
      }

      if (error.response.status >= 500) {
        console.error('Server error occurred');
      }
    } else if (error.request) {
      console.error('No response received from server');
    } else {
      console.error('Request configuration error');
    }

    return Promise.reject(error);
  }
);

export default api;