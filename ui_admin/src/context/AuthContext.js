import React, { createContext, useState, useEffect, useCallback } from 'react';

export const AuthContext = createContext(null);

const TOKEN_KEY = 'fashion_admin_token';
const USER_KEY  = 'fashion_admin_user';

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken]             = useState(null);
  const [loading, setLoading]         = useState(true); // đang khởi tạo từ localStorage

  // Khởi tạo: đọc token + user từ localStorage khi app load
  useEffect(() => {
    try {
      const savedToken = localStorage.getItem(TOKEN_KEY);
      const savedUser  = localStorage.getItem(USER_KEY);
      if (savedToken && savedUser) {
        setToken(savedToken);
        setCurrentUser(JSON.parse(savedUser));
      }
    } catch (err) {
      // nếu parse lỗi thì clear luôn
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Đăng nhập — gọi từ LoginPage sau khi nhận response API
   * @param {object} userData  - thông tin user từ API
   * @param {string} authToken - JWT token từ API
   */
  const login = useCallback((userData, authToken) => {
    setCurrentUser(userData);
    setToken(authToken);
    localStorage.setItem(TOKEN_KEY, authToken);
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
  }, []);

  /**
   * Đăng xuất — xoá toàn bộ state + localStorage
   */
  const logout = useCallback(() => {
    setCurrentUser(null);
    setToken(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }, []);

  /**
   * Kiểm tra user đã đăng nhập chưa
   */
  const isAuthenticated = Boolean(token && currentUser);

  /**
   * Kiểm tra role
   */
  const isAdmin = currentUser?.role === 'ADMIN';

  const value = {
    currentUser,
    token,
    loading,
    isAuthenticated,
    isAdmin,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
