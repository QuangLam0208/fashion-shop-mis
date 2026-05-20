// src/customer/context/CustomerAuthContext.js
import React, { createContext, useState, useCallback } from 'react';
import customerAuthService from '../services/customerAuthService';

export const CustomerAuthContext = createContext(null);

/**
 * CustomerAuthProvider
 *
 * Vì backend không có /me endpoint, user info được lưu tạm
 * vào localStorage khi login và đọc lại khi reload trang.
 *
 * Storage keys:
 *   fashion_customer_token        — JWT access token
 *   fashion_customer_refresh_token — refresh token
 *   fashion_customer_user         — user info JSON
 */
const USER_KEY = 'fashion_customer_user';

const _loadUser = () => {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY)) || null;
  } catch {
    return null;
  }
};

export const CustomerAuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(_loadUser);
  const [token, setToken]             = useState(customerAuthService.getToken);

  const isAuthenticated = !!currentUser && !!token;

  /**
   * Đăng nhập
   * @param {string}  email
   * @param {string}  password
   * @param {boolean} remember — true: lưu localStorage
   */
  const login = useCallback(async (email, password, remember = true) => {
    const data = await customerAuthService.login(email, password, remember);
    // data = { token, refreshToken, user }
    customerAuthService.saveTokens(
      { token: data.token, refreshToken: data.refreshToken },
      remember
    );
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    setToken(data.token);
    setCurrentUser(data.user);
  }, []);

  /**
   * Đăng xuất
   */
  const logout = useCallback(async () => {
    await customerAuthService.logout();
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setCurrentUser(null);
  }, []);

  /**
   * Cập nhật thông tin profile cục bộ
   */
  const updateProfile = useCallback((updated) => {
    setCurrentUser((prev) => {
      const merged = { ...prev, ...updated };
      localStorage.setItem(USER_KEY, JSON.stringify(merged));
      return merged;
    });
  }, []);

  return (
    <CustomerAuthContext.Provider
      value={{
        currentUser,
        token,
        isAuthenticated,
        login,
        logout,
        updateProfile,
        // Expose loading=false vì không có async init nữa
        loading: false,
      }}
    >
      {children}
    </CustomerAuthContext.Provider>
  );
};