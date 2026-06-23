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
  updateOrderStatus: async (payload) => {
    // payload: { orderId: 101, status: "SHIPPING" }
    const res = await axiosInstance.put('/api/admin/orders/status', payload);
    return res.data;
  },

  /** Cập nhật trạng thái TỪNG ITEM trong đơn hàng */
  updateOrderItemStatus: async (itemId, targetStatus) => {
    // Gọi PATCH /api/admin/orders/items/{itemId}/status?status=COMPLETED
    const res = await axiosInstance.patch(`/api/admin/orders/items/${itemId}/status`, null, {
      params: { status: targetStatus }
    });
    return res.data;
  },
  
  /** (Bonus) Cập nhật trạng thái hoàn tiền cho từng Item */
  updateOrderItemRefundStatus: async (itemId, status) => {
    const res = await axiosInstance.patch(`/api/admin/orders/items/${itemId}/refund-status?status=${status}`);
    return res.data;
  },

  exportInvoicePDF: async (orderId) => {
    const res = await axiosInstance.get(`/api/admin/orders/${orderId}/pdf`, {
      responseType: 'blob' // AC-US47-01: Rất quan trọng để bắt đúng luồng mảng byte của PDF
    });
    return res.data;
  }
};