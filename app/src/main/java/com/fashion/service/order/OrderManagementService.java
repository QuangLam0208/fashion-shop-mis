package com.fashion.service.order;

import com.fashion.dto.response.MessageResponseDTO;
import com.fashion.dto.response.OrderDetailResponseDTO;
import com.fashion.dto.response.OrderSummaryResponseDTO;
import com.fashion.model.Order;
import com.fashion.model.enums.OrderStatus;
import com.fashion.model.enums.RefundStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Date;

public interface OrderManagementService {

    // Cập nhật trạng thái của một sản phẩm trong đơn hàng (dành cho Admin)
    void updateOrderItemStatus(Long orderItemId, OrderStatus newStatus);

    Page<OrderSummaryResponseDTO> getAllOrders(OrderStatus status, Date startDate, Date endDate, Pageable pageable);

    OrderDetailResponseDTO getOrderDetail(Long orderId);

    MessageResponseDTO updateOrderStatus(Long orderId, OrderStatus status);

    void updateRefundStatus(Long orderItemId, RefundStatus status);

    void updateOverallOrderStatus(Order order);
}
