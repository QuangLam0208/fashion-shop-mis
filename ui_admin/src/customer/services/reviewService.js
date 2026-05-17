// src/customer/services/reviewService.js
import { USE_MOCK, API_ENDPOINTS } from '../../shared/config/apiConfig';
import axiosInstance from '../../shared/config/axiosInstance';
import { mockReviews } from '../../shared/mocks/reviewMock';

export const reviewService = {
  /** Lấy tất cả đánh giá của 1 sản phẩm */
  getByProduct: async (productId) => {
    if (USE_MOCK) {
      return mockReviews.filter((r) => r.product_id === +productId);
    }
    const res = await axiosInstance.get(API_ENDPOINTS.SHOP.REVIEWS(productId));
    return res.data;
  },

  /**
   * Gửi đánh giá
   * payload: { product_id, order_item_id, rating, comment, images[] }
   */
  submit: async (payload) => {
    if (USE_MOCK) {
      const newReview = {
        review_id: Date.now(),
        product_id: payload.product_id,
        user_id: 2,
        user_name: 'Bạn',
        rating: payload.rating,
        comment: payload.comment,
        images: payload.images || [],
        created_at: new Date().toISOString(),
      };
      mockReviews.push(newReview);
      return newReview;
    }
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