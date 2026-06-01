package com.fashion.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ReviewResponseDTO {
    private Long reviewId;
    private Long productId;
    private String productName;
    private String productImage;
    private Long userId;
    private String customerName;
    private Integer rating;
    private String comment;
    private Double price;
    private String orderDate;
    private String createdAt;
}
