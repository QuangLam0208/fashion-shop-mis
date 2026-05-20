package com.fashion.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AddToCartRequestDTO {
    @NotNull(message = "ID biến thể sản phẩm không được để trống")
    private Long variantId;

    @Min(value = 1, message = "Số lượng phải ít nhất là 1")
    private int quantity;
}
