package com.fashion.dto.request;

import com.fashion.model.enums.ProductStatus;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateProductRequestDTO {

    @NotBlank(message = "Tên sản phẩm không được để trống")
    @Size(min = 2, max = 255, message = "Tên sản phẩm phải từ 2-255 ký tự")
    private String name;

    @NotNull(message = "Danh mục không được để trống")
    private Long categoryId;

    @Size(max = 2000, message = "Mô tả không được vượt quá 2000 ký tự")
    private String description;

    @NotNull(message = "Giá không được để trống")
    @Min(value = 0, message = "Giá không được âm")
    private Double price;

    @NotNull(message = "Trạng thái không được để trống")
    private ProductStatus status;

    private List<String> imageUrls;

    @NotEmpty(message = "Phải có ít nhất một biến thể sản phẩm (variant)")
    @Valid
    private List<ProductVariantRequestDTO> variants;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ProductVariantRequestDTO {
        private Long variantId; // null = thêm mới, có giá trị = cập nhật

        @NotBlank(message = "Kích thước không được để trống")
        @Size(max = 20, message = "Kích thước tối đa 20 ký tự")
        private String size;

        @NotBlank(message = "Màu sắc không được để trống")
        @Size(max = 50, message = "Màu sắc tối đa 50 ký tự")
        private String color;

        @NotNull(message = "Số lượng tồn kho không được để trống")
        @PositiveOrZero(message = "Số lượng tồn kho không được âm")
        private Long stockQuantity;
    }
}
