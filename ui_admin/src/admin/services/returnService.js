// src/admin/services/returnService.js
import { USE_MOCK, API_ENDPOINTS } from '../../shared/config/apiConfig';
import axiosInstance from '../../shared/config/axiosInstance';
import { mockReturns } from '../../shared/mocks/returnMock';
import { mockOrders } from '../../shared/mocks/orderMock';
import { mockUsers } from '../../shared/mocks/userMock';
import { RETURN_STATUS } from '../../shared/constants/returnConstants';

let _returns = [...mockReturns];

export const adminReturnService = {
  /**
   * Lấy danh sách yêu cầu trả hàng
   * GET /api/admin/returns
   * params: { status, page, limit }
   */
  getAll: async (params = {}) => {
    if (USE_MOCK) {
      let result = [..._returns];

      if (params.status && params.status !== 'ALL')
        result = result.filter((r) => r.status === params.status);

      result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      const page  = parseInt(params.page)  || 1;
      const limit = parseInt(params.limit) || 10;
      const start = (page - 1) * limit;

      const data = result.slice(start, start + limit).map((r) => {
        const order = mockOrders.find((o) => o.order_id === r.order_id);
        const user  = mockUsers.find((u) => u.user_id === r.user_id);
        return {
          ...r,
          customer_name:  user?.full_name,
          customer_phone: user?.phone,
          order_total:    order?.final_amount,
        };
      });

      return { data, total: result.length, page, limit };
    }
    const res = await axiosInstance.get(API_ENDPOINTS.RETURNS.GET_ALL, { params });
    return res.data;
  },

  /**
   * Chi tiết yêu cầu trả hàng
   * GET /api/admin/returns/:id
   */
  getById: async (id) => {
    if (USE_MOCK) {
      const ret   = _returns.find((r) => r.return_id === +id);
      if (!ret) return null;
      const order = mockOrders.find((o) => o.order_id === ret.order_id);
      const user  = mockUsers.find((u) => u.user_id === ret.user_id);
      return { ...ret, order, customer: user };
    }
    const res = await axiosInstance.get(API_ENDPOINTS.RETURNS.GET_BY_ID(id));
    return res.data;
  },

  /**
   * Duyệt yêu cầu trả hàng
   * PUT /api/admin/returns/:id/approve
   * Body: { note }
   */
  approve: async (id, note = '') => {
    if (USE_MOCK) {
      _returns = _returns.map((r) =>
        r.return_id === +id
          ? { ...r, status: RETURN_STATUS.APPROVED, admin_note: note, updated_at: new Date().toISOString() }
          : r
      );
      return { success: true, message: 'Đã duyệt yêu cầu trả hàng.' };
    }
    const res = await axiosInstance.put(API_ENDPOINTS.RETURNS.APPROVE(id), { note });
    return res.data;
  },

  /**
   * Từ chối yêu cầu trả hàng
   * PUT /api/admin/returns/:id/reject
   * Body: { note }
   */
  reject: async (id, note = '') => {
    if (USE_MOCK) {
      _returns = _returns.map((r) =>
        r.return_id === +id
          ? { ...r, status: RETURN_STATUS.REJECTED, admin_note: note, updated_at: new Date().toISOString() }
          : r
      );
      return { success: true, message: 'Đã từ chối yêu cầu trả hàng.' };
    }
    const res = await axiosInstance.put(API_ENDPOINTS.RETURNS.REJECT(id), { note });
    return res.data;
  },

  /**
   * Hoàn tất (đã nhận lại hàng, hoàn tiền)
   * PUT /api/admin/returns/:id/complete
   * Body: { refund_amount, note }
   */
  complete: async (id, { refund_amount, note = '' } = {}) => {
    if (USE_MOCK) {
      _returns = _returns.map((r) =>
        r.return_id === +id
          ? {
              ...r,
              status:        RETURN_STATUS.COMPLETED,
              refund_amount: refund_amount,
              admin_note:    note,
              updated_at:    new Date().toISOString(),
            }
          : r
      );
      return { success: true, message: 'Hoàn tất trả hàng và ghi nhận hoàn tiền.' };
    }
    const res = await axiosInstance.put(API_ENDPOINTS.RETURNS.COMPLETE(id), {
      refund_amount,
      note,
    });
    return res.data;
  },
};