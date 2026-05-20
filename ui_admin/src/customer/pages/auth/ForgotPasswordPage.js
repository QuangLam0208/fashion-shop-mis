// src/customer/pages/auth/ForgotPasswordPage.js
import React, { useState } from 'react';
import { Form, Input, Button, message, Result } from 'antd';
import { MailOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import customerAuthService from '../../services/customerAuthService';
import './CustomerLoginPage.css';

const ForgotPasswordPage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [sent, setSent]       = useState(false);
  const [sentEmail, setSentEmail] = useState('');

  const onFinish = async ({ email }) => {
    setLoading(true);
    try {
      await customerAuthService.forgotPassword(email);
      setSentEmail(email);
      setSent(true);
    } catch (err) {
      message.error(err?.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  // ── Sau khi gửi email thành công
  if (sent) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#faf8f5' }}>
        <div style={{ background: '#fff', borderRadius: 16, padding: '48px 40px', width: 440, boxShadow: '0 8px 40px rgba(0,0,0,0.08)', textAlign: 'center' }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>📧</div>
          <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.75rem', color: '#1a1a1a', marginBottom: 12 }}>
            Kiểm tra email của bạn
          </h2>
          <p style={{ color: '#666', lineHeight: 1.7, marginBottom: 8 }}>
            Chúng tôi đã gửi link đặt lại mật khẩu tới:
          </p>
          <p style={{ fontWeight: 700, color: '#c9a96e', marginBottom: 24, fontSize: '1rem' }}>{sentEmail}</p>
          <p style={{ color: '#888', fontSize: 13, marginBottom: 32 }}>
            Không nhận được email? Kiểm tra thư mục spam hoặc{' '}
            <button
              onClick={() => { setSent(false); form.resetFields(); }}
              style={{ background: 'none', border: 'none', color: '#c9a96e', cursor: 'pointer', fontWeight: 600, fontSize: 13, padding: 0 }}
            >
              thử lại
            </button>
          </p>
          <Link to="/login">
            <Button block style={{ borderColor: '#1a1a1a', color: '#1a1a1a', height: 44, fontWeight: 600 }}>
              <ArrowLeftOutlined /> Quay lại đăng nhập
            </Button>
          </Link>
        </div>
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
            Quên mật khẩu?
          </h1>
          <p style={{ color: '#888', margin: 0, lineHeight: 1.6 }}>
            Nhập email đăng ký của bạn. Chúng tôi sẽ gửi link đặt lại mật khẩu.
          </p>
        </div>

        <Form form={form} layout="vertical" onFinish={onFinish} requiredMark={false} size="large">
          <Form.Item name="email" label="Email"
            rules={[{ required: true, message: 'Vui lòng nhập email' }, { type: 'email', message: 'Email không hợp lệ' }]}>
            <Input prefix={<MailOutlined style={{ color: '#999' }} />} placeholder="example@email.com" className="cl-input"
              autoFocus autoComplete="email" />
          </Form.Item>

          <Form.Item style={{ marginTop: 8 }}>
            <Button type="primary" htmlType="submit" loading={loading} block className="cl-btn-submit">
              {loading ? 'Đang gửi...' : 'Gửi link đặt lại mật khẩu'}
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <Link to="/login" style={{ color: '#666', fontSize: 14, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <ArrowLeftOutlined /> Quay lại đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;