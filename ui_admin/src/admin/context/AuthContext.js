// src/admin/context/AuthContext.js
import React, { createContext, useState, useEffect, useCallback } from 'react';
import { mockUsers } from '../../shared/mocks/userMock';
import { USE_MOCK, API_ENDPOINTS } from '../../shared/config/apiConfig';
import axiosInstance from '../../shared/config/axiosInstance';

const STORAGE_KEY = 'fashion_admin_token';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken]             = useState(() => localStorage.getItem(STORAGE_KEY));
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    const init = async () => {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) { setLoading(false); return; }
      try {
        if (USE_MOCK) {
          const uid = parseInt(saved.replace('mock-admin-jwt-', ''), 10);
          const u   = mockUsers.find((u) => u.user_id === uid && u.role === 'ADMIN');
          if (u) { setCurrentUser(u); setToken(saved); }
          else   { localStorage.removeItem(STORAGE_KEY); setToken(null); }
        } else {
          const res = await axiosInstance.get(API_ENDPOINTS.AUTH.ME);
          setCurrentUser(res.data); setToken(saved);
        }
      } catch {
        localStorage.removeItem(STORAGE_KEY); setToken(null);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const login = useCallback(async (email, password) => {
    if (USE_MOCK) {
      const u = mockUsers.find(
        (u) => u.email === email && u.password === password && u.role === 'ADMIN' && u.status === 'ACTIVE'
      );
      if (!u) { const e = new Error('Sai email hoặc mật khẩu'); e.response = { data: { message: 'Sai email hoặc mật khẩu' } }; throw e; }
      const t = `mock-admin-jwt-${u.user_id}`;
      localStorage.setItem(STORAGE_KEY, t);
      setToken(t); setCurrentUser(u);
      return;
    }
    const res = await axiosInstance.post(API_ENDPOINTS.AUTH.LOGIN, { email, password });
    const { token: t, user } = res.data;
    localStorage.setItem(STORAGE_KEY, t);
    setToken(t); setCurrentUser(user);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setToken(null); setCurrentUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, token, loading, isAuthenticated: !!currentUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};