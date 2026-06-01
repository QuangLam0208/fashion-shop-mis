package com.fashion.service.review;

import com.fashion.dto.request.SubmitReviewRequestDTO;
import com.fashion.dto.response.MessageResponseDTO;
import com.fashion.dto.response.ReviewResponseDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ReviewService {
    // Lấy đánh giá của một sản phẩm
    Page<ReviewResponseDTO> getReviewsByProduct(Long productId, Pageable pageable);

    // Lấy đánh giá của bản thân
    Page<ReviewResponseDTO> getReviewsByUser(Long userId, Pageable pageable);

    // Admin
    Page<ReviewResponseDTO> getAllReviews(Pageable pageable);

    // Đánh giá sản phẩm
    MessageResponseDTO submitReview(Long userId, SubmitReviewRequestDTO dto);
}
