import { API_ENDPOINTS } from '../../shared/config/apiConfig';
import axiosInstance from '../../shared/config/axiosInstance';

export const cartService = {
  getCart: async () => {
    const res = await axiosInstance.get(API_ENDPOINTS.CUSTOMER.CART);
    return res.data; // [{ cart_item_id, product_id, variant_id, quantity, ... }]
  },

  /** Thêm sản phẩm vào giỏ */
  addItem: async ({ product_id, variant_id, quantity = 1 }) => {
    const res = await axiosInstance.post(API_ENDPOINTS.CUSTOMER.CART, {
      product_id,
      variant_id,
      quantity,
    });
    return res.data;
  },

  /** Cập nhật số lượng */
  updateQuantity: async (cart_item_id, quantity) => {
    const res = await axiosInstance.put(
      `${API_ENDPOINTS.CUSTOMER.CART}/${cart_item_id}`,
      { quantity }
    );
    return res.data;
  },

  /** Xoá 1 item */
  removeItem: async (cart_item_id) => {
    const res = await axiosInstance.delete(
      `${API_ENDPOINTS.CUSTOMER.CART}/${cart_item_id}`
    );
    return res.data;
  },

  /** Xoá toàn bộ giỏ hàng */
  clearCart: async () => {
    const res = await axiosInstance.delete(API_ENDPOINTS.CUSTOMER.CART);
    return res.data;
  },
};