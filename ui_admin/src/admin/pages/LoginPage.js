// src/admin/pages/LoginPage.js
import React, { useState, useEffect } from 'react';
import { Form, Input, Button, message, Typography } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const { Title, Text } = Typography;

const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) navigate('/admin/dashboard', { replace: true });
  }, [isAuthenticated, navigate]);

  const onFinish = async ({ email, password }) => {
    setLoading(true);
    try {
      await login(email, password);
      message.success('Đăng nhập thành công!');
      navigate('/admin/dashboard', { replace: true });
    } catch (err) {
      message.error(err?.response?.data?.message || 'Sai email hoặc mật khẩu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #001529 0%, #003a6b 100%)',
    }}>
      <div style={{
        background: '#fff', borderRadius: 12, padding: '48px 40px',
        width: 400, boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 32, color: '#1890ff', marginBottom: 8 }}>✦</div>
          <Title level={3} style={{ margin: 0, letterSpacing: 3 }}>FASHION ADMIN</Title>
          <Text type="secondary">Hệ thống quản trị</Text>
        </div>

        <Form layout="vertical" onFinish={onFinish} size="large">
          <Form.Item name="email" label="Email"
            rules={[{ required: true, message: 'Nhập email' }, { type: 'email', message: 'Email không hợp lệ' }]}>
            <Input prefix={<UserOutlined />} placeholder="admin@fashion.com" />
          </Form.Item>

          <Form.Item name="password" label="Mật khẩu"
            rules={[{ required: true, message: 'Nhập mật khẩu' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="••••••••" />
          </Form.Item>

          <Form.Item style={{ marginTop: 8 }}>
            <Button type="primary" htmlType="submit" block loading={loading}>
              Đăng nhập
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: 'center', marginTop: 8 }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Demo: admin@fashion.com / admin123
          </Text>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;