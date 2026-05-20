// src/customer/pages/auth/ResetPasswordPage.js
import React, { useState, useEffect } from 'react';
import { Form, Input, Button, message, Result } from 'antd';
import { LockOutlined, EyeTwoTone, EyeInvisibleOutlined } from '@ant-design/icons';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import customerAuthService from '../../services/customerAuthService';

const ResetPasswordPage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading]   = useState(false);
  const [success, setSuccess]   = useState(false);
  const [searchParams]          = useSearchParams();
  const navigate                = useNavigate();

  // Token lấy từ URL: /reset-password?token=xxx
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      message.error('Link đặt lại mật khẩu không hợp lệ.');
    }
  }, [token]);

  const onFinish = async (values) => {
    if (!token) {
      message.error('Token không hợp lệ. Vui lòng yêu cầu lại link mới.');
      return;
    }
    setLoading(true);
    try {
      await customerAuthService.resetPassword({
        token,
        newPassword:     values.newPassword,
        confirmPassword: values.confirmPassword,
      });
      setSuccess(true);
    } catch (err) {
      message.error(
        err?.response?.data?.message ||
        'Link đã hết hạn hoặc không hợp lệ. Vui lòng yêu cầu lại.'
      );
    } finally {
      setLoading(false);
    }
  };

  // ── Thành công
  if (success) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#faf8f5' }}>
        <div style={{ background: '#fff', borderRadius: 16, padding: '48px 40px', width: 440, boxShadow: '0 8px 40px rgba(0,0,0,0.08)', textAlign: 'center' }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>🎉</div>
          <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.75rem', color: '#1a1a1a', marginBottom: 12 }}>
            Đặt lại thành công!
          </h2>
          <p style={{ color: '#666', lineHeight: 1.7, marginBottom: 32 }}>
            Mật khẩu của bạn đã được cập nhật. Bạn có thể đăng nhập với mật khẩu mới.
          </p>
          <Button
            type="primary"
            block
            size="large"
            onClick={() => navigate('/login')}
            style={{ background: '#1a1a1a', border: 'none', height: 48, fontWeight: 700, letterSpacing: 1 }}
          >
            Đăng nhập ngay
          </Button>
        </div>
      </div>
    );
  }

  // ── Token không có trong URL
  if (!token) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#faf8f5' }}>
        <Result
          status="error"
          title="Link không hợp lệ"
          subTitle="Link đặt lại mật khẩu không đúng hoặc đã hết hạn."
          extra={[
            <Link key="fp" to="/forgot-password">
              <Button type="primary">Yêu cầu link mới</Button>
            </Link>,
            <Link key="login" to="/login">
              <Button>Về đăng nhập</Button>
            </Link>,
          ]}
        />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#faf8f5' }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: '48px 40px', width: 440, boxShadow: '0 8px 40px rgba(0,0,0,0.08)' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, fontWeight: 700, letterSpacing: 3, color: '#1a1a1a' }}>
            ✦ FASHION
          </div>
        </div>

        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.75rem', color: '#1a1a1a', margin: '0 0 8px' }}>
            Đặt lại mật khẩu
          </h1>
          <p style={{ color: '#888', margin: 0, lineHeight: 1.6 }}>
            Nhập mật khẩu mới cho tài khoản của bạn.
          </p>
        </div>

        <Form form={form} layout="vertical" onFinish={onFinish} requiredMark={false} size="large">
          <Form.Item
            name="newPassword"
            label="Mật khẩu mới"
            hasFeedback
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu mới' },
              { min: 8, message: 'Mật khẩu ít nhất 8 ký tự' },
              { pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, message: 'Phải có chữ hoa, chữ thường và số' },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: '#999' }} />}
              placeholder="Ít nhất 8 ký tự"
              autoFocus
              iconRender={(v) => v ? <EyeTwoTone twoToneColor="#c9a96e" /> : <EyeInvisibleOutlined />}
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="Xác nhận mật khẩu mới"
            dependencies={['newPassword']}
            hasFeedback
            rules={[
              { required: true, message: 'Vui lòng xác nhận mật khẩu' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) return Promise.resolve();
                  return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: '#999' }} />}
              placeholder="Nhập lại mật khẩu mới"
              iconRender={(v) => v ? <EyeTwoTone twoToneColor="#c9a96e" /> : <EyeInvisibleOutlined />}
            />
          </Form.Item>

          {/* Gợi ý độ mạnh */}
          <div style={{ background: '#faf8f5', borderRadius: 8, padding: '10px 14px', marginBottom: 20, fontSize: 12, color: '#888' }}>
            💡 Mật khẩu mạnh cần: ít nhất 8 ký tự, có chữ hoa, chữ thường và số.
          </div>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              style={{ background: '#1a1a1a', border: 'none', height: 50, fontWeight: 700, letterSpacing: 1, fontSize: '0.9rem' }}
            >
              {loading ? 'Đang cập nhật...' : 'Đặt lại mật khẩu'}
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: 'center' }}>
          <Link to="/login" style={{ color: '#888', fontSize: 13 }}>
            ← Quay lại đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;