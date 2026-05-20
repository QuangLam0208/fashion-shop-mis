import React, { createContext, useState, useEffect, useCallback } from 'react';
import { ADMIN_TOKEN_KEY, REFRESH_TOKEN_KEY, ADMIN_USER_KEY } from '../../shared/config/axiosInstance';
import { authService } from '../services/authService';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [token,       setToken]       = useState(null);
  const [loading,     setLoading]     = useState(true);

  // Khởi tạo từ localStorage
  useEffect(() => {
    try {
      const savedToken = localStorage.getItem(ADMIN_TOKEN_KEY);
      const savedUser  = localStorage.getItem(ADMIN_USER_KEY);
      if (savedToken && savedUser) {
        setToken(savedToken);
        setCurrentUser(JSON.parse(savedUser));
      }
    } catch {
      localStorage.removeItem(ADMIN_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(ADMIN_USER_KEY);
    } finally {
      setLoading(false);
    }
  }, []);

  // login: nhận user + accessToken + refreshToken từ API response
  const login = useCallback(async (email, password, remember) => {
    // 1. Context tự gọi API
    const res = await authService.login(email, password, remember);
    
    // 2. Tự xử lý JSON trả về
    const userData = {
      id: res.userId,
      email: res.email,
      full_name: res.fullName,
      role: res.role
    };
    
    // 3. Tự lưu state
    setCurrentUser(userData);
    setToken(res.accessToken);
    localStorage.setItem(ADMIN_TOKEN_KEY, res.accessToken);
    localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(userData));
    if (res.refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, res.refreshToken);
    }
  }, []);

  // logout: clear state + storage
  const logout = useCallback(() => {
    setCurrentUser(null);
    setToken(null);
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(ADMIN_USER_KEY);
  }, []);

  const isAuthenticated = Boolean(token && currentUser);
  const isAdmin         = currentUser?.role === 'ADMIN';

  return (
    <AuthContext.Provider value={{ currentUser, token, loading, isAuthenticated, isAdmin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
