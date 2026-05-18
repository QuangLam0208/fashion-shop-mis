// src/customer/pages/auth/RegisterPage.js
import React, { useState, useEffect } from 'react';
import { Form, Input, Button, message, Divider, Checkbox } from 'antd';
import {
  UserOutlined, MailOutlined, PhoneOutlined,
  LockOutlined, EyeTwoTone, EyeInvisibleOutlined,
} from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import customerAuthService from '../../services/customerAuthService';
import useCustomerAuth from '../../hooks/useCustomerAuth';
import './CustomerLoginPage.css';

const RegisterPage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useCustomerAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) navigate('/', { replace: true });
  }, [isAuthenticated, navigate]);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await customerAuthService.register({
        fullName: values.fullName,
        email: values.email,
        phone: values.phone,
        password: values.password,
        confirmPassword: values.confirmPassword,
      });
      message.success('Đăng ký thành công! Vui lòng kiểm tra email để xác nhận tài khoản.', 5);
      navigate('/login');
    } catch (err) {
      message.error(err?.response?.data?.message || 'Đăng ký thất bại, vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cl-page">
      {/* Cột trái */}
      <div className="cl-visual" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=900&q=80')" }}>
        <div className="cl-visual__overlay" />
        <div className="cl-visual__content">
          <div className="cl-brand">
            <span className="cl-brand__icon">✦</span>
            <span className="cl-brand__name">FASHION</span>
          </div>
          <h2 className="cl-visual__tagline">Bắt đầu hành trình<br />thời trang của bạn.</h2>
          <p className="cl-visual__sub">Tham gia cộng đồng hàng ngàn khách hàng yêu thời trang. Nhận ưu đãi độc quyền ngay khi đăng ký.</p>
          <div className="cl-visual__badges">
            <span className="cl-badge">🎁 Ưu đãi thành viên mới</span>
            <span className="cl-badge">🔔 Thông báo deal hot</span>
            <span className="cl-badge">⭐ Tích điểm đổi quà</span>
          </div>
        </div>
      </div>

      {/* Cột phải */}
      <div className="cl-form-col">
        <div className="cl-form-wrap">
          <div className="cl-brand cl-brand--mobile">
            <span className="cl-brand__icon">✦</span>
            <span className="cl-brand__name">FASHION</span>
          </div>
          <div className="cl-form-header">
            <h1 className="cl-form-title">Tạo tài khoản</h1>
          </div>

          <Form form={form} layout="vertical" onFinish={onFinish} requiredMark={false} size="large">
            <Form.Item name="fullName" label="Họ và tên"
              rules={[{ required: true, message: 'Vui lòng nhập họ và tên' }, { min: 2, message: 'Tên phải có ít nhất 2 ký tự' }]}>
              <Input prefix={<UserOutlined className="cl-input-icon" />} placeholder="Nguyễn Văn A" className="cl-input" />
            </Form.Item>

            <Form.Item name="email" label="Email"
              rules={[{ required: true, message: 'Vui lòng nhập email' }, { type: 'email', message: 'Email không hợp lệ' }]}>
              <Input prefix={<MailOutlined className="cl-input-icon" />} placeholder="example@email.com" className="cl-input" />
            </Form.Item>

            <Form.Item name="phone" label="Số điện thoại"
              rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }, { pattern: /^(0[3|5|7|8|9])+([0-9]{8})$/, message: 'Số điện thoại không hợp lệ (VD: 0912345678)' }]}>
              <Input prefix={<PhoneOutlined className="cl-input-icon" />} placeholder="0912 345 678" className="cl-input" />
            </Form.Item>

            <Form.Item name="password" label="Mật khẩu" hasFeedback
              rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }, { min: 8, message: 'Mật khẩu ít nhất 8 ký tự' }, { pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, message: 'Phải có chữ hoa, chữ thường và số' }]}>
              <Input.Password prefix={<LockOutlined className="cl-input-icon" />} placeholder="Ít nhất 8 ký tự" className="cl-input"
                iconRender={(v) => v ? <EyeTwoTone twoToneColor="#c9a96e" /> : <EyeInvisibleOutlined />} />
            </Form.Item>

            <Form.Item name="confirmPassword" label="Xác nhận mật khẩu" dependencies={['password']} hasFeedback
              rules={[{ required: true, message: 'Vui lòng xác nhận mật khẩu' },
                ({ getFieldValue }) => ({ validator(_, value) { if (!value || getFieldValue('password') === value) return Promise.resolve(); return Promise.reject(new Error('Mật khẩu xác nhận không khớp!')); } })]}>
              <Input.Password prefix={<LockOutlined className="cl-input-icon" />} placeholder="Nhập lại mật khẩu" className="cl-input"
                iconRender={(v) => v ? <EyeTwoTone twoToneColor="#c9a96e" /> : <EyeInvisibleOutlined />} />
            </Form.Item>

            <Form.Item name="agree" valuePropName="checked"
              rules={[{ validator: (_, value) => value ? Promise.resolve() : Promise.reject(new Error('Vui lòng đồng ý với điều khoản')) }]}>
              <Checkbox className="cl-checkbox">
                Tôi đồng ý với <Link to="/terms" className="cl-link">Điều khoản sử dụng</Link> và <Link to="/privacy" className="cl-link">Chính sách bảo mật</Link>
              </Checkbox>
            </Form.Item>

            <Form.Item style={{ marginTop: 8 }}>
              <Button type="primary" htmlType="submit" loading={loading} block className="cl-btn-submit">
                {loading ? 'Đang tạo tài khoản...' : 'Tạo tài khoản'}
              </Button>
            </Form.Item>
          </Form>

          <Divider className="cl-divider"><span className="cl-divider-text">Đã có tài khoản?</span></Divider>
          <Link to="/login"><Button block className="cl-btn-register">Đăng nhập</Button></Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;