import { USE_MOCK, API_ENDPOINTS } from '../../shared/config/apiConfig';
import axiosInstance from '../../shared/config/axiosInstance';
import { mockProducts } from '../../shared/mocks/productMock';

export const shopProductService = {
  getAll: async (params) => {
    if (USE_MOCK) {
      // filter mock theo params
      let result = [...mockProducts];
      if (params?.category_id) result = result.filter(p => p.category_id === +params.category_id);
      if (params?.keyword) result = result.filter(p => p.name.toLowerCase().includes(params.keyword.toLowerCase()));
      return { data: result, total: result.length };
    }
    return (await axiosInstance.get(API_ENDPOINTS.SHOP.PRODUCTS, { params })).data;
  },
  getById: async (id) => {
    if (USE_MOCK) return mockProducts.find(p => p.product_id === +id);
    return (await axiosInstance.get(API_ENDPOINTS.SHOP.PRODUCT_DETAIL(id))).data;
  },
};
