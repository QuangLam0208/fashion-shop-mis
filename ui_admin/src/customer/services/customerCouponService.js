import axiosInstance from '../../shared/config/axiosInstance';

export const customerCouponService = {
  // Lấy danh sách Voucher công khai (Để hiển thị ở trang Khuyến mãi)
  getPublicCoupons: async () => {
    const res = await axiosInstance.get('/api/coupons/list');
    return res.data;
  },
  
  // Lưu mã vào ví (AC-US39-01, AC-US39-02)
  collectCoupon: async (payload) => {
    // payload: { couponId: 5 }
    const res = await axiosInstance.post('/api/coupons/collect', payload);
    return res.data;
  },

  // Lấy danh sách Voucher đã lưu trong Ví (Endpoint mới)
  getWalletCoupons: async () => {
    const res = await axiosInstance.get('/api/coupons/wallet');
    return res.data;
  },

  // Áp dụng mã khi Checkout
  applyCoupon: async (currentTotal, payload) => {
    // payload: { couponCode: "SUMMER" }
    const res = await axiosInstance.post('/api/coupons/apply', payload, {
      params: { currentTotal }
    });
    return res.data;
  }
};