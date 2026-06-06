import axiosInstance from '../../shared/config/axiosInstance';

export const customerOrderService = {
  // Lấy danh sách đơn hàng của khách
  getMyOrders: async (params) => {
    const res = await axiosInstance.get('/api/orders/list', { params });
    return res.data;
  },
  
  // Lấy chi tiết đơn hàng
  getOrderDetail: async (orderId) => {
    const res = await axiosInstance.get(`/api/orders/${orderId}`);
    return res.data;
  },

  // Hủy đơn hàng (Chỉ hủy được khi PENDING_CONFIRMATION)
  cancelOrder: async (orderId, reason) => {
    const res = await axiosInstance.post(`/api/orders/${orderId}/cancel`, { reason });
    return res.data;
  }
};