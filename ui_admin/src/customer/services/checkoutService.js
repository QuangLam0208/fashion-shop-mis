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
  applyCoupon: async (payload) => {
    // UI đang truyền xuống payload: { couponCode: "SUMMER50", orderAmount: 500000 }
    
    const res = await axiosInstance.post(
      '/api/coupons/apply', 
      { 
        couponCode: payload.couponCode // Body: { "code": "string" }
      },
      { 
        params: { currentTotal: payload.orderAmount } // Query param: ?currentTotal=number
      }
    );
    
    return res.data;
  },

  /**
   * Đặt hàng
   * payload: { address_id, payment_method, coupon_code, items[], note }
   */
  placeOrder: async (payload) => {
    const res = await axiosInstance.post('/api/orders', payload);
    return res.data;
  },
  getAvailableCoupons: async () => {
    const res = await axiosInstance.get('/api/coupons/list');
    return res.data; // Backend trả về List<CouponResponseDTO>
  },
  retryMomoPayment: async (orderId) => {
    const res = await axiosInstance.post(`/api/payments/momo/recreate/${orderId}`);
    return res.data; // Backend trả về { paymentUrl: "..." }
  },
};