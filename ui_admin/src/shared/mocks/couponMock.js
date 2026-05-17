// src/shared/mocks/couponMock.js
export const mockCoupons = [
  { coupon_id: 1, code: 'SALE10', discount_type: 'PERCENTAGE', discount_value: 10, min_order_amount: 200000, max_uses: 100, used_count: 34, is_active: true, expired_at: '2024-12-31' },
  { coupon_id: 2, code: 'GIAM50K', discount_type: 'FIXED_AMOUNT', discount_value: 50000, min_order_amount: 300000, max_uses: 50, used_count: 12, is_active: true, expired_at: '2024-11-30' },
  { coupon_id: 3, code: 'VIP20', discount_type: 'PERCENTAGE', discount_value: 20, min_order_amount: 500000, max_uses: 20, used_count: 20, is_active: false, expired_at: '2024-06-30' },
];