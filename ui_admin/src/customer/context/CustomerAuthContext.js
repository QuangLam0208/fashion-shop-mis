
import React, { createContext, useState, useCallback } from 'react';
import customerAuthService from '../services/customerAuthService';

export const CustomerAuthContext = createContext(null);

// 1. KHAI BÁO TÊN KEY ĐỒNG NHẤT
const USER_KEY = 'fashion_customer_user';
const TOKEN_KEY = 'fashion_customer_token';

const _loadUser = () => {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY)) || null;
  } catch {
    return null;
  }
};

// Hàm tự động load token khi khởi tạo (Thay thế cho customerAuthService.getToken cũ)
const _loadToken = () => {
  return localStorage.getItem(TOKEN_KEY) || null;
};

export const CustomerAuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(_loadUser);
  const [token, setToken]             = useState(_loadToken);

  const isAuthenticated = !!currentUser && !!token;

  const login = useCallback(async (email, password) => {
    const res = await customerAuthService.login(email, password);
    
    const userData = {
      id: res.userId,
      full_name: res.fullName,
      email: res.email,
      role: res.role
    };

    setCurrentUser(userData);
    setToken(res.accessToken);

    // 2. SỬA LỖI LƯU SAI KEY Ở ĐÂY (Dùng đúng biến USER_KEY và TOKEN_KEY)
    localStorage.setItem(TOKEN_KEY, res.accessToken);
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
  }, []);

  const logout = useCallback(async () => {
    if (customerAuthService.logout) {
      await customerAuthService.logout();
    }
    // 3. XÓA SẠCH KEY KHI ĐĂNG XUẤT
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(TOKEN_KEY);
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