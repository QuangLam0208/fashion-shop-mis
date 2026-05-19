package com.fashion.service.order;

import com.fashion.dto.response.MessageResponseDTO;
import com.fashion.dto.response.OrderDetailResponseDTO;
import com.fashion.dto.response.OrderSummaryResponseDTO;
import com.fashion.model.Order;
import com.fashion.model.OrderHistory;
import com.fashion.model.OrderItem;
import com.fashion.model.ReturnRequest;
import com.fashion.model.enums.OrderStatus;
import com.fashion.model.enums.RefundStatus;
import com.fashion.model.enums.ReturnStatus;
import com.fashion.repository.OrderHistoryRepository;
import com.fashion.repository.OrderItemRepository;
import com.fashion.repository.OrderRepository;
import com.fashion.repository.ReturnRequestRepository;
import com.fashion.service.notification.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderManagementServiceImpl implements OrderManagementService {

    private final OrderItemRepository orderItemRepository;
    private final OrderHistoryRepository historyRepository;
    private final OrderRepository orderRepository;
    private final ReturnRequestRepository returnRequestRepository;
    private final NotificationService notificationService;

    @Override
    @Transactional
    public void updateOrderItemStatus(Long orderItemId, OrderStatus newStatus) {
        OrderItem item = orderItemRepository.findById(orderItemId)
                .orElseThrow(() -> new RuntimeException("Sản phẩm trong đơn hàng không tồn tại!"));

        OrderStatus currentStatus = item.getStatus();
        checkStatusTransition(currentStatus, newStatus);

        item.setStatus(newStatus);
        orderItemRepository.save(item);

        OrderHistory history = OrderHistory.builder()
                .orderItem(item)
                .previousStatus(currentStatus)
                .newStatus(newStatus)
                .changeDate(new Date())
                .build();
        historyRepository.save(history);

        // Đồng bộ trạng thái đơn hàng tổng quát
        updateOverallOrderStatus(item.getOrder());

        // Gửi thông báo cho user
        String content = "Sản phẩm '" + item.getProductName() + "' trong đơn hàng #" + item.getOrder().getId() + " đã chuyển sang trạng thái: " + newStatus;
        notificationService.createNotification(
                item.getOrder().getUser(),
                "Cập nhật trạng thái đơn hàng",
                content,
                "INFO",
                item.getOrder().getId()
        );
    }

    @Override
    public void updateOverallOrderStatus(Order order) {
        if (order.getOrderItems() == null || order.getOrderItems().isEmpty()) return;

        // Ưu tiên trạng thái của đơn hàng dựa trên các item
        // Rule: Trạng thái của Đơn là trạng thái của item "chậm nhất" chưa bị hủy/lỗi.
        // Nếu tất cả đã hoàn thành/hủy thì lấy trạng thái cuối cùng.
        List<OrderStatus> statuses = order.getOrderItems().stream()
                .map(OrderItem::getStatus)
                .collect(Collectors.toList());

        List<OrderStatus> priorityOrder = List.of(
                OrderStatus.PAYMENT_FAILED, OrderStatus.PAYMENT_EXPIRED, OrderStatus.CANCELLED,
                OrderStatus.PENDING_CONFIRMATION, OrderStatus.PENDING_PAYMENT, OrderStatus.PAID,
                OrderStatus.PROCESSING, OrderStatus.SHIPPING, OrderStatus.DELIVERED, OrderStatus.COMPLETED
        );

        // Lọc các item active (không tính failure)
        List<OrderStatus> activeStatuses = statuses.stream()
                .filter(s -> s != OrderStatus.CANCELLED && s != OrderStatus.PAYMENT_FAILED && s != OrderStatus.PAYMENT_EXPIRED)
                .toList();

        OrderStatus dominantStatus;
        if (activeStatuses.isEmpty()) {
            // Tất cả đều đã bị hủy/lỗi: Lấy trạng thái đầu tiên tìm thấy (theo priority)
            dominantStatus = statuses.stream()
                    .min((s1, s2) -> priorityOrder.indexOf(s1) - priorityOrder.indexOf(s2))
                    .orElse(OrderStatus.CANCELLED);
        } else {
            // Có ít nhất 1 item đang tiến triển: Lấy trạng thái "chậm" nhất của active items
            dominantStatus = activeStatuses.stream()
                    .min((s1, s2) -> priorityOrder.indexOf(s1) - priorityOrder.indexOf(s2))
                    .orElse(activeStatuses.get(0));
        }

        if (order.getStatus() != dominantStatus) {
            order.setStatus(dominantStatus);
            orderRepository.save(order);
        }
    }

    private void checkStatusTransition(OrderStatus currentStatus, OrderStatus newStatus) {
        if (currentStatus == OrderStatus.CANCELLED || currentStatus == OrderStatus.COMPLETED) {
            throw new RuntimeException("Không thể chuyển trạng thái từ " + currentStatus + " sang " + newStatus);
        }
    }

    @Override
    public Page<OrderSummaryResponseDTO> getAllOrders(OrderStatus status, Date startDate, Date endDate, Pageable pageable) {
        return orderRepository.searchOrders(status, startDate, endDate, pageable).map(o -> {
            Map<String, Integer> statusSummary = new HashMap<>();
            for (OrderItem item : o.getOrderItems()) {
                String ss = item.getStatus().name();
                statusSummary.put(ss, statusSummary.getOrDefault(ss, 0) + 1);
            }
            return OrderSummaryResponseDTO.builder()
                    .orderId(o.getId())
                    .orderDate(o.getOrderDate())
                    .totalAmount(o.getTotalAmount())
                    .paymentMethod(o.getPaymentMethod())
                    .status(o.getStatus())
                    .itemCount(o.getOrderItems().size())
                    .statusSummary(statusSummary)
                    .build();
        });
    }

    @Override
    public OrderDetailResponseDTO getOrderDetail(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Đơn hàng không tồn tại!"));

        List<OrderDetailResponseDTO.OrderItemDTO> itemDTOs = order.getOrderItems().stream().map(item -> {
            List<OrderDetailResponseDTO.OrderHistoryDTO> histories = item.getOrderHistories().stream().map(h ->
                    OrderDetailResponseDTO.OrderHistoryDTO.builder()
                            .previousStatus(h.getPreviousStatus())
                            .newStatus(h.getNewStatus())
                            .changeDate(h.getChangeDate().toInstant())
                            .build()
            ).collect(Collectors.toList());

            return OrderDetailResponseDTO.OrderItemDTO.builder()
                    .orderItemId(item.getId())
                    .productName(item.getProductName())
                    .size(item.getProductVariant().getSize())
                    .color(item.getProductVariant().getColor())
                    .quantity(item.getQuantity())
                    .price(item.getProductVariant().getPrice())
                    .status(item.getStatus())
                    .refundStatus(item.getRefundStatus())
                    .returnRequestId(item.getReturnRequest() != null ? item.getReturnRequest().getId() : null)
                    .returnStatus(item.getReturnRequest() != null ? item.getReturnRequest().getStatus().name() : null)
                    .cancellationReason(item.getCancellationReason())
                    .histories(histories)
                    .build();
        }).collect(Collectors.toList());

        return OrderDetailResponseDTO.builder()
                .orderId(order.getId())
                .orderDate(order.getOrderDate())
                .totalAmount(order.getTotalAmount())
                .status(order.getStatus())
                .paymentMethod(order.getPaymentMethod())
                .shippingAddress(order.getShippingAddress())
                .items(itemDTOs)
                .build();
    }

    @Override
    @Transactional
    public MessageResponseDTO updateOrderStatus(Long orderId, OrderStatus status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Đơn hàng không tồn tại!"));

        boolean updated = false;
        for (OrderItem item : order.getOrderItems()) {
            if (item.getStatus() != OrderStatus.CANCELLED && item.getStatus() != OrderStatus.COMPLETED && item.getStatus() != status) {
                updateOrderItemStatus(item.getId(), status);
                updated = true;
            }
        }

        if (!updated) {
            throw new RuntimeException("Không có sản phẩm nào trong đơn hàng có thể cập nhật trạng thái mới này!");
        }

        return MessageResponseDTO.builder()
                .message("Cập nhật trạng thái đơn hàng thành công!")
                .build();
    }

    @Override
    @Transactional
    public void updateRefundStatus(Long orderItemId, RefundStatus status) {
        OrderItem item = orderItemRepository.findById(orderItemId)
                .orElseThrow(() -> new RuntimeException("Sản phẩm trong đơn hàng không tồn tại!"));

        item.setRefundStatus(status);
        if (status == RefundStatus.COMPLETED) {
            item.setStatus(OrderStatus.CANCELLED);
        }
        orderItemRepository.save(item);

        // ĐỒNG BỘ VỚI RETURN REQUEST NẾU CÓ
        if (item.getReturnRequest() != null) {
            ReturnRequest rr = item.getReturnRequest();
            if (status == RefundStatus.COMPLETED) {
                // Kiểm tra xem tất cả các item trong yêu cầu hoàn trả này đã được hoàn tiền chưa
                boolean allCompleted = rr.getReturnItems().stream()
                        .allMatch(i -> i.getRefundStatus() == RefundStatus.COMPLETED);

                if (allCompleted) {
                    rr.setStatus(ReturnStatus.COMPLETED);
                    rr.setProcessedAt(new Date());
                    returnRequestRepository.save(rr);
                }
            } else if (status == RefundStatus.FAILED) {
                // Nếu hoàn tiền lỗi, có thể giữ nguyên APPROVED hoặc xử lý tùy nghiệp vụ
                // Ở đây ta giữ nguyên để admin có thể thử lại
            }
        }

        // Gửi thông báo cho user nếu hoàn tiền thành công
        if (status == RefundStatus.COMPLETED) {
            String content = "Sản phẩm '" + item.getProductName() + "' trong đơn hàng #" + item.getOrder().getId() + " đã được hoàn tiền thành công.";
            notificationService.createNotification(
                    item.getOrder().getUser(),
                    "Thông báo hoàn tiền",
                    content,
                    "SUCCESS",
                    item.getOrder().getId()
            );
        }
    }
}
