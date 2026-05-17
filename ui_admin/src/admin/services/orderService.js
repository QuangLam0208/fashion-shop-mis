// src/admin/services/orderService.js
import { USE_MOCK, API_ENDPOINTS } from '../../shared/config/apiConfig';
import axiosInstance from '../../shared/config/axiosInstance';
import { mockOrders } from '../../shared/mocks/orderMock';
import { mockUsers } from '../../shared/mocks/userMock';
import { mockProducts, mockProductVariants } from '../../shared/mocks/productMock';
import { ORDER_STATUS } from '../../shared/constants/orderConstants';

let _orders = [...mockOrders];
let _nextId = 2000;

export const adminOrderService = {
  /**
   * Lấy danh sách đơn hàng
   * GET /api/admin/orders
   * params: { keyword, status, type, payment_method, page, limit, sort }
   */
  getAll: async (params = {}) => {
    if (USE_MOCK) {
      let result = [..._orders];

      if (params.keyword) {
        const kw = params.keyword.toLowerCase();
        result = result.filter(
          (o) =>
            String(o.order_id).includes(kw) ||
            o.shipping_address?.toLowerCase().includes(kw)
        );
      }
      if (params.status && params.status !== 'ALL')
        result = result.filter((o) => o.status === params.status);
      if (params.type)
        result = result.filter((o) => o.type === params.type);
      if (params.payment_method)
        result = result.filter((o) => o.payment_method === params.payment_method);

      // Sort
      result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      const page  = parseInt(params.page)  || 1;
      const limit = parseInt(params.limit) || 10;
      const start = (page - 1) * limit;

      // Gắn thêm thông tin khách hàng
      const data = result.slice(start, start + limit).map((o) => {
        const user = mockUsers.find((u) => u.user_id === o.user_id);
        return { ...o, customer_name: user?.full_name, customer_phone: user?.phone };
      });

      return { data, total: result.length, page, limit };
    }
    const res = await axiosInstance.get(API_ENDPOINTS.ADMIN_ORDERS.GET_ALL, { params });
    return res.data;
  },

  /**
   * Chi tiết đơn hàng
   * GET /api/admin/orders/:id
   */
  getById: async (id) => {
    if (USE_MOCK) {
      const order = _orders.find((o) => o.order_id === +id);
      if (!order) return null;
      const user = mockUsers.find((u) => u.user_id === order.user_id);
      return { ...order, customer: user };
    }
    const res = await axiosInstance.get(API_ENDPOINTS.ADMIN_ORDERS.GET_BY_ID(id));
    return res.data;
  },

  /**
   * Cập nhật trạng thái đơn hàng
   * PUT /api/admin/orders/:id/status
   * Body: { status }
   */
  updateStatus: async (id, status) => {
    if (USE_MOCK) {
      _orders = _orders.map((o) =>
        o.order_id === +id
          ? { ...o, status, updated_at: new Date().toISOString() }
          : o
      );
      return _orders.find((o) => o.order_id === +id);
    }
    const res = await axiosInstance.put(API_ENDPOINTS.ADMIN_ORDERS.UPDATE_STATUS(id), {
      status,
    });
    return res.data;
  },

  /**
   * Huỷ đơn hàng (admin)
   * PUT /api/admin/orders/:id/cancel
   * Body: { reason }
   */
  cancel: async (id, reason = '') => {
    if (USE_MOCK) {
      _orders = _orders.map((o) =>
        o.order_id === +id
          ? { ...o, status: ORDER_STATUS.CANCELLED, cancel_reason: reason, updated_at: new Date().toISOString() }
          : o
      );
      return { success: true, message: 'Đơn hàng đã được huỷ.' };
    }
    const res = await axiosInstance.put(API_ENDPOINTS.ADMIN_ORDERS.CANCEL(id), { reason });
    return res.data;
  },

  /**
   * Tạo đơn hàng tại quầy (POS)
   * POST /api/admin/orders
   * Body: { customer_name, customer_phone, items[], payment_method, note }
   */
  createOffline: async (payload) => {
    if (USE_MOCK) {
      const totalAmount = payload.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      const newOrder = {
        order_id:         ++_nextId,
        user_id:          null,
        customer_name:    payload.customer_name || 'Khách vãng lai',
        customer_phone:   payload.customer_phone || '',
        type:             'OFFLINE',
        status:           ORDER_STATUS.DELIVERED,
        payment_method:   payload.payment_method || 'CASH',
        total_amount:     totalAmount,
        discount_amount:  payload.discount_amount || 0,
        final_amount:     totalAmount - (payload.discount_amount || 0),
        shipping_address: 'Tại quầy',
        note:             payload.note || '',
        items:            payload.items,
        created_at:       new Date().toISOString(),
        updated_at:       new Date().toISOString(),
      };
      _orders = [newOrder, ..._orders];
      return newOrder;
    }
    const res = await axiosInstance.post(API_ENDPOINTS.ADMIN_ORDERS.CREATE, payload);
    return res.data;
  },

  /**
   * Tra cứu nhanh tồn kho cho POS
   */
  searchProductForPOS: async (keyword) => {
    if (USE_MOCK) {
      const products = mockProducts
        .filter((p) =>
          p.status === 'ACTIVE' &&
          p.name.toLowerCase().includes(keyword.toLowerCase())
        )
        .slice(0, 10);

      return products.map((p) => ({
        ...p,
        variants: mockProductVariants.filter(
          (v) => v.product_id === p.product_id && v.stock_quantity > 0
        ),
      }));
    }
    const res = await axiosInstance.get(API_ENDPOINTS.ADMIN_PRODUCTS.GET_ALL, {
      params: { keyword, status: 'ACTIVE', limit: 10 },
    });
    return res.data?.data || [];
  },
};