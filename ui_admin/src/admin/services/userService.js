// src/admin/services/userService.js
import { USE_MOCK, API_ENDPOINTS } from '../../shared/config/apiConfig';
import axiosInstance from '../../shared/config/axiosInstance';
import { mockUsers } from '../../shared/mocks/userMock';
import { mockOrders } from '../../shared/mocks/orderMock';
import { USER_STATUS } from '../../shared/constants/userConstants';

let _users = [...mockUsers];

export const adminUserService = {
  /**
   * Lấy danh sách khách hàng
   * GET /api/admin/users
   * params: { keyword, status, page, limit }
   */
  getAll: async (params = {}) => {
    if (USE_MOCK) {
      let result = _users.filter((u) => u.role === 'CUSTOMER');

      if (params.keyword) {
        const kw = params.keyword.toLowerCase();
        result = result.filter(
          (u) =>
            u.full_name?.toLowerCase().includes(kw) ||
            u.email?.toLowerCase().includes(kw) ||
            u.phone?.includes(kw)
        );
      }
      if (params.status)
        result = result.filter((u) => u.status === params.status);

      result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      const page  = parseInt(params.page)  || 1;
      const limit = parseInt(params.limit) || 10;
      const start = (page - 1) * limit;

      // Thêm số đơn hàng cho mỗi user
      const data = result.slice(start, start + limit).map((u) => {
        const orderCount = mockOrders.filter((o) => o.user_id === u.user_id).length;
        const totalSpent = mockOrders
          .filter((o) => o.user_id === u.user_id && o.status === 'DELIVERED')
          .reduce((s, o) => s + o.final_amount, 0);
        return {
          user_id:     u.user_id,
          full_name:   u.full_name,
          email:       u.email,
          phone:       u.phone,
          status:      u.status,
          created_at:  u.created_at,
          order_count: orderCount,
          total_spent: totalSpent,
        };
      });

      return { data, total: result.length, page, limit };
    }
    const res = await axiosInstance.get(API_ENDPOINTS.ADMIN_USERS.GET_ALL, { params });
    return res.data;
  },

  /**
   * Chi tiết khách hàng
   * GET /api/admin/users/:id
   */
  getById: async (id) => {
    if (USE_MOCK) {
      const user = _users.find((u) => u.user_id === +id);
      if (!user) return null;
      const orders     = mockOrders.filter((o) => o.user_id === +id);
      const totalSpent = orders
        .filter((o) => o.status === 'DELIVERED')
        .reduce((s, o) => s + o.final_amount, 0);
      return {
        ...user,
        password: undefined, // Không trả về mật khẩu
        orders,
        order_count: orders.length,
        total_spent: totalSpent,
      };
    }
    const res = await axiosInstance.get(API_ENDPOINTS.ADMIN_USERS.GET_BY_ID(id));
    return res.data;
  },

  /**
   * Khoá / Mở khoá tài khoản
   * PUT /api/admin/users/:id/toggle-status
   */
  toggleStatus: async (id) => {
    if (USE_MOCK) {
      _users = _users.map((u) => {
        if (u.user_id !== +id) return u;
        const newStatus =
          u.status === USER_STATUS.ACTIVE ? USER_STATUS.BLOCKED : USER_STATUS.ACTIVE;
        return { ...u, status: newStatus };
      });
      const updated = _users.find((u) => u.user_id === +id);
      const msg =
        updated.status === USER_STATUS.BLOCKED
          ? 'Đã khoá tài khoản.'
          : 'Đã mở khoá tài khoản.';
      return { success: true, status: updated.status, message: msg };
    }
    const res = await axiosInstance.put(API_ENDPOINTS.ADMIN_USERS.TOGGLE_STATUS(id));
    return res.data;
  },

  /**
   * Lịch sử đơn hàng của 1 khách
   * GET /api/admin/users/:id/orders
   */
  getOrders: async (id) => {
    if (USE_MOCK) {
      return mockOrders.filter((o) => o.user_id === +id);
    }
    const res = await axiosInstance.get(API_ENDPOINTS.ADMIN_USERS.GET_ORDERS(id));
    return res.data;
  },
};