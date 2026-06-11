package com.fashion.dto.response;

import com.fashion.model.enums.RefundStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReturnItemDTO {
    private Long orderItemId;
    private String productName;
    private String productImage;
    private String size;
    private String color;
    private Long quantity;
    private Double price;
    private RefundStatus refundStatus;
}
