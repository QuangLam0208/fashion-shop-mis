// src/admin/pages/NotFoundPage.js
import React from 'react';
import { Result, Button } from 'antd';
import { useNavigate } from 'react-router-dom';

const NotFoundPage = () => {
  const navigate = useNavigate();
  return (
    <Result
      status="404"
      title="404"
      subTitle="Trang bạn tìm không tồn tại."
      extra={<Button type="primary" onClick={() => navigate('/admin/dashboard')}>Về Dashboard</Button>}
    />
  );
};

export default NotFoundPage;