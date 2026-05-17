// src/shared/config/axiosInstance.js
import axios from 'axios';
import { API_ENDPOINTS } from './apiConfig';

const STORAGE_KEY = 'fashion_admin_token';
const CUSTOMER_KEY = 'fashion_customer_token';

const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Request interceptor: đính kèm JWT ──
axiosInstance.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem(STORAGE_KEY) ||
      localStorage.getItem(CUSTOMER_KEY);
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor: xử lý 401 ──
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(CUSTOMER_KEY);
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;