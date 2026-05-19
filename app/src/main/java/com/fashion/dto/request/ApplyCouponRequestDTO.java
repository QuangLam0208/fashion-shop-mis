package com.fashion.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApplyCouponRequestDTO {
    @NotBlank(message = "Mã giảm giá không được để trống")
    private String couponCode;
}
