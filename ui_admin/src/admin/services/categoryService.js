// src/admin/services/categoryService.js
import { USE_MOCK, API_ENDPOINTS } from '../../shared/config/apiConfig';
import axiosInstance from '../../shared/config/axiosInstance';
import { mockCategories } from '../../shared/mocks/categoryMock';

let _categories = [...mockCategories];
let _nextId = 100;

export const categoryService = {
  /**
   * Lấy tất cả danh mục (cây phân cấp)
   * GET /api/admin/categories
   * params: { keyword }
   */
  getAll: async (params = {}) => {
    if (USE_MOCK) {
      let result = [..._categories];
      if (params.keyword)
        result = result.filter((c) =>
          c.name.toLowerCase().includes(params.keyword.toLowerCase())
        );
      return result;
    }
    const res = await axiosInstance.get(API_ENDPOINTS.CATEGORIES.GET_ALL, { params });
    return res.data;
  },

  /**
   * Lấy danh mục theo id
   * GET /api/admin/categories/:id
   */
  getById: async (id) => {
    if (USE_MOCK) {
      return _categories.find((c) => c.category_id === +id) || null;
    }
    const res = await axiosInstance.get(API_ENDPOINTS.CATEGORIES.GET_BY_ID(id));
    return res.data;
  },

  /**
   * Tạo danh mục
   * POST /api/admin/categories
   * Body: { name, description, parent_id, image }
   */
  create: async (data) => {
    if (USE_MOCK) {
      // Kiểm tra tên trùng
      const exists = _categories.find(
        (c) => c.name.toLowerCase() === data.name.toLowerCase()
      );
      if (exists) {
        const err = new Error('Tên danh mục đã tồn tại.');
        err.response = { data: { message: 'Tên danh mục đã tồn tại.' } };
        throw err;
      }
      const newCat = {
        category_id: ++_nextId,
        name:        data.name,
        description: data.description || '',
        parent_id:   data.parent_id || null,
        image:       data.image || null,
      };
      _categories = [..._categories, newCat];
      return newCat;
    }
    const res = await axiosInstance.post(API_ENDPOINTS.CATEGORIES.CREATE, data);
    return res.data;
  },

  /**
   * Cập nhật danh mục
   * PUT /api/admin/categories/:id
   */
  update: async (id, data) => {
    if (USE_MOCK) {
      _categories = _categories.map((c) =>
        c.category_id === +id ? { ...c, ...data } : c
      );
      return _categories.find((c) => c.category_id === +id);
    }
    const res = await axiosInstance.put(API_ENDPOINTS.CATEGORIES.UPDATE(id), data);
    return res.data;
  },

  /**
   * Xoá danh mục
   * DELETE /api/admin/categories/:id
   */
  delete: async (id) => {
    if (USE_MOCK) {
      // Kiểm tra có danh mục con không
      const hasChildren = _categories.some((c) => c.parent_id === +id);
      if (hasChildren) {
        const err = new Error('Không thể xoá danh mục đang có danh mục con.');
        err.response = { data: { message: 'Không thể xoá danh mục đang có danh mục con.' } };
        throw err;
      }
      _categories = _categories.filter((c) => c.category_id !== +id);
      return { success: true, message: 'Xoá danh mục thành công.' };
    }
    const res = await axiosInstance.delete(API_ENDPOINTS.CATEGORIES.DELETE(id));
    return res.data;
  },

  /**
   * Helper: lấy danh mục cha (parent_id = null)
   */
  getParents: async () => {
    const all = await categoryService.getAll();
    return all.filter((c) => !c.parent_id);
  },

  /**
   * Helper: lấy danh mục con của 1 danh mục cha
   */
  getChildren: async (parentId) => {
    const all = await categoryService.getAll();
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