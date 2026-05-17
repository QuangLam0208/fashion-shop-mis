// src/shared/config/apiConfig.js
export const USE_MOCK = true; // ← đổi false khi có backend

const BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN:          `${BASE}/api/auth/login`,
    LOGOUT:         `${BASE}/api/auth/logout`,
    REFRESH:        `${BASE}/api/auth/refresh`,
    ME:             `${BASE}/api/auth/me`,
    REGISTER:       `${BASE}/api/auth/register`,
    FORGOT_PASSWORD:`${BASE}/api/auth/forgot-password`,
    RESET_PASSWORD: `${BASE}/api/auth/reset-password`,
    VERIFY_EMAIL:   `${BASE}/api/auth/verify-email`,
  },
  DASHBOARD: {
    STATS:        `${BASE}/api/admin/dashboard/stats`,
    REVENUE:      `${BASE}/api/admin/dashboard/revenue`,
    TOP_PRODUCTS: `${BASE}/api/admin/dashboard/top-products`,
    ORDER_STATUS: `${BASE}/api/admin/dashboard/order-status`,
  },
  ADMIN_PRODUCTS: {
    GET_ALL:   `${BASE}/api/admin/products`,
    GET_BY_ID: (id) => `${BASE}/api/admin/products/${id}`,
    CREATE:    `${BASE}/api/admin/products`,
    UPDATE:    (id) => `${BASE}/api/admin/products/${id}`,
    DELETE:    (id) => `${BASE}/api/admin/products/${id}`,
  },
  CATEGORIES: {
    GET_ALL:   `${BASE}/api/admin/categories`,
    GET_BY_ID: (id) => `${BASE}/api/admin/categories/${id}`,
    CREATE:    `${BASE}/api/admin/categories`,
    UPDATE:    (id) => `${BASE}/api/admin/categories/${id}`,
    DELETE:    (id) => `${BASE}/api/admin/categories/${id}`,
  },
  ADMIN_ORDERS: {
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
  ADMIN_USERS: {
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
  SHOP: {
    PRODUCTS:       `${BASE}/api/products`,
    PRODUCT_DETAIL: (id) => `${BASE}/api/products/${id}`,
    CATEGORIES:     `${BASE}/api/categories`,
    SEARCH:         `${BASE}/api/products/search`,
    REVIEWS:        (productId) => `${BASE}/api/products/${productId}/reviews`,
  },
  CUSTOMER: {
    CART:      `${BASE}/api/customer/cart`,
    WISHLIST:  `${BASE}/api/customer/wishlist`,
    ORDERS:    `${BASE}/api/customer/orders`,
    ORDER_DETAIL: (id) => `${BASE}/api/customer/orders/${id}`,
    ADDRESSES: `${BASE}/api/customer/addresses`,
    CHECKOUT:  `${BASE}/api/customer/checkout`,
    PROFILE:   `${BASE}/api/customer/profile`,
  },
};