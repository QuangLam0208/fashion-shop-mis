import axiosInstance from '../../shared/config/axiosInstance';

export const adminRevenueService = {
  getReport: async (startDate, endDate) => {
    const res = await axiosInstance.get('/api/admin/revenue/reports', {
      params: { startDate, endDate }
    });
    return res.data; // Trả về JSON RevenueReportDTO
  },

  // API xuất file (Trả về file dạng Blob)
  exportCSV: async (startDate, endDate) => {
    const res = await axiosInstance.get('/api/admin/revenue/export', {
      params: { startDate, endDate, format: 'csv' },
      responseType: 'blob' // RẤT QUAN TRỌNG ĐỂ TẢI FILE
    });
    return res.data; 
  }
};