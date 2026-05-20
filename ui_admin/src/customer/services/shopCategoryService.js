import { API_ENDPOINTS } from '../../shared/config/apiConfig';
import axiosInstance from '../../shared/config/axiosInstance';

export const shopCategoryService = {
  /**
   * Lấy tất cả danh mục (Dùng API Public cho Khách hàng)
   * GET /api/categories
   */
  getAll: async (params = {}) => {
    // Nếu trong apiConfig chưa có API_ENDPOINTS.SHOP.CATEGORIES, 
    // code sẽ fallback về đường dẫn mặc định '/api/categories'
    const endpoint = API_ENDPOINTS.SHOP?.CATEGORIES || '/api/categories';
    const res = await axiosInstance.get(endpoint, { params });
    return res.data;
  },

  /**
   * Lấy chi tiết danh mục theo id
   * GET /api/categories/:id
   */
  getById: async (id) => {
    const endpoint = API_ENDPOINTS.SHOP?.CATEGORY_DETAIL 
      ? API_ENDPOINTS.SHOP.CATEGORY_DETAIL(id) 
      : `/api/categories/${id}`;
    const res = await axiosInstance.get(endpoint);
    return res.data;
  },

  /**
   * Helper: Lấy các danh mục cha (parent_id = null)
   * Phục vụ hiển thị trên Landing Page
   */
  getParents: async () => {
    const all = await shopCategoryService.getAll();
    return all.filter((c) => !c.parent_id);
  },

  /**
   * Helper: Lấy danh mục con của 1 danh mục cha
   */
  getChildren: async (parentId) => {
    const all = await shopCategoryService.getAll();
    return all.filter((c) => c.parent_id === +parentId);
  },

  /**
   * Helper: Build cây phân cấp [{...parent, children:[...]}]
   * Phục vụ hiển thị menu thả xuống (Dropdown)
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