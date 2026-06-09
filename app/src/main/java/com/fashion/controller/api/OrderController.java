package com.fashion.controller.api;

import com.fashion.dto.request.CancelOrderRequestDTO;
import com.fashion.dto.request.PlaceOrderRequestDTO;
import com.fashion.dto.response.*;
import com.fashion.model.enums.OrderStatus;
import com.fashion.service.order.OrderService;
import com.fashion.util.SecurityUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    // ĐẶT HÀNG
    @PostMapping
    public ResponseEntity<PlaceOrderResponseDTO> placeOrder(
            @Valid @RequestBody PlaceOrderRequestDTO dto) {
        // Luôn ghi đè userId từ session để đảm bảo bảo mật
        dto.setUserId(SecurityUtils.getAuthenticatedUserId());
        PlaceOrderResponseDTO response = orderService.placeOrder(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // LẤY DANH SÁCH ĐƠN HÀNG (DẠNG GỘP ORDER) - DÙNG CHO TAB ALL
    @GetMapping("/list")
    public ResponseEntity<Page<OrderSummaryResponseDTO>> getMyOrders(
            @RequestParam(required = false) List<OrderStatus> statuses,
            Pageable pageable) {
        Long userId = SecurityUtils.getAuthenticatedUserId();
        Page<OrderSummaryResponseDTO> response = orderService.getMyOrders(userId, statuses, pageable);
        return ResponseEntity.ok(response);
    }

    // LẤY DANH SÁCH SẢN PHẨM TRONG ĐƠN (ORDER ITEM) - DÙNG CHO CÁC TAB TRẠNG THÁI
    @GetMapping("/items")
    public ResponseEntity<Page<OrderItemSummaryDTO>> getMyOrderItems(
            @RequestParam(required = false) List<OrderStatus> statuses,
            @RequestParam(required = false) Boolean reviewed,
            Pageable pageable) {
        Long userId = SecurityUtils.getAuthenticatedUserId();
        Page<OrderItemSummaryDTO> response = orderService.getMyOrderItems(userId, statuses, reviewed, pageable);
        return ResponseEntity.ok(response);
    }

    // XEM CHI TIẾT ĐƠN HÀNG
    @GetMapping("/history/{orderId}")
    public ResponseEntity<OrderDetailResponseDTO> getMyOrderDetail(@PathVariable Long orderId) {
        // Lấy ID người dùng đang đăng nhập từ token
        Long currentUserId = SecurityUtils.getAuthenticatedUserId();

        // Gọi service đã được cập nhật thêm tham số currentUserId để check bảo mật (403)
        OrderDetailResponseDTO orderDetail = orderService.getMyOrderDetail(currentUserId, orderId);

        return ResponseEntity.ok(orderDetail);
    }

    // HỦY ĐƠN HÀNG
    @PostMapping("/{orderId}/cancel")
    public ResponseEntity<MessageResponseDTO> cancelOrder(
            @PathVariable Long orderId,
            @Valid @RequestBody CancelOrderRequestDTO dto) {
        Long userId = SecurityUtils.getAuthenticatedUserId();
        MessageResponseDTO response = orderService.cancelOrder(userId, orderId, dto);
        return ResponseEntity.ok(response);
    }

    // THANH TOÁN LẠI (Cho đơn hàng MoMo chưa quá hạn)
    @PostMapping("/{orderId}/retry-payment")
    public ResponseEntity<MessageResponseDTO> retryPayment(@PathVariable Long orderId) {
        Long userId = SecurityUtils.getAuthenticatedUserId();
        String paymentUrl = orderService.retryPayment(userId, orderId);
        return ResponseEntity.ok(new MessageResponseDTO(paymentUrl));
    }


    // DASHBOARD SUMMARY
    @GetMapping("/dashboard-summary")
    public ResponseEntity<OrderDashboardSummaryDTO> getDashboardSummary() {
        Long userId = SecurityUtils.getAuthenticatedUserId();
        return ResponseEntity.ok(orderService.getDashboardSummary(userId));
    }
    @GetMapping("/history")
    public ResponseEntity<List<OrderSummaryResponseDTO>> getMyOrderHistory() {
        Long currentUserId = SecurityUtils.getAuthenticatedUserId();
        List<OrderSummaryResponseDTO> orderHistory = orderService.getCustomerOrderHistory(currentUserId);

        // AC-BE-US28-01: Trả về 200 OK với mảng orders (có thể rỗng)
        return ResponseEntity.ok(orderHistory);
    }
}
