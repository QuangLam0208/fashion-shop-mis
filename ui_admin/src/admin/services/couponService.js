import axiosInstance from '../../shared/config/axiosInstance';

export const couponService = {
  // 1. Lấy danh sách Voucher (Giữ nguyên)
  getCoupons: async (params) => {
    const res = await axiosInstance.get('/api/admin/coupons/list', { params });
    return res.data;
  },

  // 2. Lấy chi tiết 1 Voucher (Endpoint mới)
  getCouponById: async (couponId) => {
    const res = await axiosInstance.get(`/api/admin/coupons/${couponId}`);
    return res.data;
  },

  // 3. Tạo mới Voucher (Endpoint mới: /create)
  createCoupon: async (payload) => {
    const res = await axiosInstance.post('/api/admin/coupons/create', payload);
    return res.data;
  },

  // 4. Cập nhật thông tin Voucher (Endpoint mới: /update/{couponId})
  updateCoupon: async (couponId, payload) => {
    const res = await axiosInstance.put(`/api/admin/coupons/update/${couponId}`, payload);
    return res.data;
  },

  // 5. Chuyển đổi trạng thái Bật/Tắt nhanh (Endpoint mới: /{couponId}/toggle-status)
  toggleCouponStatus: async (couponId) => {
    const res = await axiosInstance.patch(`/api/admin/coupons/${couponId}/toggle-status`);
    return res.data;
  }
};