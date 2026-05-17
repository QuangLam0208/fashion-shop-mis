// src/customer/pages/auth/VerifyEmailPage.js
import React, { useEffect, useState } from 'react';
import { Spin, Result, Button } from 'antd';
import { Link, useSearchParams } from 'react-router-dom';
import customerAuthService from '../../services/customerAuthService';

/**
 * VerifyEmailPage — user click link trong email → GET /api/auth/verify-email?token=xxx
 * Route: /verify-email?token=xxx
 */
const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'error'
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setErrorMsg('Không tìm thấy token xác thực. Vui lòng kiểm tra lại link trong email.');
      return;
    }

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
            <Button
              type="primary"
              block
              size="large"
              style={{ background: '#1a1a1a', border: 'none', height: 50, fontWeight: 700, letterSpacing: 1 }}
            >
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

  // ── Lỗi
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
            <Link key="login" to="/login">
              <Button type="primary" style={{ background: '#1a1a1a', border: 'none' }}>
                Về đăng nhập
              </Button>
            </Link>,
            <Link key="register" to="/register">
              <Button>Đăng ký lại</Button>
            </Link>,
          ]}
        />
      </div>
    </div>
  );
};

export default VerifyEmailPage;