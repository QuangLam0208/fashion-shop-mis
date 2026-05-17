// src/customer/services/customerAuthService.js
import { USE_MOCK, API_ENDPOINTS } from '../../shared/config/apiConfig';
import axiosInstance from '../../shared/config/axiosInstance';
import { mockUsers } from '../../shared/mocks/userMock';

/**
 * customerAuthService — xác thực khách hàng
 * Hỗ trợ USE_MOCK=true (không cần backend)
 */
const customerAuthService = {
  /**
   * Đăng nhập khách hàng
   * @param {string} email
   * @param {string} password
   * @returns {{ token: string, user: object }}
   */
  login: async (email, password) => {
    if (USE_MOCK) {
      // Tìm user trong mock data
      const user = mockUsers.find(
        (u) =>
          u.email === email &&
          u.role === 'CUSTOMER' &&
          u.status === 'ACTIVE'
      );
      if (!user) {
        // Giả lập lỗi 401 để CustomerAuthContext xử lý đúng
        const err = new Error('Email hoặc mật khẩu không đúng.');
        err.response = { data: { message: 'Email hoặc mật khẩu không đúng.' } };
        throw err;
      }
      // Trả về dữ liệu giả lập
      return {
        token: 'mock-customer-jwt-token-' + user.user_id,
        user: {
          user_id: user.user_id,
          full_name: user.full_name,
          email: user.email,
          phone: user.phone,
          avatar: user.avatar || null,
          role: user.role,
          status: user.status,
        },
      };
    }

    // Gọi API thật
    const res = await axiosInstance.post(API_ENDPOINTS.AUTH.LOGIN, {
      email,
      password,
    });
    return res.data; // { token, user }
  },

  /**
   * Đăng xuất
   */
  logout: async () => {
    if (USE_MOCK) return;
    await axiosInstance.post(API_ENDPOINTS.AUTH.LOGOUT);
  },

  /**
   * Lấy thông tin user hiện tại (dùng khi reload trang)
   */
  getMe: async () => {
    if (USE_MOCK) {
      const token = localStorage.getItem('fashion_customer_token');
      if (!token) return null;
      // Lấy user_id từ mock token
      const userId = parseInt(token.replace('mock-customer-jwt-token-', ''), 10);
      const user = mockUsers.find((u) => u.user_id === userId);
      return user || null;
    }
    const res = await axiosInstance.get(API_ENDPOINTS.AUTH.ME);
    return res.data;
  },

  /**
   * Đăng ký tài khoản mới
   */
  register: async (data) => {
    if (USE_MOCK) {
      // Giả lập đăng ký thành công
      return { message: 'Đăng ký thành công! Vui lòng kiểm tra email để xác nhận.' };
    }
    const res = await axiosInstance.post(API_ENDPOINTS.AUTH.REGISTER, data);
    return res.data;
  },

  /**
   * Quên mật khẩu — gửi email reset
   */
  forgotPassword: async (email) => {
    if (USE_MOCK) {
      return { message: 'Link đặt lại mật khẩu đã được gửi tới email của bạn.' };
    }
    const res = await axiosInstance.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
    return res.data;
  },
};

export default customerAuthService;