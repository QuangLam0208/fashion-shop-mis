package com.fashion.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CollectCouponRequestDTO {
    @NotNull(message = "ID mã giảm giá không được để trống")
    private Long couponId;
}
