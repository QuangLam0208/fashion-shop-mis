import { API_ENDPOINTS } from '../../shared/config/apiConfig';
import axiosInstance from '../../shared/config/axiosInstance';

const WISHLIST_KEY = 'fashion_wishlist'; // localStorage key khi mock

/** Đọc wishlist từ localStorage (mock) */
const _getMockWishlist = () => {
  try {
    return JSON.parse(localStorage.getItem(WISHLIST_KEY)) || [];
  } catch {
    return [];
  }
};

/** Ghi wishlist vào localStorage (mock) */
const _saveMockWishlist = (ids) => {
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(ids));
};

export const wishlistService = {
  /** Lấy danh sách sản phẩm yêu thích */
  getAll: async () => {
    const res = await axiosInstance.get(API_ENDPOINTS.CUSTOMER.WISHLIST);
    return res.data;
  },

  /** Kiểm tra 1 sản phẩm có trong wishlist không */
  isWishlisted: (productId) => {
    const ids = _getMockWishlist();
    return ids.includes(+productId);
  },

  /** Thêm vào wishlist */
  add: async (productId) => {
    const res = await axiosInstance.post(API_ENDPOINTS.CUSTOMER.WISHLIST, {
      product_id: productId,
    });
    return res.data;
  },

  /** Xoá khỏi wishlist */
  remove: async (productId) => {
    const res = await axiosInstance.delete(
      `${API_ENDPOINTS.CUSTOMER.WISHLIST}/${productId}`
    );
    return res.data;
  },

  /** Toggle yêu thích */
  toggle: async (productId) => {
    const res = await axiosInstance.post(
      `${API_ENDPOINTS.CUSTOMER.WISHLIST}/${productId}/toggle`
    );
    return res.data;
  },
};