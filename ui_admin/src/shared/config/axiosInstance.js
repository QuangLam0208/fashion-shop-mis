import axios from 'axios';

export const ADMIN_TOKEN_KEY    = 'fashion_admin_token';
export const CUSTOMER_TOKEN_KEY = 'fashion_customer_token';
export const ADMIN_USER_KEY     = 'fashion_admin_user';
export const CUSTOMER_USER_KEY  = 'fashion_customer_user';
export const REFRESH_TOKEN_KEY = 'admin_refresh_token';

const BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';

const PUBLIC_ENDPOINTS = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/verify-email',
  '/api/auth/forgot-password',
  '/api/auth/reset-password',
  '/api/auth/refresh-token',
  // Shop public (customer browse không cần login)
  '/api/products',
  '/api/categories',
];

const isPublicEndpoint = (url = '') =>
  PUBLIC_ENDPOINTS.some((pub) => url.includes(pub));

// ── Biến cờ chống vòng lặp refresh token ──
let isRefreshing       = false;
let refreshSubscribers = [];

const onRefreshed    = (newToken) => refreshSubscribers.forEach((cb) => cb(newToken));
const addSubscriber  = (cb)       => refreshSubscribers.push(cb);

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// ── REQUEST: chỉ gắn JWT cho protected endpoints ──
axiosInstance.interceptors.request.use(
  (config) => {
    if (!isPublicEndpoint(config.url)) {
      const token =
        localStorage.getItem(ADMIN_TOKEN_KEY) ||
        localStorage.getItem(CUSTOMER_TOKEN_KEY);
      if (token) config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ── RESPONSE: 401 chỉ xử lý cho protected endpoints ──
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const url             = error.config?.url || '';
    const status          = error.response?.status;
    const originalRequest = error.config;

    // Public endpoint 401 → reject bình thường, không redirect
    if (isPublicEndpoint(url)) return Promise.reject(error);

    if (status === 401 && !originalRequest._retry) {
      const refreshToken = localStorage.getItem('fashion_admin_refresh_token')
                        || localStorage.getItem('fashion_customer_refresh_token');

      // Không có refresh token → clear & về login
      if (!refreshToken) {
        forceLogout();
        return Promise.reject(error);
      }

      // Đang refresh → xếp hàng chờ
      if (isRefreshing) {
        return new Promise((resolve) => {
          addSubscriber((newToken) => {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            resolve(axiosInstance(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing            = true;

      try {
        const res = await axios.post(
          `${BASE_URL}/api/auth/refresh-token`,
          { refreshToken },
          { headers: { 'Content-Type': 'application/json' } },
        );

        const { token: newToken, refreshToken: newRefresh } = res.data;

        // Lưu token mới vào đúng key (admin hoặc customer)
        if (localStorage.getItem(ADMIN_TOKEN_KEY)) {
          localStorage.setItem(ADMIN_TOKEN_KEY, newToken);
          if (newRefresh) localStorage.setItem('fashion_admin_refresh_token', newRefresh);
        } else {
          localStorage.setItem(CUSTOMER_TOKEN_KEY, newToken);
          if (newRefresh) localStorage.setItem('fashion_customer_refresh_token', newRefresh);
        }

        axiosInstance.defaults.headers.common.Authorization = `Bearer ${newToken}`;
        originalRequest.headers.Authorization               = `Bearer ${newToken}`;

        onRefreshed(newToken);
        refreshSubscribers = [];

        return axiosInstance(originalRequest);
      } catch {
        refreshSubscribers = [];
        forceLogout();
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

function forceLogout() {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
  localStorage.removeItem(CUSTOMER_TOKEN_KEY);
  localStorage.removeItem(ADMIN_USER_KEY);
  localStorage.removeItem(CUSTOMER_USER_KEY);
  localStorage.removeItem('fashion_admin_refresh_token');
  localStorage.removeItem('fashion_customer_refresh_token');
  window.location.href = '/login';
}

export default axiosInstance;
