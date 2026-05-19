package com.fashion.service.payment;

import com.fashion.dto.request.ProcessPaymentRequestDTO;
import com.fashion.dto.response.PaymentResponseDTO;
import com.fashion.model.Order;
import com.fashion.model.OrderHistory;
import com.fashion.model.OrderItem;
import com.fashion.model.enums.OrderStatus;
import com.fashion.repository.OrderHistoryRepository;
import com.fashion.repository.OrderItemRepository;
import com.fashion.repository.OrderRepository;
import com.fashion.service.order.OrderManagementService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final OrderHistoryRepository orderHistoryRepository;
    private final MomoService momoService;
    private final OrderManagementService orderManagementService;

    @Override
    @Transactional
    public void processMomoIPN(Map<String, Object> payload) {
        Map<String, String> stringParams = new java.util.HashMap<>();
        payload.forEach((k, v) -> stringParams.put(k, String.valueOf(v)));

        if (!momoService.verifySignature(stringParams)) {
            throw new RuntimeException("Chữ ký MoMo không hợp lệ!");
        }

        int resultCode = Integer.parseInt(stringParams.get("resultCode"));
        Long orderId = Long.parseLong(stringParams.get("orderId"));

        updateOrderPayStatus(orderId, resultCode == 0);
    }

    @Override
    @Transactional
    public String processMomoReturn(Map<String, String> allParams) {
        if (!momoService.verifySignature(allParams)) {
            return "failed";
        }

        String resultCode = allParams.get("resultCode");
        Long orderId = Long.parseLong(allParams.get("orderId"));

        boolean success = "0".equals(resultCode);
        updateOrderPayStatus(orderId, success);

        return success ? "success" : "failed";
    }

    private void updateOrderPayStatus(Long orderId, boolean success) {
        Optional<Order> orderOpt = orderRepository.findById(orderId);
        if (orderOpt.isPresent()) {
            Order order = orderOpt.get();
            for (OrderItem item : order.getOrderItems()) {
                if (item.getStatus() == OrderStatus.PENDING_PAYMENT || item.getStatus() == OrderStatus.PAYMENT_FAILED) {
                    OrderStatus previousStatus = item.getStatus();
                    OrderStatus newStatus = success ? OrderStatus.PAID : OrderStatus.PAYMENT_FAILED;

                    item.setStatus(newStatus);
                    orderItemRepository.save(item);

                    // Lưu lịch sử nếu thành công
                    if (success) {
                        OrderHistory history = OrderHistory.builder()
                                .orderItem(item)
                                .previousStatus(previousStatus)
                                .newStatus(newStatus)
                                .changeDate(new Date())
                                .build();
                        orderHistoryRepository.save(history);
                    }
                }
            }
            // ĐỒNG BỘ TRẠNG THÁI TỔNG QUÁT CỦA ORDER
            orderManagementService.updateOverallOrderStatus(order);
        }
    }

    @Override
    @Transactional
    public PaymentResponseDTO processPayment(ProcessPaymentRequestDTO dto) {
        Order order = orderRepository.findById(dto.getOrderId())
                .orElseThrow(() -> new RuntimeException("Đơn hàng không tồn tại!"));
        // Giữ lại logic cũ (mock) nếu cần, hoặc refactor để dùng chung updateOrderPayStatus
        updateOrderPayStatus(order.getId(), true);
        return PaymentResponseDTO.builder()
                .status("SUCCESS")
                .message("Thanh toán thành công (Mock)!")
                .build();
    }
}
