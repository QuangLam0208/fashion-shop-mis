// ─────────────────────────────────────────────────────────────
//  config/axiosInstance.js
//  Axios base với JWT interceptor tự động + xử lý 401
// ─────────────────────────────────────────────────────────────

import axios from 'axios';

const TOKEN_KEY = 'fashion_admin_token';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:8080',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Request interceptor: tự động gắn JWT vào mọi request ──
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ── Response interceptor: xử lý 401 → logout & redirect ──
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem('fashion_admin_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;
