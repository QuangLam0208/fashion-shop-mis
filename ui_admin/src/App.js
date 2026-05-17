// src/App.js — FINAL
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import viVN from 'antd/locale/vi_VN';

// Admin
import { AuthProvider } from './admin/context/AuthContext';
import AdminRoutes from './admin/routes';

// Customer
import { CustomerAuthProvider } from './customer/context/CustomerAuthContext';
import { CartProvider } from './customer/context/CartContext';
import CustomerRoutes from './customer/routes';

/**
 * App — root component
 *
 * Phân luồng:
 *   /admin/*  → AdminRoutes  (AuthProvider — admin auth)
 *   /*        → CustomerRoutes (CustomerAuthProvider + CartProvider)
 *
 * Mỗi nhánh dùng AuthContext riêng, không ảnh hưởng nhau.
 */
const App = () => {
  return (
    <ConfigProvider locale={viVN}>
      <BrowserRouter>
        <Routes>
          {/* ── ADMIN — toàn bộ /admin/* ── */}
          <Route
            path="/admin/*"
            element={
              <AuthProvider>
                <AdminRoutes />
              </AuthProvider>
            }
          />

          {/* ── CUSTOMER — toàn bộ /* ── */}
          <Route
            path="/*"
            element={
              <CustomerAuthProvider>
                <CartProvider>
                  <CustomerRoutes />
                </CartProvider>
              </CustomerAuthProvider>
            }
          />
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
};

export default App;