package com.fashion.dto.response;

import com.fashion.model.enums.ProductStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductSummaryResponseDTO {
    private Long productId;
    private String name;
    private Double price;
    private Double minPrice;
    private String category;
    private String subcategory;
    private ProductStatus status;
    private String primaryImageUrl;
    private String hoverImageUrl;
    private long totalStock;
    private int variantCount;
    private Double averageRating;
    private long reviewCount;
}
