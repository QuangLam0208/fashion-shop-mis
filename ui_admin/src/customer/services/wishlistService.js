import { API_ENDPOINTS } from '../../shared/config/apiConfig';
import axiosInstance from '../../shared/config/axiosInstance';

export const wishlistService = {
  /** Lấy danh sách sản phẩm yêu thích */
  getWishlist: async () => {
    const res = await axiosInstance.get(API_ENDPOINTS.CUSTOMER.WISHLIST_LIST);
    return res.data;
  },

  /** Thêm/Bỏ yêu thích (Toggle) */
  toggle: async (productId) => {
    const res = await axiosInstance.post(
      `${API_ENDPOINTS.CUSTOMER.WISHLIST_TOGGLE}?productId=${productId}`
    );
    return res.data;
  },

  /** Xóa 1 item khỏi wishlist bằng wishlistItemId */
  removeItem: async (itemId) => {
    // Sử dụng string literal trực tiếp để đảm bảo khớp 100% URL theo AC
    const res = await axiosInstance.delete(`/api/wishlists/${itemId}`);
    return res.data;
  },

  /** Hàm tiện ích (offline) để thẻ ProductCard khỏi bị lỗi nếu code cũ đang dùng */
  isWishlisted: (productId) => {
    return false;
  }
};