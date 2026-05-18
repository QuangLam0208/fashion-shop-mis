// src/admin/services/couponService.js
import { USE_MOCK, API_ENDPOINTS } from '../../shared/config/apiConfig';
import axiosInstance from '../../shared/config/axiosInstance';
import { mockCoupons } from '../../shared/mocks/couponMock';
import { DISCOUNT_TYPE } from '../../shared/constants/couponConstants';

let _coupons = [...mockCoupons];
let _nextId  = 100;

export const couponService = {
  /**
   * Lấy danh sách coupon
   * GET /api/admin/coupons
   * params: { keyword, is_active, page, limit }
   */
  getAll: async (params = {}) => {
    if (USE_MOCK) {
      let result = [..._coupons];

      if (params.keyword) {
        const kw = params.keyword.toLowerCase();
        result = result.filter((c) => c.code.toLowerCase().includes(kw));
      }
      if (params.is_active !== undefined && params.is_active !== '')
        result = result.filter(
          (c) => c.is_active === (params.is_active === true || params.is_active === 'true')
        );

      result.sort((a, b) => b.coupon_id - a.coupon_id);

      const page  = parseInt(params.page)  || 1;
      const limit = parseInt(params.limit) || 10;
      const start = (page - 1) * limit;

      return { data: result.slice(start, start + limit), total: result.length, page, limit };
    }
    const res = await axiosInstance.get(API_ENDPOINTS.COUPONS.GET_ALL, { params });
    return res.data;
  },

  /**
   * Chi tiết coupon
   * GET /api/admin/coupons/:id
   */
  getById: async (id) => {
    if (USE_MOCK) {
      return _coupons.find((c) => c.coupon_id === +id) || null;
    }
    const res = await axiosInstance.get(API_ENDPOINTS.COUPONS.GET_BY_ID(id));
    return res.data;
  },

  /**
   * Tạo coupon
   * POST /api/admin/coupons
   * Body: { code, discount_type, discount_value, min_order_amount, max_uses, is_active, expired_at }
   */
  create: async (data) => {
    if (USE_MOCK) {
      // Kiểm tra mã trùng
      const exists = _coupons.find(
        (c) => c.code.toUpperCase() === data.code.toUpperCase()
      );
      if (exists) {
        const err = new Error('Mã coupon đã tồn tại.');
        err.response = { data: { message: 'Mã coupon đã tồn tại.' } };
        throw err;
      }
      // Validate discount value
      if (
        data.discount_type === DISCOUNT_TYPE.PERCENTAGE &&
        (data.discount_value < 1 || data.discount_value > 100)
      ) {
        const err = new Error('Phần trăm giảm phải từ 1 đến 100.');
        err.response = { data: { message: 'Phần trăm giảm phải từ 1 đến 100.' } };
        throw err;
      }
      const newCoupon = {
        coupon_id:        ++_nextId,
        code:             data.code.toUpperCase(),
        discount_type:    data.discount_type,
        discount_value:   data.discount_value,
        min_order_amount: data.min_order_amount || 0,
        max_uses:         data.max_uses || 999,
        used_count:       0,
        is_active:        data.is_active !== false,
        expired_at:       data.expired_at || null,
      };
      _coupons = [newCoupon, ..._coupons];
      return newCoupon;
    }
    const res = await axiosInstance.post(API_ENDPOINTS.COUPONS.CREATE, data);
    return res.data;
  },

  /**
   * Cập nhật coupon
   * PUT /api/admin/coupons/:id
   */
  update: async (id, data) => {
    if (USE_MOCK) {
      // Kiểm tra mã trùng với coupon khác
      const duplicate = _coupons.find(
        (c) =>
          c.coupon_id !== +id &&
          c.code.toUpperCase() === data.code?.toUpperCase()
      );
      if (duplicate) {
        const err = new Error('Mã coupon đã tồn tại.');
        err.response = { data: { message: 'Mã coupon đã tồn tại.' } };
        throw err;
      }
      _coupons = _coupons.map((c) =>
        c.coupon_id === +id
          ? { ...c, ...data, code: data.code?.toUpperCase() || c.code }
          : c
      );
      return _coupons.find((c) => c.coupon_id === +id);
    }
    const res = await axiosInstance.put(API_ENDPOINTS.COUPONS.UPDATE(id), data);
    return res.data;
  },

  /**
   * Xoá coupon
   * DELETE /api/admin/coupons/:id
   */
  delete: async (id) => {
    if (USE_MOCK) {
      const coupon = _coupons.find((c) => c.coupon_id === +id);
      if (coupon?.used_count > 0) {
        const err = new Error('Không thể xoá coupon đã được sử dụng. Hãy tắt kích hoạt thay vào đó.');
        err.response = { data: { message: err.message } };
        throw err;
      }
      _coupons = _coupons.filter((c) => c.coupon_id !== +id);
      return { success: true, message: 'Đã xoá coupon.' };
    }
    const res = await axiosInstance.delete(API_ENDPOINTS.COUPONS.DELETE(id));
    return res.data;
  },

  /**
   * Bật / tắt kích hoạt coupon nhanh
   */
  toggleActive: async (id) => {
    if (USE_MOCK) {
      const coupon = _coupons.find((c) => c.coupon_id === +id);
      if (!coupon) throw new Error('Coupon không tồn tại.');
      return couponService.update(id, { is_active: !coupon.is_active });
    }
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