import axiosInstance from '../../shared/config/axiosInstance';

export const userService = {
  // Lấy danh sách khách hàng (có tìm kiếm và phân trang)
  getCustomers: async (params = {}) => {
    const res = await axiosInstance.get('/api/admin/customers', { params });
    return res.data;
  },

  // Lấy chi tiết hồ sơ khách hàng & lịch sử đơn hàng tóm tắt
  getCustomerDetail: async (customerId) => {
    const res = await axiosInstance.get(`/api/admin/customers/${customerId}`);
    return res.data;
  },

  // Lấy chi tiết sâu 1 đơn hàng của khách
  getCustomerOrderDeep: async (customerId, orderId) => {
    const res = await axiosInstance.get(`/api/admin/customers/${customerId}/orders/${orderId}`);
    return res.data;
  },

  // Khóa / Mở khóa tài khoản
  toggleCustomerStatus: async (customerId, payload) => {
    const res = await axiosInstance.patch(`/api/admin/customers/${customerId}/status`, payload);
    return res.data;
  }
};