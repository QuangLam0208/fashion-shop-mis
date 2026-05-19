package com.fashion.service.order;

import com.fashion.dto.request.CancelOrderRequestDTO;
import com.fashion.dto.request.PlaceOrderRequestDTO;
import com.fashion.dto.response.*;
import com.fashion.model.enums.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface OrderService {
    // Đặt hàng
    PlaceOrderResponseDTO placeOrder(PlaceOrderRequestDTO dto);

    // Theo dõi trạng thái đơn hàng - Xem danh sách đơn hàng
    Page<OrderSummaryResponseDTO> getMyOrders(Long userId, List<OrderStatus> statuses, Pageable pageable);

    // Dùng cho giao diện cá nhân: Liệt kê chi tiết từng món đồ (OrderItem) của User
    Page<OrderItemSummaryDTO> getMyOrderItems(Long userId, List<OrderStatus> statuses, Boolean reviewed,
                                              Pageable pageable);

    // Theo dõi trạng thái đơn hàng - Xem chi tiết đơn hàng
    OrderDetailResponseDTO getMyOrderDetail(Long userId, Long orderId);

    // Hủy đơn hàng
    MessageResponseDTO cancelOrder(Long userId, Long orderId, CancelOrderRequestDTO dto);

    // Thanh toán lại cho đơn MOMO
    String retryPayment(Long userId, Long orderId);


    // Hoàn kho (dùng cho cleanup task)
    void revertInventory(Long orderId);

    // DASHBOARD: Lấy thông tin tóm tắt đơn hàng cho Dashboard người dùng
    OrderDashboardSummaryDTO getDashboardSummary(Long userId);
}
