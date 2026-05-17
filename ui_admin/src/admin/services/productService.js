import { USE_MOCK, API_ENDPOINTS } from '../../shared/config/apiConfig';
import axiosInstance from '../../shared/config/axiosInstance';
import { mockProducts } from '../../shared/mocks/productMock';

export const productService = {
  getAll: async (params) => {
    if (USE_MOCK) return { data: mockProducts, total: mockProducts.length };
    const res = await axiosInstance.get(API_ENDPOINTS.ADMIN_PRODUCTS.GET_ALL, { params });
    return res.data;
  },
  getById:  async (id)       => { if (USE_MOCK) return mockProducts.find(p => p.product_id === +id); return (await axiosInstance.get(API_ENDPOINTS.ADMIN_PRODUCTS.GET_BY_ID(id))).data; },
  create:   async (data)     => { if (USE_MOCK) return { ...data, product_id: Date.now() }; return (await axiosInstance.post(API_ENDPOINTS.ADMIN_PRODUCTS.CREATE, data)).data; },
  update:   async (id, data) => { if (USE_MOCK) return { ...data, product_id: id }; return (await axiosInstance.put(API_ENDPOINTS.ADMIN_PRODUCTS.UPDATE(id), data)).data; },
  delete:   async (id)       => { if (USE_MOCK) return { success: true }; return (await axiosInstance.delete(API_ENDPOINTS.ADMIN_PRODUCTS.DELETE(id))).data; },
};