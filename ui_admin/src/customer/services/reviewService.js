import { API_ENDPOINTS } from '../../shared/config/apiConfig';
import axiosInstance from '../../shared/config/axiosInstance';

export const reviewService = {
  /** Lấy tất cả đánh giá của 1 sản phẩm */
  getByProduct: async (productId) => {
    const res = await axiosInstance.get(API_ENDPOINTS.SHOP.REVIEWS(productId));
    return res.data;
  },

  /**
   * Gửi đánh giá
   * payload: { product_id, order_item_id, rating, comment, images[] }
   */
  submit: async (payload) => {
    const res = await axiosInstance.post(
      API_ENDPOINTS.SHOP.REVIEWS(payload.product_id),
      payload
    );
    return res.data;
  },

  /** Tính điểm trung bình */
  getAvgRating: (reviews = []) => {
    if (!reviews.length) return 0;
    const sum = reviews.reduce((s, r) => s + r.rating, 0);
    return (sum / reviews.length).toFixed(1);
  },
};