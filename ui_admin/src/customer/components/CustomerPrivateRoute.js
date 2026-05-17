// src/customer/components/CustomerPrivateRoute.js
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Spin } from 'antd';
import useCustomerAuth from '../hooks/useCustomerAuth';

const CustomerPrivateRoute = () => {
  const { isAuthenticated, loading } = useCustomerAuth();
  const location = useLocation();

  if (loading) return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Spin size="large" />
    </div>
  );

  return isAuthenticated
    ? <Outlet />
    : <Navigate to="/login" state={{ from: location }} replace />;
};

export default CustomerPrivateRoute;