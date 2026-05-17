// src/admin/routes/index.js
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import PrivateRoute from '../components/PrivateRoute';
import MainLayout   from '../layouts/MainLayout';
import LoginPage    from '../pages/LoginPage';
import NotFoundPage from '../pages/NotFoundPage';

import dashboardRoutes from './dashboardRoutes';
import productRoutes   from './productRoutes';
import categoryRoutes  from './categoryRoutes';
import orderRoutes     from './orderRoutes';
import returnRoutes    from './returnRoutes';
import userRoutes      from './userRoutes';
import couponRoutes    from './couponRoutes';

/**
 * AdminRoutes — nhận /*  từ App.js (path="/admin/*")
 * Các path ở đây là TƯƠNG ĐỐI với /admin/
 */
const AdminRoutes = () => (
  <Routes>
    {/* Public */}
    <Route path="login" element={<LoginPage />} />

    {/* Redirect /admin → /admin/dashboard */}
    <Route index element={<Navigate to="dashboard" replace />} />

    {/* Protected */}
    <Route element={<PrivateRoute />}>
      <Route element={<MainLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        {dashboardRoutes}
        {productRoutes}
        {categoryRoutes}
        {orderRoutes}
        {returnRoutes}
        {userRoutes}
        {couponRoutes}
      </Route>
    </Route>

    <Route path="*" element={<NotFoundPage />} />
  </Routes>
);

export default AdminRoutes;