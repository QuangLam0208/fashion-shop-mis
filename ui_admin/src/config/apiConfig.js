// ─────────────────────────────────────────────────────────────
//  config/apiConfig.js
//  Đổi USE_MOCK = false + điền .env khi có backend thật
// ─────────────────────────────────────────────────────────────

export const USE_MOCK = true;

const BASE = 'http://localhost:8080';

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN:   `${BASE}/api/auth/login`,
    LOGOUT:  `${BASE}/api/auth/logout`,
    REFRESH: `${BASE}/api/auth/refresh`,
    ME:      `${BASE}/api/auth/me`,
  },

  DASHBOARD: {
    STATS:        `${BASE}/api/admin/dashboard/stats`,
    REVENUE:      `${BASE}/api/admin/dashboard/revenue`,
    TOP_PRODUCTS: `${BASE}/api/admin/dashboard/top-products`,
    ORDER_STATUS: `${BASE}/api/admin/dashboard/order-status`,
  },

  PRODUCTS: {
    GET_ALL:    `${BASE}/api/admin/products`,
    GET_BY_ID:  (id) => `${BASE}/api/admin/products/${id}`,
    CREATE:     `${BASE}/api/admin/products`,
    UPDATE:     (id) => `${BASE}/api/admin/products/${id}`,
    DELETE:     (id) => `${BASE}/api/admin/products/${id}`,
    UPLOAD_IMG: (id) => `${BASE}/api/admin/products/${id}/images`,
  },

  CATEGORIES: {
    GET_ALL:   `${BASE}/api/admin/categories`,
    GET_BY_ID: (id) => `${BASE}/api/admin/categories/${id}`,
    CREATE:    `${BASE}/api/admin/categories`,
    UPDATE:    (id) => `${BASE}/api/admin/categories/${id}`,
    DELETE:    (id) => `${BASE}/api/admin/categories/${id}`,
  },

  ORDERS: {
    GET_ALL:       `${BASE}/api/admin/orders`,
    GET_BY_ID:     (id) => `${BASE}/api/admin/orders/${id}`,
    CREATE:        `${BASE}/api/admin/orders`,
    UPDATE_STATUS: (id) => `${BASE}/api/admin/orders/${id}/status`,
    CANCEL:        (id) => `${BASE}/api/admin/orders/${id}/cancel`,
  },

  RETURNS: {
    GET_ALL:   `${BASE}/api/admin/returns`,
    GET_BY_ID: (id) => `${BASE}/api/admin/returns/${id}`,
    APPROVE:   (id) => `${BASE}/api/admin/returns/${id}/approve`,
    REJECT:    (id) => `${BASE}/api/admin/returns/${id}/reject`,
    COMPLETE:  (id) => `${BASE}/api/admin/returns/${id}/complete`,
  },

  USERS: {
    GET_ALL:       `${BASE}/api/admin/users`,
    GET_BY_ID:     (id) => `${BASE}/api/admin/users/${id}`,
    TOGGLE_STATUS: (id) => `${BASE}/api/admin/users/${id}/toggle-status`,
    GET_ORDERS:    (id) => `${BASE}/api/admin/users/${id}/orders`,
  },

  COUPONS: {
    GET_ALL:   `${BASE}/api/admin/coupons`,
    GET_BY_ID: (id) => `${BASE}/api/admin/coupons/${id}`,
    CREATE:    `${BASE}/api/admin/coupons`,
    UPDATE:    (id) => `${BASE}/api/admin/coupons/${id}`,
    DELETE:    (id) => `${BASE}/api/admin/coupons/${id}`,
  },
};
