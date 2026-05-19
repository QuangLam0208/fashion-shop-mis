package com.fashion.dto.response;

import com.fashion.model.enums.DiscountType;
import com.fashion.model.enums.OrderStatus;
import com.fashion.model.enums.PaymentMethod;
import com.fashion.model.enums.RefundStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderDetailResponseDTO {
    private Long orderId;
    private Instant orderDate;
    private Double totalAmount;
    private OrderStatus status;
    private PaymentMethod paymentMethod;
    private String shippingAddress;
    private Double subtotalAmount;
    private String couponCode;
    private Double discountAmount;
    private Double discountValue;
    private DiscountType discountType;
    private List<OrderItemDTO> items;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class OrderItemDTO {
        private Long orderItemId;
        private Long productId;
        private String productName;
        private String productImage;
        private String size;
        private String color;
        private Long quantity;
        private Double price;
        private OrderStatus status;
        private RefundStatus refundStatus;
        private Long returnRequestId;
        private String returnStatus;
        private String cancellationReason;
        private List<OrderHistoryDTO> histories;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class OrderHistoryDTO {
        private OrderStatus previousStatus;
        private OrderStatus newStatus;
        private Instant changeDate;
    }
}
