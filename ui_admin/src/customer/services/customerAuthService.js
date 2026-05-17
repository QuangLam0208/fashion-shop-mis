// src/customer/services/customerAuthService.js
import { USE_MOCK, API_ENDPOINTS } from '../../shared/config/apiConfig';
import axiosInstance from '../../shared/config/axiosInstance';
import { mockUsers } from '../../shared/mocks/userMock';

const STORAGE_KEY    = 'fashion_customer_token';
const REFRESH_KEY    = 'fashion_customer_refresh_token';

const customerAuthService = {
  /**
   * Đăng nhập
   * POST /api/auth/login
   * Body: { email, password, rememberMe }
   * Response: { token, refreshToken, user }
   */
  login: async (email, password, rememberMe = true) => {
    if (USE_MOCK) {
      const user = mockUsers.find(
        (u) => u.email === email && u.password === password
          && u.role === 'CUSTOMER' && u.status === 'ACTIVE'
      );
      if (!user) {
        const err = new Error('Email hoặc mật khẩu không đúng.');
        err.response = { data: { message: 'Email hoặc mật khẩu không đúng.' } };
        throw err;
      }
      return {
        token:        `mock-customer-jwt-${user.user_id}`,
        refreshToken: `mock-refresh-${user.user_id}`,
        user: {
          user_id:   user.user_id,
          full_name: user.full_name,
          email:     user.email,
          phone:     user.phone,
          avatar:    user.avatar || null,
          role:      user.role,
          status:    user.status,
        },
      };
    }

    const res = await axiosInstance.post(API_ENDPOINTS.AUTH.LOGIN, {
      email,
      password,
      rememberMe,
    });
    return res.data; // { token, refreshToken, user }
  },

  /**
   * Đăng xuất
   * POST /api/auth/logout
   * Body: { token } — gửi refreshToken
   */
  logout: async () => {
    const refreshToken = localStorage.getItem(REFRESH_KEY)
      || sessionStorage.getItem(REFRESH_KEY);

    // Xoá token cục bộ trước
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(REFRESH_KEY);
    sessionStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(REFRESH_KEY);

    if (USE_MOCK) return;

    try {
      await axiosInstance.post(API_ENDPOINTS.AUTH.LOGOUT, {
        token: refreshToken,
      });
    } catch {
      // Bỏ qua lỗi logout API — token cục bộ đã xoá
    }
  },

  /**
   * Làm mới token
   * POST /api/auth/refresh-token
   * Body: { refreshToken }
   * Response: { token, refreshToken }
   */
  refreshToken: async () => {
    const refreshToken = localStorage.getItem(REFRESH_KEY)
      || sessionStorage.getItem(REFRESH_KEY);
    if (!refreshToken) throw new Error('Không có refresh token.');

    if (USE_MOCK) {
      return {
        token:        `mock-customer-jwt-refreshed`,
        refreshToken: refreshToken,
      };
    }

    const res = await axiosInstance.post(API_ENDPOINTS.AUTH.REFRESH_TOKEN, {
      refreshToken,
    });
    return res.data; // { token, refreshToken }
  },

  /**
   * Đăng ký tài khoản
   * POST /api/auth/register
   * Body: { fullName, email, phone, password, confirmPassword }
   */
  register: async ({ fullName, email, phone, password, confirmPassword }) => {
    if (USE_MOCK) {
      const exists = mockUsers.find((u) => u.email === email);
      if (exists) {
        const err = new Error('Email đã được sử dụng.');
        err.response = { data: { message: 'Email đã được sử dụng.' } };
        throw err;
      }
      return {
        message: 'Đăng ký thành công! Vui lòng kiểm tra email để xác nhận tài khoản.',
      };
    }

    const res = await axiosInstance.post(API_ENDPOINTS.AUTH.REGISTER, {
      fullName,
      email,
      phone,
      password,
      confirmPassword,
    });
    return res.data;
  },

  /**
   * Xác thực email
   * GET /api/auth/verify-email?token=xxx
   */
  verifyEmail: async (token) => {
    if (USE_MOCK) {
      return { message: 'Xác thực email thành công! Bạn có thể đăng nhập ngay.' };
    }

    const res = await axiosInstance.get(API_ENDPOINTS.AUTH.VERIFY_EMAIL, {
      params: { token },
    });
    return res.data;
  },

  /**
   * Quên mật khẩu — gửi email reset
   * POST /api/auth/forgot-password
   * Body: { email }
   */
  forgotPassword: async (email) => {
    if (USE_MOCK) {
      return {
        message: 'Link đặt lại mật khẩu đã được gửi tới email của bạn. Vui lòng kiểm tra hộp thư.',
      };
    }

    const res = await axiosInstance.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
    return res.data;
  },

  /**
   * Đặt lại mật khẩu
   * POST /api/auth/reset-password
   * Body: { token, newPassword, confirmPassword }
   */
  resetPassword: async ({ token, newPassword, confirmPassword }) => {
    if (USE_MOCK) {
      return { message: 'Đặt lại mật khẩu thành công! Bạn có thể đăng nhập với mật khẩu mới.' };
    }

    const res = await axiosInstance.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, {
      token,
      newPassword,
      confirmPassword,
    });
    return res.data;
  },

  // ─── Helpers lưu token ───────────────────────────────────────
  saveTokens: ({ token, refreshToken }, remember = true) => {
    const storage = remember ? localStorage : sessionStorage;
    storage.setItem(STORAGE_KEY, token);
    if (refreshToken) storage.setItem(REFRESH_KEY, refreshToken);
    // Luôn lưu vào localStorage để axiosInstance lấy được
    if (!remember) localStorage.setItem(STORAGE_KEY, token);
  },

  clearTokens: () => {
    [STORAGE_KEY, REFRESH_KEY].forEach((k) => {
      localStorage.removeItem(k);
      sessionStorage.removeItem(k);
    });
  },

  getToken: () =>
    localStorage.getItem(STORAGE_KEY) || sessionStorage.getItem(STORAGE_KEY),

  getRefreshToken: () =>
    localStorage.getItem(REFRESH_KEY) || sessionStorage.getItem(REFRESH_KEY),
};

export default customerAuthService;