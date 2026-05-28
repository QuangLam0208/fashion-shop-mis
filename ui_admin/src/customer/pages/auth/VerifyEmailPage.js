// src/customer/pages/auth/VerifyEmailPage.js
import React, { useEffect, useState, useRef } from 'react';
import { Spin, Result, Button, Form, Input, message } from 'antd';
import { MailOutlined } from '@ant-design/icons';
import { Link, useSearchParams } from 'react-router-dom';
import customerAuthService from '../../services/customerAuthService';

/**
 * VerifyEmailPage
 * Route: /verify-email?token=xxx
 *
 * Fix: dùng useRef để chặn React StrictMode double-invoke useEffect,
 * tránh gọi API 2 lần → token bị consumed lần đầu → lần 2 báo 400.
 */
const VerifyEmailPage = () => {
  const [searchParams]          = useSearchParams();
  const token                   = searchParams.get('token');
  const [status, setStatus]     = useState('loading'); // 'loading' | 'success' | 'error'
  const [errorMsg, setErrorMsg] = useState('');

  // State cho việc gửi lại email
  const [showResendForm, setShowResendForm] = useState(false);
  const [resendLoading, setResendLoading]   = useState(false);

  // Guard chặn StrictMode gọi 2 lần
  const calledRef = useRef(false);

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setErrorMsg('Không tìm thấy token xác thực. Vui lòng kiểm tra lại link trong email.');
      return;
    }

    // Nếu đã gọi rồi (StrictMode unmount→remount) thì bỏ qua
    if (calledRef.current) return;
    calledRef.current = true;

    customerAuthService
      .verifyEmail(token)
      .then(() => setStatus('success'))
      .catch((err) => {
        setStatus('error');
        setErrorMsg(
          err?.response?.data?.message ||
          'Link xác thực đã hết hạn hoặc không hợp lệ.'
        );
      });
  }, [token]);

  // Xử lý submit form gửi lại email xác thực
  const handleResend = async (values) => {
    setResendLoading(true);
    try {
      const res = await customerAuthService.resendVerification(values.email);
      message.success(res.message || 'Liên kết xác thực mới đã được gửi vào email của bạn!');
      setShowResendForm(false);
    } catch (err) {
      message.error(err?.response?.data?.message || err.message || 'Không thể gửi lại email xác thực. Vui lòng kiểm tra lại.');
    } finally {
      setResendLoading(false);
    }
  };

  // ── Loading
  if (status === 'loading') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16, background: '#faf8f5' }}>
        <Spin size="large" />
        <p style={{ color: '#666', fontFamily: 'Lato, sans-serif' }}>Đang xác thực email của bạn...</p>
      </div>
    );
  }

  // ── Thành công
  if (status === 'success') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#faf8f5' }}>
        <div style={{ background: '#fff', borderRadius: 16, padding: '48px 40px', width: 480, boxShadow: '0 8px 40px rgba(0,0,0,0.08)', textAlign: 'center' }}>
          <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 20, fontWeight: 700, letterSpacing: 3, color: '#1a1a1a', marginBottom: 32 }}>
            ✦ FASHION
          </div>
          <div style={{ fontSize: 64, marginBottom: 16 }}>✅</div>
          <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.75rem', color: '#1a1a1a', marginBottom: 12 }}>
            Xác thực thành công!
          </h2>
          <p style={{ color: '#666', lineHeight: 1.7, marginBottom: 32 }}>
            Email của bạn đã được xác thực. Tài khoản đã kích hoạt — bạn có thể đăng nhập và mua sắm ngay!
          </p>
          <Link to="/login">
            <Button type="primary" block size="large"
              style={{ background: '#1a1a1a', border: 'none', height: 50, fontWeight: 700, letterSpacing: 1 }}>
              Đăng nhập ngay
            </Button>
          </Link>
          <div style={{ marginTop: 16 }}>
            <Link to="/" style={{ color: '#888', fontSize: 13 }}>Về trang chủ</Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Lỗi (Thêm tính năng gửi lại Email)
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#faf8f5' }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: '48px 40px', width: 480, boxShadow: '0 8px 40px rgba(0,0,0,0.08)', textAlign: 'center' }}>
        <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 20, fontWeight: 700, letterSpacing: 3, color: '#1a1a1a', marginBottom: 32 }}>
          ✦ FASHION
        </div>
        
        <Result
          status="error"
          title="Xác thực thất bại"
          subTitle={errorMsg}
          extra={[
            <Button 
              key="resend" 
              onClick={() => setShowResendForm(!showResendForm)}
            >
              {showResendForm ? 'Hủy thao tác' : 'Gửi lại link xác thực'}
            </Button>,
            <Link key="login" to="/login">
              <Button type="primary" style={{ background: '#1a1a1a', border: 'none' }}>
                Về đăng nhập
              </Button>
            </Link>,
          ]}
        />

        {/* Form nhập email gửi lại mã kích hoạt */}
        {showResendForm && (
          <div style={{ marginTop: 24, paddingTop: 24, borderTop: '1px solid #f0f0f0', textAlign: 'left' }}>
            <p style={{ color: '#666', marginBottom: 16 }}>
              Nhập email bạn đã đăng ký để nhận lại liên kết kích hoạt mới:
            </p>
            <Form layout="vertical" onFinish={handleResend}>
              <Form.Item
                name="email"
                rules={[
                  { required: true, message: 'Vui lòng nhập địa chỉ Email!' },
                  { type: 'email', message: 'Email không đúng định dạng!' }
                ]}
              >
                <Input 
                  prefix={<MailOutlined style={{ color: '#bfbfbf' }} />} 
                  placeholder="Nhập email của bạn" 
                  size="large" 
                />
              </Form.Item>
              <Form.Item style={{ marginBottom: 0 }}>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  loading={resendLoading} 
                  block 
                  size="large"
                  style={{ background: '#1a1a1a', border: 'none' }}
                >
                  Xác nhận gửi
                </Button>
              </Form.Item>
            </Form>
          </div>
        )}

      </div>
    </div>
  );
};

export default VerifyEmailPage;