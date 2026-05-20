import { API_ENDPOINTS } from '../../shared/config/apiConfig';
import axiosInstance from '../../shared/config/axiosInstance';

export const checkoutService = {
  /** Lấy danh sách địa chỉ của user */
  getAddresses: async () => {
    const res = await axiosInstance.get(API_ENDPOINTS.CUSTOMER.ADDRESSES);
    return res.data;
  },

  /** Thêm địa chỉ mới */
  addAddress: async (data) => {
    const res = await axiosInstance.post(API_ENDPOINTS.CUSTOMER.ADDRESSES, data);
    return res.data;
  },

  /** Xác thực mã coupon */
  applyCoupon: async (code, orderAmount) => {
    const res = await axiosInstance.post('/api/customer/coupons/validate', {
      code,
      order_amount: orderAmount,
    });
    return res.data;
  },

  /**
   * Đặt hàng
   * payload: { address_id, payment_method, coupon_code, items[], note }
   */
  placeOrder: async (payload) => {
    const res = await axiosInstance.post(API_ENDPOINTS.CUSTOMER.CHECKOUT, payload);
    return res.data;
  },
};