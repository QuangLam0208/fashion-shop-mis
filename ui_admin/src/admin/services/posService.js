import axiosInstance from '../../shared/config/axiosInstance';

export const posService = {
  // Gửi yêu cầu tạo đơn hàng POS tại quầy
  createOfflineSale: async (payload) => {
    // payload: { customerPhone, paymentMethod, items: [{ productVariantId, quantity }] }
    const res = await axiosInstance.post('/api/admin/offline-sales', payload);
    return res.data;
  }
};