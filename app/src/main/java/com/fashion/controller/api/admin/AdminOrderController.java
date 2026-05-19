package com.fashion.controller.api.admin;

import com.fashion.dto.response.MessageResponseDTO;
import com.fashion.dto.response.OrderDetailResponseDTO;
import com.fashion.dto.response.OrderSummaryResponseDTO;
import com.fashion.model.enums.OrderStatus;
import com.fashion.model.enums.RefundStatus;
import com.fashion.service.order.OrderManagementService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Date;

@RestController
@RequestMapping("/api/admin/orders")
@RequiredArgsConstructor
public class AdminOrderController {

    private final OrderManagementService orderManagementService;

    // DANH SÁCH TẤT CẢ ĐƠN HÀNG
    @GetMapping
    public ResponseEntity<Page<OrderSummaryResponseDTO>> getAllOrders(
            @RequestParam(required = false) OrderStatus status,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") Date startDate,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") Date endDate,
            Pageable pageable
    ) {
        return ResponseEntity.ok(orderManagementService.getAllOrders(status, startDate, endDate, pageable));
    }

    // XEM CHI TIẾT ĐƠN HÀNG
    @GetMapping("/{orderId}")
    public ResponseEntity<OrderDetailResponseDTO> getOrderDetail(
            @PathVariable Long orderId
    ) {
        return ResponseEntity.ok(orderManagementService.getOrderDetail(orderId));
    }

    // CẬP NHẬT TRẠNG THÁI ĐƠN HÀNG
    @PatchMapping("/{orderId}/status")
    public ResponseEntity<MessageResponseDTO> updateOrderStatus(
            @PathVariable Long orderId,
            @RequestParam OrderStatus status
    ) {
        return ResponseEntity.ok(orderManagementService.updateOrderStatus(orderId, status));
    }

    // CẬP NHẬT TRẠNG THÁI TỪNG SẢN PHẨM TRONG ĐƠN
    @PatchMapping("/items/{itemId}/status")
    public ResponseEntity<Void> updateOrderItemStatus(
            @PathVariable Long itemId,
            @RequestParam OrderStatus status
    ) {
        orderManagementService.updateOrderItemStatus(itemId, status);
        return ResponseEntity.noContent().build();
    }
    // CẬP NHẬT TRẠNG THÁI HOÀN TIỀN
    @PatchMapping("/items/{itemId}/refund-status")
    public ResponseEntity<Void> updateRefundStatus(
            @PathVariable Long itemId,
            @RequestParam RefundStatus status
    ) {
        orderManagementService.updateRefundStatus(itemId, status);
        return ResponseEntity.noContent().build();
    }
}
