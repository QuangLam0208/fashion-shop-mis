// src/customer/services/customerOrderService.js
import { USE_MOCK, API_ENDPOINTS } from '../../shared/config/apiConfig';
import axiosInstance from '../../shared/config/axiosInstance';
import { mockOrders } from '../../shared/mocks/orderMock';

export const customerOrderService = {
  /**
   * Lấy danh sách đơn hàng của user hiện tại
   * params: { status, page, limit }
   */
  getOrders: async (params = {}) => {
    if (USE_MOCK) {
      let result = [...mockOrders];

      if (params.status && params.status !== 'ALL')
        result = result.filter((o) => o.status === params.status);

      result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      const page  = parseInt(params.page)  || 1;
      const limit = parseInt(params.limit) || 10;
      const start = (page - 1) * limit;

      return {
        data: result.slice(start, start + limit),
        total: result.length,
      };
    }
    const res = await axiosInstance.get(API_ENDPOINTS.CUSTOMER.ORDERS, { params });
    return res.data;
  },

  /** Lấy chi tiết 1 đơn hàng */
  getById: async (orderId) => {
    if (USE_MOCK) {
      return mockOrders.find((o) => o.order_id === +orderId) || null;
    }
    const res = await axiosInstance.get(API_ENDPOINTS.CUSTOMER.ORDER_DETAIL(orderId));
    return res.data;
  },

  /** Huỷ đơn hàng (chỉ khi PENDING_CONFIRMATION) */
  cancelOrder: async (orderId) => {
    if (USE_MOCK) {
      const order = mockOrders.find((o) => o.order_id === +orderId);
      if (order) order.status = 'CANCELLED';
      return { success: true, message: 'Đơn hàng đã được huỷ.' };
    }
    const res = await axiosInstance.put(
      `${API_ENDPOINTS.CUSTOMER.ORDERS}/${orderId}/cancel`
    );
    return res.data;
  },

  /**
   * Gửi yêu cầu trả hàng
   * payload: { order_id, reason, images[] }
   */
  requestReturn: async (orderId, payload) => {
    if (USE_MOCK) {
      return {
        return_id: Date.now(),
        order_id: orderId,
        status: 'PENDING',
        message: 'Yêu cầu trả hàng đã được gửi. Chúng tôi sẽ phản hồi trong 1-2 ngày làm việc.',
        created_at: new Date().toISOString(),
      };
    }
    const res = await axiosInstance.post(
      `${API_ENDPOINTS.CUSTOMER.ORDERS}/${orderId}/return`,
      payload
    );
    return res.data;
  },
};