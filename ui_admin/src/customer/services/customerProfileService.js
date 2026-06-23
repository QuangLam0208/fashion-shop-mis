import axiosInstance from '../../shared/config/axiosInstance';

export const customerProfileService = {
  // --- PROFILE ---
  getProfile: async () => {
    const res = await axiosInstance.get('/api/users/me');
    return res.data;
  },
  updateProfile: async (data) => {
    const res = await axiosInstance.put('/api/users/me/update', data);
    return res.data;
  },
  changePassword: async (data) => {
    const res = await axiosInstance.post('/api/users/me/password', data);
    return res.data;
  },
  deleteAccount: async () => {
    const res = await axiosInstance.delete('/api/users/me/delete');
    return res.data;
  },
  resendVerification: async () => {
    const res = await axiosInstance.post('/api/users/me/resend-verification');
    return res.data;
  },

  // --- ADDRESS ---
  getAddresses: async () => {
    const res = await axiosInstance.get('/api/users/me/addresses/my-addresses');
    return res.data;
  },
  createAddress: async (data) => {
    const res = await axiosInstance.post('/api/users/me/addresses/create', data);
    return res.data;
  },
  updateAddress: async (id, data) => {
    const res = await axiosInstance.put(`/api/users/me/addresses/update/${id}`, data);
    return res.data;
  },
  deleteAddress: async (id) => {
    const res = await axiosInstance.delete(`/api/users/me/addresses/delete/${id}`);
    return res.data;
  },
  setDefaultAddress: async (id) => {
    const res = await axiosInstance.patch(`/api/users/me/addresses/${id}/default`);
    return res.data;
  }
};