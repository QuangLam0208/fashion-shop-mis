package com.fashion.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CartItemResponseDTO {
    private Long cartItemId;
    private Long variantId;
    private Long productId;
    private String productName;
    private String size;
    private String color;
    private Double price;
    private int quantity;
    private String primaryImageUrl;
}
