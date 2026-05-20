import { API_ENDPOINTS } from '../../shared/config/apiConfig';
import axiosInstance from '../../shared/config/axiosInstance';

export const authService = {
  /**
   * Đăng nhập Admin
   * POST /api/auth/login
   * payload: { email, password }
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
   * Lấy thông tin Profile người dùng hiện tại dựa vào Token
   * GET /api/auth/profile
   */
  getProfile: async () => {
    const endpoint = API_ENDPOINTS.AUTH?.PROFILE || '/api/auth/profile';
    const res = await axiosInstance.get(endpoint);
    return res.data;
  },

  /**
   * Đăng xuất (Thường frontend chỉ xoá token, nhưng nếu backend yêu cầu gọi API để blacklist token thì viết ở đây)
   * POST /api/auth/logout
   */
  logout: async () => {
    
    // Nếu backend có endpoint logout
    // const endpoint = API_ENDPOINTS.AUTH?.LOGOUT || '/api/auth/logout';
    // await axiosInstance.post(endpoint);
    
    return true;
  }
};