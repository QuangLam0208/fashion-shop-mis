package com.fashion.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WishlistToggleResponseDTO {
    private Long productId;
    private boolean wishlisted;
    private String message;
}
