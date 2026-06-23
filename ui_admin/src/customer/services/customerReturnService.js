import axiosInstance from '../../shared/config/axiosInstance';

export const customerReturnService = {
  submitReturnRequest: async (payload) => {
    const res = await axiosInstance.post('/api/return-requests', payload);
    return res.data;
  },

  getMyReturnRequests: async () => {
    const res = await axiosInstance.get('/api/return-requests/list');
    return res.data;
  },

  getReturnRequestById: async (id) => {
    const res = await axiosInstance.get(`/api/return-requests/${id}`);
    return res.data;
  }
};