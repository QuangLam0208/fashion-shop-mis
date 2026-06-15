import { API_ENDPOINTS } from '../../shared/config/apiConfig';
import axiosInstance from '../../shared/config/axiosInstance';

export const dashboardService = {
  getOverview: async () => {
    // AC-US43-02: Endpoint trả về 4 nhóm chỉ số
    const res = await axiosInstance.get('/api/admin/dashboard');
    return res.data;
  }
};