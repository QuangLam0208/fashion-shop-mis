import { API_ENDPOINTS } from '../../shared/config/apiConfig';
import axiosInstance from '../../shared/config/axiosInstance';

export const shopProductService = {
  /**
   * Lấy danh sách sản phẩm + filter
   * params: { category_id, keyword, min_price, max_price, color, size, sort, page, limit }
   */
  getAll: async (params = {}) => {
    const res = await axiosInstance.get(API_ENDPOINTS.SHOP.PRODUCTS, { params });
    return res.data;
  },

  /** Lấy chi tiết 1 sản phẩm kèm variants */
  getById: async (id) => {
    const res = await axiosInstance.get(API_ENDPOINTS.SHOP.PRODUCT_DETAIL(id));
    return res.data;
  },

  /** Tìm kiếm nhanh (dùng cho search bar) */
  search: async (keyword) => {
    const res = await axiosInstance.get(API_ENDPOINTS.SHOP.SEARCH, {
      params: { keyword },
    });
    return res.data;
  },

  /** Sản phẩm liên quan (cùng danh mục) */
  getRelated: async (productId, categoryId) => {
    const res = await axiosInstance.get(
      `${API_ENDPOINTS.SHOP.PRODUCTS}/${productId}/related`
    );
    return res.data;
  },
};