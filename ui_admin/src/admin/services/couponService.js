import { API_ENDPOINTS } from '../../shared/config/apiConfig';
import axiosInstance from '../../shared/config/axiosInstance';
import { DISCOUNT_TYPE } from '../../shared/constants/couponConstants';

export const couponService = {
  /**
   * Lấy danh sách coupon
   * GET /api/admin/coupons
   * params: { keyword, is_active, page, limit }
   */
  getAll: async (params = {}) => {
    const res = await axiosInstance.get(API_ENDPOINTS.COUPONS.GET_ALL, { params });
    return res.data;
  },

  /**
   * Chi tiết coupon
   * GET /api/admin/coupons/:id
   */
  getById: async (id) => {
    const res = await axiosInstance.get(API_ENDPOINTS.COUPONS.GET_BY_ID(id));
    return res.data;
  },

  /**
   * Tạo coupon
   * POST /api/admin/coupons
   * Body: { code, discount_type, discount_value, min_order_amount, max_uses, is_active, expired_at }
   */
  create: async (data) => {
    const res = await axiosInstance.post(API_ENDPOINTS.COUPONS.CREATE, data);
    return res.data;
  },

  /**
   * Cập nhật coupon
   * PUT /api/admin/coupons/:id
   */
  update: async (id, data) => {
    const res = await axiosInstance.put(API_ENDPOINTS.COUPONS.UPDATE(id), data);
    return res.data;
  },

  /**
   * Xoá coupon
   * DELETE /api/admin/coupons/:id
   */
  delete: async (id) => {
    const res = await axiosInstance.delete(API_ENDPOINTS.COUPONS.DELETE(id));
    return res.data;
  },

  /**
   * Bật / tắt kích hoạt coupon nhanh
   */
  toggleActive: async (id) => {
    const coupon = await couponService.getById(id);
    const res = await axiosInstance.put(API_ENDPOINTS.COUPONS.UPDATE(id), {
      is_active: !coupon.is_active,
    });
    return res.data;
  },

  /**
   * Helper: tính số tiền giảm
   */
  calcDiscount: (coupon, orderAmount) => {
    if (!coupon) return 0;
    if (coupon.discount_type === DISCOUNT_TYPE.PERCENTAGE)
      return Math.floor((orderAmount * coupon.discount_value) / 100);
    return Math.min(coupon.discount_value, orderAmount);
  },
};