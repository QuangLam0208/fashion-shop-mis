import { API_ENDPOINTS } from '../../shared/config/apiConfig';
import axiosInstance from '../../shared/config/axiosInstance';

export const cartService = {
  /** Lấy danh sách giỏ hàng */
  getCart: async () => {
    const res = await axiosInstance.get(API_ENDPOINTS.CUSTOMER.CART_LIST);
    return res.data; 
  },

  /** Thêm sản phẩm vào giỏ 
   * Body: { "productId": number, "quantity": number }
   */
  addItem: async ({ productId, variantId, quantity = 1 }) => {
    const res = await axiosInstance.post(API_ENDPOINTS.CUSTOMER.CART_CREATE, {
      productId, 
      variantId,
      quantity,
    });
    return res.data;
  },

  /** Cập nhật số lượng 
   * Body: { "cartItemId": number, "quantity": number }
   */
  updateQuantity: async (cartItemId, quantity) => {
    // Chú ý: Dùng PUT truyền Object vào Body thay vì gắn lên URL
    const res = await axiosInstance.put(API_ENDPOINTS.CUSTOMER.CART_UPDATE, { 
      cartItemId, 
      quantity 
    });
    return res.data;
  },

  /** Xoá 1 item (Truyền ID lên URL) */
  removeItem: async (itemId) => {
    const res = await axiosInstance.delete(
      API_ENDPOINTS.CUSTOMER.CART_DELETE(itemId)
    );
    return res.data;
  },

  /** (Nếu Backend chưa có API Xoá toàn bộ giỏ hàng, bạn có thể tạm để trống hàm này) */
  clearCart: async () => {
    // Nếu BE có API /api/cart/clear thì gọi, nếu không thì phải xóa từng phần tử hoặc bỏ qua
    console.warn("Backend chưa hỗ trợ xoá toàn bộ giỏ hàng 1 lần");
  },
};