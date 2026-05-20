import { API_ENDPOINTS } from '../../shared/config/apiConfig';
import axiosInstance from '../../shared/config/axiosInstance';

export const dashboardService = {
  /**
   * Thống kê tổng quan (tổng doanh thu, đơn hàng, khách hàng, sản phẩm)
   * GET /api/admin/dashboard/stats
   */
  getStats: async () => {
    const res = await axiosInstance.get(API_ENDPOINTS.DASHBOARD.STATS);
    return res.data;
  },

  /**
   * Dữ liệu doanh thu theo tháng
   * GET /api/admin/dashboard/revenue
   * params: { year }
   */
  getRevenue: async (params = {}) => {
    const res = await axiosInstance.get(API_ENDPOINTS.DASHBOARD.REVENUE, { params });
    return res.data;
  },

  /**
   * Top sản phẩm bán chạy
   * GET /api/admin/dashboard/top-products
   * params: { limit, startDate, endDate }
   */
  getTopProducts: async (params = { limit: 5 }) => {
    const res = await axiosInstance.get(API_ENDPOINTS.DASHBOARD.TOP_PRODUCTS, { params });
    return res.data;
  },

  /**
   * Thống kê đơn hàng theo trạng thái (dùng cho biểu đồ tròn)
   * GET /api/admin/dashboard/order-status
   */
  getOrderStatusStats: async () => {
    const res = await axiosInstance.get(API_ENDPOINTS.DASHBOARD.ORDER_STATUS);
    return res.data;
  },

  /**
   * Đơn hàng mới nhất (5 đơn gần nhất)
   */
  getRecentOrders: async (limit = 5) => {
    const res = await axiosInstance.get(API_ENDPOINTS.ADMIN_ORDERS.GET_ALL, {
      params: { page: 1, limit, sort: 'newest' },
    });
    return res.data?.data || [];
  },
};