import { API_ENDPOINTS } from '../../shared/config/apiConfig';
import axiosInstance from '../../shared/config/axiosInstance';

export const adminOrderService = {
  /**
   * Lấy danh sách đơn hàng
   * GET /api/admin/orders
   * params: { keyword, status, type, payment_method, page, limit, sort }
   */
  getAll: async (params = {}) => {
    const res = await axiosInstance.get(API_ENDPOINTS.ADMIN_ORDERS.GET_ALL, { params });
    return res.data;
  },

  /**
   * Chi tiết đơn hàng
   * GET /api/admin/orders/:id
   */
  getById: async (id) => {
    const res = await axiosInstance.get(API_ENDPOINTS.ADMIN_ORDERS.GET_BY_ID(id));
    return res.data;
  },

  /**
   * Cập nhật trạng thái đơn hàng
   * PUT /api/admin/orders/:id/status
   * Body: { status }
   */
  updateStatus: async (id, status) => {
    const res = await axiosInstance.put(API_ENDPOINTS.ADMIN_ORDERS.UPDATE_STATUS(id), {
      status,
    });
    return res.data;
  },

  /**
   * Huỷ đơn hàng (admin)
   * PUT /api/admin/orders/:id/cancel
   * Body: { reason }
   */
  cancel: async (id, reason = '') => {
    const res = await axiosInstance.put(API_ENDPOINTS.ADMIN_ORDERS.CANCEL(id), { reason });
    return res.data;
  },

  /**
   * Tạo đơn hàng tại quầy (POS)
   * POST /api/admin/orders
   * Body: { customer_name, customer_phone, items[], payment_method, note }
   */
  createOffline: async (payload) => {
    const res = await axiosInstance.post(API_ENDPOINTS.ADMIN_ORDERS.CREATE, payload);
    return res.data;
  },

  /**
   * Tra cứu nhanh tồn kho cho POS
   */
  searchProductForPOS: async (keyword) => {
    const res = await axiosInstance.get(API_ENDPOINTS.ADMIN_PRODUCTS.GET_ALL, {
      params: { keyword, status: 'ACTIVE', limit: 10 },
    });
    return res.data?.data || [];
  },
};