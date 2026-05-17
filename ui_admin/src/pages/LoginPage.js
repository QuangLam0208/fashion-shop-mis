// ─────────────────────────────────────────────────────────────
//  pages/LoginPage.js
// ─────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, Alert, Divider } from 'antd';
import { UserOutlined, LockOutlined, ShopOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { USE_MOCK } from '../config/apiConfig';
import axiosInstance from '../config/axiosInstance';
import { API_ENDPOINTS } from '../config/apiConfig';

const { Title, Text } = Typography;

const MOCK_ADMIN = {
  user_id: 1,
  full_name: 'Admin Fashion',
  email: 'admin@fashion.com',
  role: 'ADMIN',
  status: 'ACTIVE',
};

const LoginPage = () => {
  const { login } = useAuth();
  const navigate   = useNavigate();
  const [loading, setLoading]   = useState(false);
  const [error,   setError]     = useState('');

  const handleLogin = async (values) => {
    setLoading(true);
    setError('');
    try {
      if (USE_MOCK) {
        // Mock: chấp nhận bất kỳ email/password nào
        await new Promise((r) => setTimeout(r, 600));
        login(MOCK_ADMIN, 'mock-jwt-token-admin');
        navigate('/admin/dashboard', { replace: true });
        return;
      }

      const res = await axiosInstance.post(API_ENDPOINTS.AUTH.LOGIN, {
        email:    values.email,
        password: values.password,
      });

      const { token, user } = res.data;
      login(user, token);
      navigate('/admin/dashboard', { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || 'Email hoặc mật khẩu không đúng';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <Card
        style={{
          width: '100%',
          maxWidth: 420,
          borderRadius: 16,
          boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
          border: 'none',
        }}
        bodyStyle={{ padding: '40px 36px' }}
      >
        {/* Logo & Title */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 64,
              height: 64,
              borderRadius: 16,
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              marginBottom: 16,
            }}
          >
            <ShopOutlined style={{ fontSize: 32, color: '#fff' }} />
          </div>
          <Title level={3} style={{ margin: 0, color: '#0f172a' }}>
            Fashion Admin
          </Title>
          <Text type="secondary" style={{ fontSize: 14 }}>
            Đăng nhập vào hệ thống quản trị
          </Text>
        </div>

        {error && (
          <Alert
            message={error}
            type="error"
            showIcon
            closable
            onClose={() => setError('')}
            style={{ marginBottom: 20, borderRadius: 8 }}
          />
        )}

        <Form
          layout="vertical"
          onFinish={handleLogin}
          initialValues={USE_MOCK ? { email: 'admin@fashion.com', password: '123456' } : {}}
          requiredMark={false}
          size="large"
        >
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Vui lòng nhập email' },
              { type: 'email', message: 'Email không hợp lệ' },
            ]}
          >
            <Input
              prefix={<UserOutlined style={{ color: '#94a3b8' }} />}
              placeholder="admin@fashion.com"
              autoComplete="email"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="Mật khẩu"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: '#94a3b8' }} />}
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, marginTop: 8 }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              style={{
                height: 48,
                fontWeight: 600,
                fontSize: 15,
                borderRadius: 10,
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                border: 'none',
              }}
            >
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </Button>
          </Form.Item>
        </Form>

        {USE_MOCK && (
          <>
            <Divider style={{ margin: '20px 0 12px' }} />
            <div
              style={{
                background: '#f0f4ff',
                border: '1px dashed #6366f1',
                borderRadius: 8,
                padding: '10px 14px',
                textAlign: 'center',
              }}
            >
              <Text style={{ fontSize: 12, color: '#6366f1' }}>
                🧪 <strong>Mock mode:</strong> nhập bất kỳ email/password nào
              </Text>
            </div>
          </>
        )}
      </Card>
    </div>
  );
};

export default LoginPage;
