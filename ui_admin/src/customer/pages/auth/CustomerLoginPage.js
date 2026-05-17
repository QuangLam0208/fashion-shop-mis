// src/customer/pages/auth/CustomerLoginPage.js
import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Checkbox, Divider, message } from 'antd';
import { MailOutlined, LockOutlined, EyeTwoTone, EyeInvisibleOutlined } from '@ant-design/icons';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useCustomerAuth } from '../../hooks/useCustomerAuth';
import './CustomerLoginPage.css';

const CustomerLoginPage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated } = useCustomerAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect nếu đã đăng nhập
  const from = location.state?.from?.pathname || '/';
  useEffect(() => {
    if (isAuthenticated) navigate(from, { replace: true });
  }, [isAuthenticated, navigate, from]);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await login(values.email, values.password, values.remember);
      message.success('Đăng nhập thành công! Chào mừng bạn trở lại 👋');
      navigate(from, { replace: true });
    } catch (err) {
      const msg = err?.response?.data?.message || 'Email hoặc mật khẩu không đúng.';
      message.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cl-page">
      {/* Cột trái — hình ảnh thương hiệu */}
      <div className="cl-visual">
        <div className="cl-visual__overlay" />
        <div className="cl-visual__content">
          <div className="cl-brand">
            <span className="cl-brand__icon">✦</span>
            <span className="cl-brand__name">FASHION</span>
          </div>
          <h2 className="cl-visual__tagline">
            Phong cách của bạn,<br />câu chuyện của bạn.
          </h2>
          <p className="cl-visual__sub">
            Khám phá bộ sưu tập mới nhất — hàng ngàn thiết kế đang chờ bạn.
          </p>
          <div className="cl-visual__badges">
            <span className="cl-badge">🚚 Miễn phí vận chuyển</span>
            <span className="cl-badge">↩️ Đổi trả 30 ngày</span>
            <span className="cl-badge">💳 Thanh toán an toàn</span>
          </div>
        </div>
      </div>

      {/* Cột phải — form đăng nhập */}
      <div className="cl-form-col">
        <div className="cl-form-wrap">
          {/* Logo mobile */}
          <div className="cl-brand cl-brand--mobile">
            <span className="cl-brand__icon">✦</span>
            <span className="cl-brand__name">FASHION</span>
          </div>

          <div className="cl-form-header">
            <h1 className="cl-form-title">Đăng nhập</h1>
            <p className="cl-form-sub">
              Chưa có tài khoản?{' '}
              <Link to="/register" className="cl-link">Đăng ký ngay</Link>
            </p>
          </div>

          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
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
                prefix={<MailOutlined className="cl-input-icon" />}
                placeholder="example@email.com"
                className="cl-input"
                autoComplete="email"
              />
            </Form.Item>

            <Form.Item
              name="password"
              label="Mật khẩu"
              rules={[
                { required: true, message: 'Vui lòng nhập mật khẩu' },
                { min: 6, message: 'Mật khẩu ít nhất 6 ký tự' },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined className="cl-input-icon" />}
                placeholder="••••••••"
                className="cl-input"
                autoComplete="current-password"
                iconRender={(visible) =>
                  visible ? <EyeTwoTone twoToneColor="#c9a96e" /> : <EyeInvisibleOutlined />
                }
              />
            </Form.Item>

            <div className="cl-form-row">
              <Form.Item name="remember" valuePropName="checked" noStyle>
                <Checkbox className="cl-checkbox">Ghi nhớ đăng nhập</Checkbox>
              </Form.Item>
              <Link to="/forgot-password" className="cl-link cl-link--forgot">
                Quên mật khẩu?
              </Link>
            </div>

            <Form.Item style={{ marginTop: 24 }}>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                className="cl-btn-submit"
              >
                {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
              </Button>
            </Form.Item>
          </Form>

          <Divider className="cl-divider">
            <span className="cl-divider-text">hoặc</span>
          </Divider>

          <div className="cl-register-cta">
            <p>Bạn chưa có tài khoản?</p>
            <Link to="/register">
              <Button block className="cl-btn-register">
                Tạo tài khoản mới
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerLoginPage;