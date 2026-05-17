// src/shared/utils/storageHelper.js
const ADMIN_TOKEN_KEY   = 'fashion_admin_token';
const CUSTOMER_TOKEN_KEY = 'fashion_customer_token';

export const storageHelper = {
  // Admin
  getAdminToken:    () => localStorage.getItem(ADMIN_TOKEN_KEY),
  setAdminToken:    (token) => localStorage.setItem(ADMIN_TOKEN_KEY, token),
  clearAdminToken:  () => localStorage.removeItem(ADMIN_TOKEN_KEY),

  // Customer
  getCustomerToken:   () => localStorage.getItem(CUSTOMER_TOKEN_KEY),
  setCustomerToken:   (token) => localStorage.setItem(CUSTOMER_TOKEN_KEY, token),
  clearCustomerToken: () => localStorage.removeItem(CUSTOMER_TOKEN_KEY),

  // Generic
  get:   (key)        => localStorage.getItem(key),
  set:   (key, value) => localStorage.setItem(key, JSON.stringify(value)),
  getJSON: (key) => {
    try { return JSON.parse(localStorage.getItem(key)); }
    catch { return null; }
  },
  remove: (key) => localStorage.removeItem(key),
  clear:  ()    => localStorage.clear(),
};

export default storageHelper;