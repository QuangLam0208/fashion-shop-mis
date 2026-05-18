package com.fashion.dto.response;

import com.fashion.model.enums.DiscountType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApplyCouponResponseDTO {
    private String couponCode;
    private Double discountValue; // Original value (e.g., 10 for 10% or 50000 for 50k)
    private Double discountAmount; // Calculated money saved (e.g., 36000)
    private DiscountType discountType;
    private Double newTotalAmount;
    private String message;
}
