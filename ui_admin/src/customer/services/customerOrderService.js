import { API_ENDPOINTS } from '../../shared/config/apiConfig';
import axiosInstance from '../../shared/config/axiosInstance';

export const customerOrderService = {
  /**
   * Lấy danh sách đơn hàng của user hiện tại
   * params: { status, page, limit }
   */
  getOrders: async (params = {}) => {
    const res = await axiosInstance.get(API_ENDPOINTS.CUSTOMER.ORDERS, { params });
    return res.data;
  },

  /** Lấy chi tiết 1 đơn hàng */
  getById: async (orderId) => {
    const res = await axiosInstance.get(API_ENDPOINTS.CUSTOMER.ORDER_DETAIL(orderId));
    return res.data;
  },

  /** Huỷ đơn hàng (chỉ khi PENDING_CONFIRMATION) */
  cancelOrder: async (orderId) => {
    const res = await axiosInstance.put(
      `${API_ENDPOINTS.CUSTOMER.ORDERS}/${orderId}/cancel`
    );
    return res.data;
  },

  /**
   * Gửi yêu cầu trả hàng
   * payload: { order_id, reason, images[] }
   */
  requestReturn: async (orderId, payload) => {
    const res = await axiosInstance.post(
      `${API_ENDPOINTS.CUSTOMER.ORDERS}/${orderId}/return`,
      payload
    );
    return res.data;
  },
};