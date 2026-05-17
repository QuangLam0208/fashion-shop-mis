import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import PrivateRoute  from '../components/PrivateRoute';
import MainLayout    from '../layouts/MainLayout';
import LoginPage     from '../pages/LoginPage';
import NotFoundPage  from '../pages/NotFoundPage';

import dashboardRoutes from './dashboardRoutes';
import productRoutes   from './productRoutes';
import categoryRoutes  from './categoryRoutes';
import orderRoutes     from './orderRoutes';
import returnRoutes    from './returnRoutes';
import userRoutes      from './userRoutes';
import couponRoutes    from './couponRoutes';

/**
 * AppRoutes — trung tâm điều hướng toàn bộ ứng dụng
 *
 * Cấu trúc:
 *   /login                → LoginPage (public)
 *   /admin/*              → PrivateRoute → MainLayout → module routes
 *   /                     → redirect về /admin/dashboard
 *   *                     → NotFoundPage
 */
const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<LoginPage />} />

        {/* Redirect root → dashboard */}
        <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />

        {/* Protected — yêu cầu đăng nhập */}
        <Route element={<PrivateRoute />}>
          <Route path="/admin" element={<MainLayout />}>
            {/* Redirect /admin → /admin/dashboard */}
            <Route index element={<Navigate to="dashboard" replace />} />

            {/* Module routes */}
            {dashboardRoutes}
            {productRoutes}
            {categoryRoutes}
            {orderRoutes}
            {returnRoutes}
            {userRoutes}
            {couponRoutes}
          </Route>
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
