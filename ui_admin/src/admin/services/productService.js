import { API_ENDPOINTS } from '../../shared/config/apiConfig';
import axiosInstance from '../../shared/config/axiosInstance';

export const adminProductService = {
  /**
   * Lấy danh sách sản phẩm (admin)
   * GET /api/admin/products
   * params: { keyword, category_id, status, page, limit }
   */
  getAll: async (params = {}) => {
    const res = await axiosInstance.get(API_ENDPOINTS.ADMIN_PRODUCTS.GET_ALL, { params });
    return res.data;
  },

  /**
   * Chi tiết sản phẩm kèm variants
   * GET /api/admin/products/:id
   */
  getById: async (id) => {
    const res = await axiosInstance.get(API_ENDPOINTS.ADMIN_PRODUCTS.GET_BY_ID(id));
    return res.data;
  },

  /**
   * Tạo sản phẩm mới (kèm variants)
   * POST /api/admin/products
   * Body: { name, description, category_id, base_price, sale_price, is_sale, status, images[], variants[] }
   */
  create: async (data) => {
    const res = await axiosInstance.post(API_ENDPOINTS.ADMIN_PRODUCTS.CREATE, data);
    return res.data;
  },

  /**
   * Cập nhật sản phẩm
   * PUT /api/admin/products/:id
   */
  update: async (id, data) => {
    const res = await axiosInstance.put(API_ENDPOINTS.ADMIN_PRODUCTS.UPDATE(id), data);
    return res.data;
  },

  /**
   * Xoá sản phẩm
   * DELETE /api/admin/products/:id
   */
  delete: async (id) => {
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
    const res = await axiosInstance.get(
      `${API_ENDPOINTS.ADMIN_PRODUCTS.GET_BY_ID(productId)}/variants`
    );
    return res.data;
  },
};