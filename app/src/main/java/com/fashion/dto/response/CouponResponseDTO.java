package com.fashion.dto.response;

import com.fashion.model.enums.DiscountType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CouponResponseDTO {
    private Long couponId;
    private String code;
    private Double discountValue;
    private DiscountType discountType;
    private Instant startDate;
    private Instant expiryDate;
    private Double minOrderAmount;
    private Integer usageLimit;
    private boolean active;
    private boolean used;
    private boolean collected;
}
