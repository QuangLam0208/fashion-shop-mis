package com.fashion.dto.response;

import com.fashion.model.enums.OrderStatus;
import com.fashion.model.enums.PaymentMethod;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderSummaryResponseDTO {
    private Long orderId;
    private Instant orderDate;
    private Double totalAmount;
    private PaymentMethod paymentMethod;
    private int itemCount;
    private OrderStatus status; // Trạng thái tổng quát của đơn hàng
    // Tổng hợp trạng thái của từng sản phẩm: VD {"PAID": 2, "SHIPPING": 1}
    private Map<String, Integer> statusSummary;
    private List<OrderItemPreviewDTO> items;
}
