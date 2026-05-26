import { API_ENDPOINTS } from '../../shared/config/apiConfig';
import axiosInstance from '../../shared/config/axiosInstance';

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
    const res = await axiosInstance.get(API_ENDPOINTS.AUTH.VERIFY_EMAIL, {
      params: { token },
    });
    return res.data;
  },

  /**
   * Gửi lại email xác thực
   * POST /api/auth/resend-verification
   * Body: { email }
   */
  resendVerification: async (email) => {
    const res = await axiosInstance.post(API_ENDPOINTS.AUTH.RESEND_VERIFICATION, { 
      email 
    });
    return res.data;
  },

  /**
   * Quên mật khẩu — gửi email reset
   * POST /api/auth/forgot-password
   * Body: { email }
   */
  forgotPassword: async (email) => {
    const res = await axiosInstance.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
    return res.data;
  },

  /**
   * Đặt lại mật khẩu
   * POST /api/auth/reset-password
   * Body: { token, newPassword, confirmPassword }
   */
  resetPassword: async ({ token, newPassword, confirmPassword }) => {
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