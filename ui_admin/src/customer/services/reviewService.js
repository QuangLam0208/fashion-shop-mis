import axiosInstance from '../../shared/config/axiosInstance';

export const reviewService = {
  getByProduct: async (productId, params = {}) => {
    const res = await axiosInstance.get(`/api/reviews/products/${productId}`, { params });
    return res.data;
  },

  submit: async (payload) => {
    const res = await axiosInstance.post('/api/reviews', payload);
    return res.data;
  },

  // THÊM MỚI: Gọi API lấy lịch sử đánh giá cá nhân
  getMyReviews: async (params = {}) => {
    const res = await axiosInstance.get('/api/reviews/my', { params });
    return res.data;
  },

  getAvgRating: (reviews = []) => {
    if (!reviews.length) return 0;
    const sum = reviews.reduce((s, r) => s + r.rating, 0);
    return (sum / reviews.length).toFixed(1);
  },
};