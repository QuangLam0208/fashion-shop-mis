import axiosInstance from '../../shared/config/axiosInstance';

export const customerOrderService = {
  // Lấy danh sách lịch sử đơn hàng (Backend tự lấy userId từ Token - Đảm bảo AC-US28-01)
  getOrders: async () => {
    const res = await axiosInstance.get('/api/orders/history');
    // Xử lý linh hoạt cấu trúc BaseResponse<List<OrderSummaryDTO>>
    return res.data || res; 
  },

  // Lấy chi tiết đơn hàng
  getOrderDetail: async (id) => {
    const res = await axiosInstance.get(`/api/orders/${id}`);
    return res.data || res;
  },
  
  // API Hủy đơn hàng (giữ nguyên từ US-27)
  cancelOrder: async (payload) => {
    const { orderId, reason } = payload;
    const res = await axiosInstance.post(`/api/orders/${orderId}/cancel`, { reason });
    return res.data;
  }
};