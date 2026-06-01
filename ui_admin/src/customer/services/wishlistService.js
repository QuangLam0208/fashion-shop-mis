import { API_ENDPOINTS } from '../../shared/config/apiConfig';
import axiosInstance from '../../shared/config/axiosInstance';

export const wishlistService = {
  /** Lấy danh sách sản phẩm yêu thích */
  getWishlist: async () => {
    const res = await axiosInstance.get(API_ENDPOINTS.CUSTOMER.WISHLIST_LIST);
    return res.data;
  },

  /** * Thêm/Bỏ yêu thích (Toggle) 
   * API yêu cầu truyền productId qua Query Parameters (?productId=xxx)
   */
  toggle: async (productId) => {
    const res = await axiosInstance.post(
      `${API_ENDPOINTS.CUSTOMER.WISHLIST_TOGGLE}?productId=${productId}`
    );
    return res.data;
  },

  /** Xóa 1 item khỏi wishlist bằng itemId */
  removeItem: async (itemId) => {
    const res = await axiosInstance.delete(
      API_ENDPOINTS.CUSTOMER.WISHLIST_DELETE(itemId)
    );
    return res.data;
  },

  /** Hàm tiện ích (offline) để thẻ ProductCard khỏi bị lỗi nếu code cũ đang dùng */
  isWishlisted: (productId) => {
    return false; // Trạng thái sẽ được BE xử lý hoặc cập nhật sau khi load API
  }
};