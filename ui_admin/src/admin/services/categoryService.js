import { API_ENDPOINTS } from '../../shared/config/apiConfig';
import axiosInstance from '../../shared/config/axiosInstance';

export const adminCategoryService = {
  /**
   * Lấy tất cả danh mục (cây phân cấp)
   * GET /api/admin/categories
   * params: { keyword }
   */
  getAll: async (params = {}) => {
    const res = await axiosInstance.get(API_ENDPOINTS.CATEGORIES.GET_ALL, { params });
    return res.data;
  },

  /**
   * Lấy danh mục theo id
   * GET /api/admin/categories/:id
   */
  getById: async (id) => {
    const res = await axiosInstance.get(API_ENDPOINTS.CATEGORIES.GET_BY_ID(id));
    return res.data;
  },

  /**
   * Tạo danh mục
   * POST /api/admin/categories
   * Body: { name, description, parent_id, image }
   */
  create: async (data) => {
    const res = await axiosInstance.post(API_ENDPOINTS.CATEGORIES.CREATE, data);
    return res.data;
  },

  /**
   * Cập nhật danh mục
   * PUT /api/admin/categories/:id
   */
  update: async (id, data) => {
    const res = await axiosInstance.put(API_ENDPOINTS.CATEGORIES.UPDATE(id), data);
    return res.data;
  },

  /**
   * Xoá danh mục
   * DELETE /api/admin/categories/:id
   */
  delete: async (id) => {
    const res = await axiosInstance.delete(API_ENDPOINTS.CATEGORIES.DELETE(id));
    return res.data;
  },

  /**
   * Helper: lấy danh mục cha (parent_id = null)
   */
  getParents: async () => {
    const all = await adminCategoryService.getAll();
    return all.filter((c) => !c.parent_id);
  },

  /**
   * Helper: lấy danh mục con của 1 danh mục cha
   */
  getChildren: async (parentId) => {
    const all = await adminCategoryService.getAll();
    return all.filter((c) => c.parent_id === +parentId);
  },

  /**
   * Helper: build cây phân cấp [{...parent, children:[...]}]
   */
  buildTree: (categories) => {
    const parents  = categories.filter((c) => !c.parent_id);
    const children = categories.filter((c) => c.parent_id);
    return parents.map((p) => ({
      ...p,
      children: children.filter((c) => c.parent_id === p.category_id),
    }));
  },
};