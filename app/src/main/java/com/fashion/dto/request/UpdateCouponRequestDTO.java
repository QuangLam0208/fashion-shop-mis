package com.fashion.dto.request;

import com.fashion.model.enums.DiscountType;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateCouponRequestDTO {
    @NotBlank(message = "Mã giảm giá không được để trống")
    @Size(min = 3, max = 50, message = "Mã giảm giá phải từ 3-50 ký tự")
    @Pattern(regexp = "^[A-Z0-9_-]+$", message = "Mã chỉ được chứa chữ in hoa, số, gạch ngang và gạch dưới")
    private String code;

    @NotNull(message = "Giá trị giảm không được để trống")
    @Positive(message = "Giá trị giảm phải lớn hơn 0")
    private Double discountValue;

    @NotNull(message = "Loại giảm giá không được để trống")
    private DiscountType discountType;

    @NotNull(message = "Ngày bắt đầu không được để trống")
    private Instant startDate;

    @NotNull(message = "Ngày hết hạn không được để trống")
    private Instant expiryDate;

    @PositiveOrZero(message = "Giá trị đơn hàng tối thiểu không được âm")
    private Double minOrderAmount;

    @Positive(message = "Giới hạn sử dụng phải lớn hơn 0")
    private Integer usageLimit;

    private boolean active;
}
