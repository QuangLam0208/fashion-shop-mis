// src/customer/services/shopProductService.js
import { USE_MOCK, API_ENDPOINTS } from '../../shared/config/apiConfig';
import axiosInstance from '../../shared/config/axiosInstance';
import { mockProducts, mockProductVariants } from '../../shared/mocks/productMocks';
import { mockReviews } from '../../shared/mocks/reviewMock';

export const shopProductService = {
  /**
   * Lấy danh sách sản phẩm + filter
   * params: { category_id, keyword, min_price, max_price, color, size, sort, page, limit }
   */
  getAll: async (params = {}) => {
    if (USE_MOCK) {
      let result = [...mockProducts].filter((p) => p.status === 'ACTIVE');

      if (params.category_id)
        result = result.filter((p) => p.category_id === +params.category_id);

      if (params.keyword)
        result = result.filter((p) =>
          p.name.toLowerCase().includes(params.keyword.toLowerCase())
        );

      if (params.min_price)
        result = result.filter(
          (p) => (p.sale_price || p.base_price) >= +params.min_price
        );

      if (params.max_price)
        result = result.filter(
          (p) => (p.sale_price || p.base_price) <= +params.max_price
        );

      if (params.is_sale === 'true' || params.is_sale === true)
        result = result.filter((p) => p.is_sale);

      // Sort
      if (params.sort === 'price_asc')
        result.sort((a, b) => (a.sale_price || a.base_price) - (b.sale_price || b.base_price));
      else if (params.sort === 'price_desc')
        result.sort((a, b) => (b.sale_price || b.base_price) - (a.sale_price || a.base_price));
      else if (params.sort === 'rating')
        result.sort((a, b) => b.rating - a.rating);
      else if (params.sort === 'newest')
        result.sort((a, b) => b.product_id - a.product_id);

      // Pagination
      const page  = parseInt(params.page)  || 1;
      const limit = parseInt(params.limit) || 12;
      const start = (page - 1) * limit;
      const data  = result.slice(start, start + limit);

      return { data, total: result.length, page, limit };
    }

    const res = await axiosInstance.get(API_ENDPOINTS.SHOP.PRODUCTS, { params });
    return res.data;
  },

  /** Lấy chi tiết 1 sản phẩm kèm variants */
  getById: async (id) => {
    if (USE_MOCK) {
      const product  = mockProducts.find((p) => p.product_id === +id);
      if (!product) return null;
      const variants = mockProductVariants.filter((v) => v.product_id === +id);
      const reviews  = mockReviews.filter((r) => r.product_id === +id);
      return { ...product, variants, reviews };
    }
    const res = await axiosInstance.get(API_ENDPOINTS.SHOP.PRODUCT_DETAIL(id));
    return res.data;
  },

  /** Tìm kiếm nhanh (dùng cho search bar) */
  search: async (keyword) => {
    if (USE_MOCK) {
      return mockProducts
        .filter(
          (p) =>
            p.status === 'ACTIVE' &&
            p.name.toLowerCase().includes(keyword.toLowerCase())
        )
        .slice(0, 8);
    }
    const res = await axiosInstance.get(API_ENDPOINTS.SHOP.SEARCH, {
      params: { keyword },
    });
    return res.data;
  },

  /** Sản phẩm liên quan (cùng danh mục) */
  getRelated: async (productId, categoryId) => {
    if (USE_MOCK) {
      return mockProducts
        .filter(
          (p) =>
            p.category_id === +categoryId &&
            p.product_id !== +productId &&
            p.status === 'ACTIVE'
        )
        .slice(0, 4);
    }
    const res = await axiosInstance.get(
      `${API_ENDPOINTS.SHOP.PRODUCTS}/${productId}/related`
    );
    return res.data;
  },
};