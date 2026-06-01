package com.fashion.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubmitReturnRequestDTO {
    @NotNull(message = "ID đơn hàng không được để trống")
    private Long orderId;

    @NotEmpty(message = "Danh sách sản phẩm hoàn trả không được rỗng")
    private List<Long> itemIds;

    @NotBlank(message = "Lý do hoàn trả không được để trống")
    @Size(max = 255, message = "Lý do hoàn trả tối đa 255 ký tự")
    private String reason;

    @Size(max = 1000, message = "Mô tả chi tiết tối đa 1000 ký tự")
    private String description;

    @Size(max = 5, message = "Tối đa 5 ảnh minh họa")
    private List<String> imageUrls;
}
