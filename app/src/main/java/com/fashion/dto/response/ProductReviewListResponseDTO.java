package com.fashion.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.domain.Page;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ProductReviewListResponseDTO {
    private Long totalReviews;
    private Double averageRating;
    private Page<ReviewResponseDTO> reviews;
}
