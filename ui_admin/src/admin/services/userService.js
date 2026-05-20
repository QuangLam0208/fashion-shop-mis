import { API_ENDPOINTS } from '../../shared/config/apiConfig';
import axiosInstance from '../../shared/config/axiosInstance';

export const adminUserService = {
  /**
   * Lấy danh sách khách hàng
   * GET /api/admin/users
   * params: { keyword, status, page, limit }
   */
  getAll: async (params = {}) => {
    const res = await axiosInstance.get(API_ENDPOINTS.ADMIN_USERS.GET_ALL, { params });
    return res.data;
  },

  /**
   * Chi tiết khách hàng
   * GET /api/admin/users/:id
   */
  getById: async (id) => {
    const res = await axiosInstance.get(API_ENDPOINTS.ADMIN_USERS.GET_BY_ID(id));
    return res.data;
  },

  /**
   * Khoá / Mở khoá tài khoản
   * PUT /api/admin/users/:id/toggle-status
   */
  toggleStatus: async (id) => {
    const res = await axiosInstance.put(API_ENDPOINTS.ADMIN_USERS.TOGGLE_STATUS(id));
    return res.data;
  },

  /**
   * Lịch sử đơn hàng của 1 khách
   * GET /api/admin/users/:id/orders
   */
  getOrders: async (id) => {
    const res = await axiosInstance.get(API_ENDPOINTS.ADMIN_USERS.GET_ORDERS(id));
    return res.data;
  },
};