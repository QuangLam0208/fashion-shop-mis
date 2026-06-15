package com.fashion.service.review;

import com.fashion.dto.request.SubmitReviewRequestDTO;
import com.fashion.dto.response.ReviewResponseDTO;
import com.fashion.dto.response.ProductReviewListResponseDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ReviewService {
    // Lấy đánh giá của một sản phẩm
    ProductReviewListResponseDTO getReviewsByProduct(Long productId, Pageable pageable);

    // Lấy đánh giá của bản thân
    Page<ReviewResponseDTO> getReviewsByUser(Long userId, Pageable pageable);

    // Admin
    Page<ReviewResponseDTO> getAllReviews(Pageable pageable);

    // Đánh giá sản phẩm
    ReviewResponseDTO submitReview(Long userId, SubmitReviewRequestDTO dto);
}
