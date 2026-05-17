// src/customer/services/checkoutService.js
import { USE_MOCK, API_ENDPOINTS } from '../../shared/config/apiConfig';
import axiosInstance from '../../shared/config/axiosInstance';
import { mockCoupons } from '../../shared/mocks/couponMock';

/** Mock addresses */
const mockAddresses = [
  {
    address_id: 1,
    user_id: 2,
    full_name: 'Nguyễn Văn An',
    phone: '0912345678',
    province: 'TP. Hồ Chí Minh',
    district: 'Quận 1',
    ward: 'Phường Bến Nghé',
    street: '123 Nguyễn Huệ',
    is_default: true,
  },
  {
    address_id: 2,
    user_id: 2,
    full_name: 'Nguyễn Văn An',
    phone: '0912345678',
    province: 'TP. Hồ Chí Minh',
    district: 'Quận 3',
    ward: 'Phường 6',
    street: '45 Võ Văn Tần',
    is_default: false,
  },
];

export const checkoutService = {
  /** Lấy danh sách địa chỉ của user */
  getAddresses: async () => {
    if (USE_MOCK) return mockAddresses;
    const res = await axiosInstance.get(API_ENDPOINTS.CUSTOMER.ADDRESSES);
    return res.data;
  },

  /** Thêm địa chỉ mới */
  addAddress: async (data) => {
    if (USE_MOCK) {
      const newAddr = { ...data, address_id: Date.now(), is_default: false };
      mockAddresses.push(newAddr);
      return newAddr;
    }
    const res = await axiosInstance.post(API_ENDPOINTS.CUSTOMER.ADDRESSES, data);
    return res.data;
  },

  /** Xác thực mã coupon */
  applyCoupon: async (code, orderAmount) => {
    if (USE_MOCK) {
      const coupon = mockCoupons.find(
        (c) =>
          c.code.toUpperCase() === code.toUpperCase() &&
          c.is_active &&
          c.used_count < c.max_uses &&
          orderAmount >= c.min_order_amount
      );

      if (!coupon) {
        const err = new Error('Mã coupon không hợp lệ hoặc đã hết hạn.');
        err.response = { data: { message: 'Mã coupon không hợp lệ hoặc đã hết hạn.' } };
        throw err;
      }

      const discount =
        coupon.discount_type === 'PERCENTAGE'
          ? Math.floor((orderAmount * coupon.discount_value) / 100)
          : coupon.discount_value;

      return { coupon, discount };
    }

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
    if (USE_MOCK) {
      const orderId = Math.floor(Math.random() * 9000) + 1000;
      return {
        order_id: orderId,
        status: 'PENDING_CONFIRMATION',
        message: 'Đặt hàng thành công!',
        created_at: new Date().toISOString(),
      };
    }
    const res = await axiosInstance.post(API_ENDPOINTS.CUSTOMER.CHECKOUT, payload);
    return res.data;
  },
};