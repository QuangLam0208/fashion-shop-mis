package com.fashion.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WishlistItemResponseDTO {
    private Long wishlistItemId;
    private Long productId;
    private String productName;
    private Double productPrice;
    private String primaryImageUrl;
    private String categoryName;
    private Boolean inStock;
}
