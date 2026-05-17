import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { Spin } from 'antd';
import useAuth from '../hooks/useAuth';

/**
 * PrivateRoute — bảo vệ các route yêu cầu đăng nhập
 *
 * - Đang load (khởi tạo từ localStorage) → hiển thị spinner
 * - Chưa đăng nhập → redirect về /login
 * - Đã đăng nhập → render <Outlet /> (các route con)
 */
const PrivateRoute = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          background: '#f0f2f5',
        }}
      >
        <Spin size="large" tip="Đang tải..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;
