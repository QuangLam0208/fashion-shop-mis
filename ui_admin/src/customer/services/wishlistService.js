// src/customer/services/wishlistService.js
import { USE_MOCK, API_ENDPOINTS } from '../../shared/config/apiConfig';
import axiosInstance from '../../shared/config/axiosInstance';
import { mockProducts } from '../../shared/mocks/productMocks';

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
    if (USE_MOCK) {
      const ids = _getMockWishlist();
      return mockProducts.filter((p) => ids.includes(p.product_id));
    }
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
    if (USE_MOCK) {
      const ids = _getMockWishlist();
      if (!ids.includes(+productId)) {
        _saveMockWishlist([...ids, +productId]);
      }
      return { success: true };
    }
    const res = await axiosInstance.post(API_ENDPOINTS.CUSTOMER.WISHLIST, {
      product_id: productId,
    });
    return res.data;
  },

  /** Xoá khỏi wishlist */
  remove: async (productId) => {
    if (USE_MOCK) {
      const ids = _getMockWishlist().filter((id) => id !== +productId);
      _saveMockWishlist(ids);
      return { success: true };
    }
    const res = await axiosInstance.delete(
      `${API_ENDPOINTS.CUSTOMER.WISHLIST}/${productId}`
    );
    return res.data;
  },

  /** Toggle yêu thích */
  toggle: async (productId) => {
    if (USE_MOCK) {
      const ids = _getMockWishlist();
      const isIn = ids.includes(+productId);
      if (isIn) {
        _saveMockWishlist(ids.filter((id) => id !== +productId));
        return { wishlisted: false };
      } else {
        _saveMockWishlist([...ids, +productId]);
        return { wishlisted: true };
      }
    }
    const res = await axiosInstance.post(
      `${API_ENDPOINTS.CUSTOMER.WISHLIST}/${productId}/toggle`
    );
    return res.data;
  },
};