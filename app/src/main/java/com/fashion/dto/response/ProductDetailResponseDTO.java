package com.fashion.dto.response;

import com.fashion.model.enums.ProductStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductDetailResponseDTO {
    private Long productId;
    private String name;
    private Double price;
    private Double minPrice;
    private String category;
    private String categoryName;
    private Long categoryId;
    private String description;
    private ProductStatus status;
    private Double averageRating;
    private long reviewCount;
    private String mainImage;
    private String hoverImage;
    private List<ProductImageDTO> images;
    private List<ProductVariantDTO> variants;
    private List<ReviewDTO> reviews;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ProductImageDTO {
        private Long imageId;
        private String url;
        private String color;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ProductVariantDTO {
        private Long variantId;
        private String size;
        private String color;
        private Long stockQuantity;
        private Double price;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ReviewDTO {
        private Long reviewId;
        private int rating;
        private String comment;
        private String reviewerName;
        private String size;
        private String color;
        private String createdAt;
    }
}
