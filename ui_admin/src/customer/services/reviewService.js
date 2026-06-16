import { API_ENDPOINTS } from '../../shared/config/apiConfig';
import axiosInstance from '../../shared/config/axiosInstance';

export const reviewService = {
  /** Lấy tất cả đánh giá của 1 sản phẩm (Có phân trang) */
  getByProduct: async (productId, params = {}) => {
    // SỬA LỖI: Gọi đúng endpoint GET /api/reviews/product/{productId}
    const res = await axiosInstance.get(`/api/reviews/products/${productId}`, { params });
    return res.data;
  },

  /** Gửi đánh giá */
  submit: async (payload) => {
    const res = await axiosInstance.post(
      API_ENDPOINTS.SHOP.REVIEWS(payload.product_id),
      payload
    );
    return res.data;
  },

  /** Tính điểm trung bình (Hàm phụ - giữ nguyên) */
  getAvgRating: (reviews = []) => {
    if (!reviews.length) return 0;
    const sum = reviews.reduce((s, r) => s + r.rating, 0);
    return (sum / reviews.length).toFixed(1);
  },
};