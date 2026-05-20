import { API_ENDPOINTS } from '../../shared/config/apiConfig';
import axiosInstance from '../../shared/config/axiosInstance';

export const adminReturnService = {
  /**
   * Lấy danh sách yêu cầu trả hàng
   * GET /api/admin/returns
   * params: { status, page, limit }
   */
  getAll: async (params = {}) => {
    const res = await axiosInstance.get(API_ENDPOINTS.RETURNS.GET_ALL, { params });
    return res.data;
  },

  /**
   * Chi tiết yêu cầu trả hàng
   * GET /api/admin/returns/:id
   */
  getById: async (id) => {
    const res = await axiosInstance.get(API_ENDPOINTS.RETURNS.GET_BY_ID(id));
    return res.data;
  },

  /**
   * Duyệt yêu cầu trả hàng
   * PUT /api/admin/returns/:id/approve
   * Body: { note }
   */
  approve: async (id, note = '') => {
    const res = await axiosInstance.put(API_ENDPOINTS.RETURNS.APPROVE(id), { note });
    return res.data;
  },

  /**
   * Từ chối yêu cầu trả hàng
   * PUT /api/admin/returns/:id/reject
   * Body: { note }
   */
  reject: async (id, note = '') => {
    const res = await axiosInstance.put(API_ENDPOINTS.RETURNS.REJECT(id), { note });
    return res.data;
  },

  /**
   * Hoàn tất (đã nhận lại hàng, hoàn tiền)
   * PUT /api/admin/returns/:id/complete
   * Body: { refund_amount, note }
   */
  complete: async (id, { refund_amount, note = '' } = {}) => {
    const res = await axiosInstance.put(API_ENDPOINTS.RETURNS.COMPLETE(id), {
      refund_amount,
      note,
    });
    return res.data;
  },
};