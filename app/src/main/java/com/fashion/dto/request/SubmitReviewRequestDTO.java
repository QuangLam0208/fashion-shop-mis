package com.fashion.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubmitReviewRequestDTO {
    @NotNull(message = "ID sản phẩm không được để trống")
    private Long productId;

    private Long orderItemId;

    @Min(value = 1, message = "Đánh giá thấp nhất là 1 sao")
    @Max(value = 5, message = "Đánh giá cao nhất là 5 sao")
    private int rating;

    @Size(max = 1000, message = "Nội dung đánh giá không được vượt quá 1000 ký tự")
    private String comment;

    @Size(max = 5, message = "Tối đa 5 ảnh minh họa")
    private java.util.List<String> imageUrls;
}
