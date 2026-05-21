// ─────────────────────────────────────────────────────────────
//  services/categoryService.js
//  Căn cứ API docs:
//    GET    /api/categories/list          → { data: Array<CategoryTree> }
//    GET    /api/categories/{id}          → { id, name }
//    GET    /api/categories/search?name=  → { items: Array<Category> }
//    POST   /api/categories/create        → body: { name, parentId }  → { id, name }
//    PUT    /api/categories/update/{id}   → body: { name }            → { status: "success" }
//    DELETE /api/categories/delete/{id}   → { message: "deleted" }
// ─────────────────────────────────────────────────────────────

import { API_ENDPOINTS } from '../../shared/config/apiConfig';
import axiosInstance from '../../shared/config/axiosInstance';

export const adminCategoryService = {

  /**
   * Lấy cây danh mục
   * GET /api/categories/list
   * Response: { data: Array<CategoryTree> }
   */
  getAll: async () => {
    const res = await axiosInstance.get(API_ENDPOINTS.CATEGORIES.GET_ALL);
    // BE trả { data: [...] } → lấy .data
    const raw = res.data?.data ?? res.data;
    // Chỉ lấy danh mục cha (parentId === null)
    // BE đã trả đúng dạng cây có children[] rồi nên dùng thẳng
    return Array.isArray(raw) ? raw.filter(c => c.parentId === null) : [];
  },

  /**
   * Lấy danh mục theo ID
   * GET /api/categories/{id}
   * Response: { id, name }
   */
  getById: async (id) => {
    const res = await axiosInstance.get(API_ENDPOINTS.CATEGORIES.GET_BY_ID(id));
    return res.data;
  },

  /**
   * Tìm theo tên
   * GET /api/categories/search?name=keyword
   * Response: { items: Array<Category> }
   */
  search: async (name) => {
    const res = await axiosInstance.get(API_ENDPOINTS.CATEGORIES.SEARCH, {
      params: { name },
    });
    return res.data?.items ?? res.data;
  },

  /**
   * Thêm danh mục
   * POST /api/categories/create
   * Body: { name: string, parentId: number|null }
   * Response: { id, name }
   *
   * Lưu ý: API dùng camelCase "parentId" (không phải "parent_id")
   */
  create: async ({ name, parentId = null }) => {
    const res = await axiosInstance.post(API_ENDPOINTS.CATEGORIES.CREATE, {
      name,
      parentId, // đúng theo API docs
    });
    return res.data;
  },

  /**
   * Cập nhật danh mục
   * PUT /api/categories/update/{id}
   * Body: { name: string }   ← API chỉ nhận name
   * Response: { status: "success" }
   */
  update: async (id, { name, parentId = null }) => {
    const res = await axiosInstance.put(API_ENDPOINTS.CATEGORIES.UPDATE(id), { name, parentId });
    return res.data;
  },

  /**
   * Xoá danh mục
   * DELETE /api/categories/delete/{id}
   * Response: { message: "deleted" }
   */
  delete: async (id) => {
    const res = await axiosInstance.delete(API_ENDPOINTS.CATEGORIES.DELETE(id));
    return res.data;
  },
};