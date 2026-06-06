import axiosInstance from '../../shared/config/axiosInstance';

export const orderService = {
  /** Lấy danh sách đơn hàng (có phân trang, filter) */
  getOrders: async (params) => {
    // params: { status, startDate, endDate, page, size }
    const res = await axiosInstance.get('/api/admin/orders/list', { params });
    return res.data;
  },

  /** Xem chi tiết đơn hàng */
  getOrderDetail: async (orderId) => {
    const res = await axiosInstance.get(`/api/admin/orders/${orderId}`);
    return res.data;
  },

  /** Cập nhật trạng thái TOÀN BỘ đơn hàng */
  updateOrderStatus: async (orderId, status) => {
    const res = await axiosInstance.patch(`/api/admin/orders/${orderId}/status?status=${status}`);
    return res.data;
  },

  /** Cập nhật trạng thái TỪNG ITEM trong đơn hàng */
  updateOrderItemStatus: async (itemId, status) => {
    const res = await axiosInstance.patch(`/api/admin/orders/items/${itemId}/status?status=${status}`);
    return res.data;
  },
  
  /** (Bonus) Cập nhật trạng thái hoàn tiền cho từng Item */
  updateOrderItemRefundStatus: async (itemId, status) => {
    const res = await axiosInstance.patch(`/api/admin/orders/items/${itemId}/refund-status?status=${status}`);
    return res.data;
  }
};