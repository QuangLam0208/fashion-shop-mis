package com.fashion.dto.response;

import com.fashion.model.enums.OrderStatus;
import com.fashion.model.enums.PaymentMethod;
import com.fashion.model.enums.RefundStatus;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItemSummaryDTO {
    private Long orderItemId;
    private Long orderId; // Để link bấm về Chi tiết Hóa đơn gốc
    private Long productId;
    private Instant orderDate;
    private PaymentMethod paymentMethod;
    private String productName;
    private String productImage;
    private String size;
    private String color;
    private Long quantity;
    private Double price;
    private Double itemTotalAmount; // quantity * price
    private Double orderTotalAmount;
    private OrderStatus status; // Trạng thái tiến độ duy nhất của Item này
    private RefundStatus refundStatus;
    private String cancellationReason;
    @JsonProperty("isReviewed")
    private boolean isReviewed;
}
