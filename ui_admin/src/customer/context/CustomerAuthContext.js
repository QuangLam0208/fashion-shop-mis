// src/customer/context/CustomerAuthContext.js
import React, { createContext, useState, useEffect, useCallback } from 'react';
import customerAuthService from '../services/customerAuthService';

const STORAGE_KEY = 'fashion_customer_token';

export const CustomerAuthContext = createContext(null);

/**
 * CustomerAuthProvider
 * Bọc toàn bộ Customer routes trong App.js
 *
 * State:
 *   currentUser  — thông tin user đang đăng nhập (hoặc null)
 *   token        — JWT token (hoặc null)
 *   loading      — true khi đang khởi tạo (check localStorage)
 *   isAuthenticated — boolean tiện dùng
 *
 * Actions:
 *   login(email, password, remember)
 *   logout()
 *   updateProfile(updatedUser) — cập nhật local state sau khi sửa profile
 */
export const CustomerAuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem(STORAGE_KEY));
  const [loading, setLoading] = useState(true);

  // Khởi tạo — kiểm tra token đã lưu
  useEffect(() => {
    const init = async () => {
      const savedToken = localStorage.getItem(STORAGE_KEY);
      if (!savedToken) {
        setLoading(false);
        return;
      }
      try {
        const user = await customerAuthService.getMe();
        if (user) {
          setCurrentUser(user);
          setToken(savedToken);
        } else {
          localStorage.removeItem(STORAGE_KEY);
          setToken(null);
        }
      } catch {
        localStorage.removeItem(STORAGE_KEY);
        setToken(null);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  /**
   * Đăng nhập
   * @param {string} email
   * @param {string} password
   * @param {boolean} remember — true: lưu localStorage, false: sessionStorage (tùy chọn)
   */
  const login = useCallback(async (email, password, remember = true) => {
    const data = await customerAuthService.login(email, password);
    // data = { token, user }
    const { token: newToken, user } = data;
    setToken(newToken);
    setCurrentUser(user);
    // Lưu token
    if (remember) {
      localStorage.setItem(STORAGE_KEY, newToken);
    } else {
      sessionStorage.setItem(STORAGE_KEY, newToken);
      localStorage.setItem(STORAGE_KEY, newToken); // fallback cho axiosInstance
    }
  }, []);

  /**
   * Đăng xuất
   */
  const logout = useCallback(async () => {
    try {
      await customerAuthService.logout();
    } catch {
      // Bỏ qua lỗi logout API
    } finally {
      setCurrentUser(null);
      setToken(null);
      localStorage.removeItem(STORAGE_KEY);
      sessionStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  /**
   * Cập nhật thông tin profile (dùng trong ProfilePage)
   */
  const updateProfile = useCallback((updatedUser) => {
    setCurrentUser((prev) => ({ ...prev, ...updatedUser }));
  }, []);

  const value = {
    currentUser,
    token,
    loading,
    isAuthenticated: !!currentUser && !!token,
    login,
    logout,
    updateProfile,
  };

  return (
    <CustomerAuthContext.Provider value={value}>
      {children}
    </CustomerAuthContext.Provider>
  );
};

export default CustomerAuthContext;