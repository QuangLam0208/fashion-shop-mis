import { API_ENDPOINTS } from '../../shared/config/apiConfig';
import axiosInstance from '../../shared/config/axiosInstance';

export const adminReturnService = {
  // Lấy danh sách yêu cầu hoàn trả (Hỗ trợ phân trang, bộ lọc)
  getAll: async (params = {}) => {
    const res = await axiosInstance.get('/api/admin/return-requests/list', { params });
    return res.data;
  },

  // Xem chi tiết yêu cầu hoàn trả
  getById: async (id) => {
    const res = await axiosInstance.get(`/api/admin/return-requests/${id}`);
    return res.data;
  },

  // Xử lý phiếu (Approve / Reject) theo US-35
  processRequest: async (requestId, payload) => {
    // payload: { newStatus: "APPROVED" | "REJECTED", rejectionReason: "..." }
    const res = await axiosInstance.put(`/api/admin/return-requests/${requestId}/process`, payload);
    return res.data;
  },
  updateRefundStatus: async (itemId, status) => {
    const res = await axiosInstance.put(`/api/admin/return-requests/refund/${itemId}`, null, {
      params: { status }
    });
    return res.data;
  }
};