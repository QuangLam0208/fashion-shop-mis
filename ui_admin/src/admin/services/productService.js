// src/admin/services/productService.js
import { USE_MOCK, API_ENDPOINTS } from '../../shared/config/apiConfig';
import axiosInstance from '../../shared/config/axiosInstance';
import { mockProducts, mockProductVariants } from '../../shared/mocks/productMock';
import { mockCategories } from '../../shared/mocks/categoryMock';

// Local copy để mock có thể mutate
let _products  = [...mockProducts];
let _variants  = [...mockProductVariants];
let _nextId    = 100;
let _nextVarId = 100;

export const adminProductService = {
  /**
   * Lấy danh sách sản phẩm (admin)
   * GET /api/admin/products
   * params: { keyword, category_id, status, page, limit }
   */
  getAll: async (params = {}) => {
    if (USE_MOCK) {
      let result = [..._products];

      if (params.keyword)
        result = result.filter((p) =>
          p.name.toLowerCase().includes(params.keyword.toLowerCase())
        );
      if (params.category_id)
        result = result.filter((p) => p.category_id === +params.category_id);
      if (params.status)
        result = result.filter((p) => p.status === params.status);

      result.sort((a, b) => b.product_id - a.product_id);

      const page  = parseInt(params.page)  || 1;
      const limit = parseInt(params.limit) || 10;
      const start = (page - 1) * limit;

      return {
        data:  result.slice(start, start + limit),
        total: result.length,
        page,
        limit,
      };
    }
    const res = await axiosInstance.get(API_ENDPOINTS.ADMIN_PRODUCTS.GET_ALL, { params });
    return res.data;
  },

  /**
   * Chi tiết sản phẩm kèm variants
   * GET /api/admin/products/:id
   */
  getById: async (id) => {
    if (USE_MOCK) {
      const product  = _products.find((p) => p.product_id === +id);
      if (!product) return null;
      const variants = _variants.filter((v) => v.product_id === +id);
      const category = mockCategories.find((c) => c.category_id === product.category_id);
      return { ...product, variants, category_name: category?.name };
    }
    const res = await axiosInstance.get(API_ENDPOINTS.ADMIN_PRODUCTS.GET_BY_ID(id));
    return res.data;
  },

  /**
   * Tạo sản phẩm mới (kèm variants)
   * POST /api/admin/products
   * Body: { name, description, category_id, base_price, sale_price, is_sale, status, images[], variants[] }
   */
  create: async (data) => {
    if (USE_MOCK) {
      const newProduct = {
        product_id:   ++_nextId,
        name:         data.name,
        description:  data.description || '',
        category_id:  data.category_id,
        base_price:   data.base_price,
        sale_price:   data.sale_price || null,
        is_sale:      data.is_sale || false,
        status:       data.status || 'ACTIVE',
        rating:       0,
        review_count: 0,
        images:       data.images || [],
      };
      _products = [newProduct, ..._products];

      // Tạo variants kèm theo
      if (data.variants?.length) {
        data.variants.forEach((v) => {
          _variants.push({
            variant_id:     ++_nextVarId,
            product_id:     newProduct.product_id,
            color:          v.color,
            size:           v.size,
            price:          v.price || data.sale_price || data.base_price,
            stock_quantity: v.stock_quantity || 0,
          });
        });
      }

      return newProduct;
    }
    const res = await axiosInstance.post(API_ENDPOINTS.ADMIN_PRODUCTS.CREATE, data);
    return res.data;
  },

  /**
   * Cập nhật sản phẩm
   * PUT /api/admin/products/:id
   */
  update: async (id, data) => {
    if (USE_MOCK) {
      _products = _products.map((p) =>
        p.product_id === +id ? { ...p, ...data } : p
      );
      // Cập nhật variants nếu có
      if (data.variants) {
        _variants = _variants.filter((v) => v.product_id !== +id);
        data.variants.forEach((v) => {
          _variants.push({
            variant_id:     v.variant_id || ++_nextVarId,
            product_id:     +id,
            color:          v.color,
            size:           v.size,
            price:          v.price,
            stock_quantity: v.stock_quantity,
          });
        });
      }
      return _products.find((p) => p.product_id === +id);
    }
    const res = await axiosInstance.put(API_ENDPOINTS.ADMIN_PRODUCTS.UPDATE(id), data);
    return res.data;
  },

  /**
   * Xoá sản phẩm
   * DELETE /api/admin/products/:id
   */
  delete: async (id) => {
    if (USE_MOCK) {
      _products = _products.filter((p) => p.product_id !== +id);
      _variants = _variants.filter((v) => v.product_id !== +id);
      return { success: true, message: 'Xoá sản phẩm thành công.' };
    }
    const res = await axiosInstance.delete(API_ENDPOINTS.ADMIN_PRODUCTS.DELETE(id));
    return res.data;
  },

  /**
   * Cập nhật trạng thái nhanh
   * PUT /api/admin/products/:id  (gửi { status })
   */
  updateStatus: async (id, status) => {
    return adminProductService.update(id, { status });
  },

  /**
   * Lấy danh sách variants của sản phẩm
   */
  getVariants: async (productId) => {
    if (USE_MOCK) {
      return _variants.filter((v) => v.product_id === +productId);
    }
    const res = await axiosInstance.get(
      `${API_ENDPOINTS.ADMIN_PRODUCTS.GET_BY_ID(productId)}/variants`
    );
    return res.data;
  },
};