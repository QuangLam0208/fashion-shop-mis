import axiosInstance from '../../shared/config/axiosInstance';

export const customerOrderService = {
  // Lấy danh sách đơn hàng (Khớp với @GetMapping("/list"))
  getOrders: async (params) => {
    const res = await axiosInstance.get('/api/orders/list', { params });
    return res.data;
  },

  // Lấy chi tiết đơn hàng (Khớp với @GetMapping("/{orderId}"))
  getOrderDetail: async (id) => {
    const res = await axiosInstance.get(`/api/orders/${id}`);
    return res.data;
  },
  
  // Hủy đơn hàng (Khớp với @PostMapping("/{orderId}/cancel"))
  cancelOrder: async (payload) => {
    // payload từ UI truyền xuống: { orderId: 456, reason: "..." }
    const { orderId, reason } = payload;
    
    // Đổi thành method POST và gắn orderId lên URL theo đúng Controller Backend
    const res = await axiosInstance.post(`/api/orders/${orderId}/cancel`, {
      cancellationReason: reason 
    });
    return res.data;
  },
};