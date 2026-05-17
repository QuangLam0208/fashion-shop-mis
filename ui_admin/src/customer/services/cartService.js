// src/customer/services/cartService.js
/**
 * cartService — quản lý giỏ hàng
 *
 * Khi USE_MOCK=true: CartContext (localStorage) là source of truth.
 * Service này chỉ cần thiết khi USE_MOCK=false (đồng bộ với backend).
 *
 * Pattern: các hàm ở đây được gọi từ CartContext hoặc CartPage
 * để sync lên server khi đã có backend.
 */
import { USE_MOCK, API_ENDPOINTS } from '../../shared/config/apiConfig';
import axiosInstance from '../../shared/config/axiosInstance';

export const cartService = {
  /** Lấy giỏ hàng từ server (khi USE_MOCK=false) */
  getCart: async () => {
    if (USE_MOCK) return []; // CartContext dùng localStorage
    const res = await axiosInstance.get(API_ENDPOINTS.CUSTOMER.CART);
    return res.data; // [{ cart_item_id, product_id, variant_id, quantity, ... }]
  },

  /** Thêm sản phẩm vào giỏ */
  addItem: async ({ product_id, variant_id, quantity = 1 }) => {
    if (USE_MOCK) return { success: true };
    const res = await axiosInstance.post(API_ENDPOINTS.CUSTOMER.CART, {
      product_id,
      variant_id,
      quantity,
    });
    return res.data;
  },

  /** Cập nhật số lượng */
  updateQuantity: async (cart_item_id, quantity) => {
    if (USE_MOCK) return { success: true };
    const res = await axiosInstance.put(
      `${API_ENDPOINTS.CUSTOMER.CART}/${cart_item_id}`,
      { quantity }
    );
    return res.data;
  },

  /** Xoá 1 item */
  removeItem: async (cart_item_id) => {
    if (USE_MOCK) return { success: true };
    const res = await axiosInstance.delete(
      `${API_ENDPOINTS.CUSTOMER.CART}/${cart_item_id}`
    );
    return res.data;
  },

  /** Xoá toàn bộ giỏ hàng */
  clearCart: async () => {
    if (USE_MOCK) return { success: true };
    const res = await axiosInstance.delete(API_ENDPOINTS.CUSTOMER.CART);
    return res.data;
  },
};