package com.fashion.service.order;

import com.fashion.dto.response.MessageResponseDTO;
import com.fashion.dto.response.OrderDetailResponseDTO;
import com.fashion.dto.response.OrderSummaryResponseDTO;
import com.fashion.exception.BadRequestException;
import com.fashion.exception.ResourceNotFoundException;
import com.fashion.model.Order;
import com.fashion.model.OrderHistory;
import com.fashion.model.OrderItem;
import com.fashion.model.ReturnRequest;
import com.fashion.model.enums.DiscountType;
import com.fashion.model.enums.OrderStatus;
import com.fashion.model.enums.RefundStatus;
import com.fashion.model.enums.ReturnStatus;
import com.fashion.repository.OrderHistoryRepository;
import com.fashion.repository.OrderItemRepository;
import com.fashion.repository.OrderRepository;
import com.fashion.repository.ReturnRequestRepository;
import com.fashion.service.notification.NotificationService;
import com.fashion.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;
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
        Long currentAdminId = SecurityUtils.getAuthenticatedUserId();
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
                .changedByAdminId(currentAdminId)
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
        boolean isValid = false;

        switch (currentStatus) {
            // ================= LUỒNG THANH TOÁN ONLINE =================
            case PENDING_PAYMENT:
                // Chờ thanh toán -> Đã thanh toán / Thất bại / Hết hạn / User hủy
                isValid = (newStatus == OrderStatus.PAID ||
                        newStatus == OrderStatus.PAYMENT_FAILED ||
                        newStatus == OrderStatus.PAYMENT_EXPIRED ||
                        newStatus == OrderStatus.CANCELLED);
                break;
            case PAID:
                // Đã thanh toán -> Xác nhận / Đang xử lý / Admin hủy (để hoàn tiền)
                isValid = (newStatus == OrderStatus.CONFIRMED ||
                        newStatus == OrderStatus.PROCESSING ||
                        newStatus == OrderStatus.CANCELLED);
                break;

            // ================= LUỒNG COD & XỬ LÝ CHUNG =================
            case PENDING_CONFIRMATION:
                // Chờ xác nhận -> Đã xác nhận / Hủy
                isValid = (newStatus == OrderStatus.CONFIRMED || newStatus == OrderStatus.CANCELLED);
                break;

            case CONFIRMED:
                isValid = (newStatus == OrderStatus.PROCESSING);
                // Đã xác nhận -> Đang xử lý / Hủy (khách đổi ý phút chót)
                isValid = (newStatus == OrderStatus.PROCESSING || newStatus == OrderStatus.CANCELLED);
                break;

            case PROCESSING:
                // Đang xử lý -> Đang giao hàng
                isValid = (newStatus == OrderStatus.SHIPPING);
                break;

            case SHIPPING:
                // Đang giao -> Đã giao / Hoàn hàng (Bom hàng)
                isValid = (newStatus == OrderStatus.DELIVERED || newStatus == OrderStatus.RETURNED);
                break;

            case DELIVERED:
                // Đã giao -> Hoàn thành (sau khi hết hạn đổi trả) / Hoàn hàng (Khách yêu cầu trả hàng)
                isValid = (newStatus == OrderStatus.COMPLETED || newStatus == OrderStatus.RETURNED);
                break;

            default:
                isValid = false;
                break;
        }
        if (!isValid) {
            throw new BadRequestException("Chuyển đổi trạng thái không hợp lệ: Từ " + currentStatus + " sang " + newStatus);
        }
    }

    @Override
    public Page<OrderSummaryResponseDTO> getAllOrders(OrderStatus status, Date startDate, Date endDate, Pageable pageable) {

        Instant startInstant = (startDate != null) ? startDate.toInstant() : null;
        Instant endInstant = (endDate != null) ? endDate.toInstant().plusSeconds(86399) : null;

        return orderRepository.searchOrders(status, startInstant, endInstant, pageable).map(o -> {
            Map<String, Integer> statusSummary = new HashMap<>();
            for (OrderItem item : o.getOrderItems()) {
                String ss = item.getStatus().name();
                statusSummary.put(ss, statusSummary.getOrDefault(ss, 0) + 1);
            }

            String name = (o.getUser() != null) ? o.getUser().getFullName() : null;
            String email = (o.getUser() != null) ? o.getUser().getEmail() : null;

            return OrderSummaryResponseDTO.builder()
                    .orderId(o.getId())
                    .orderDate(o.getOrderDate())
                    .totalAmount(o.getTotalAmount())
                    .paymentMethod(o.getPaymentMethod())
                    .status(o.getStatus())
                    .itemCount(o.getOrderItems().size())
                    .statusSummary(statusSummary)
                    .customerName(name)
                    .customerEmail(email)
                    .build();
        });
    }

    @Override
    public OrderDetailResponseDTO getOrderDetail(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Đơn hàng #" + orderId + " không tồn tại trong hệ thống!"));

        // 1. Tính toán Subtotal (tổng tiền trước giảm giá)
        double subtotalAmount = 0.0;

        List<OrderDetailResponseDTO.OrderItemDTO> itemDTOs = order.getOrderItems().stream().map(item -> {

            List<OrderDetailResponseDTO.OrderHistoryDTO> histories = item.getOrderHistories().stream()
                    .sorted(Comparator.comparing(h -> h.getChangeDate()))
                    .map(h -> OrderDetailResponseDTO.OrderHistoryDTO.builder()
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

        // Cộng dồn subtotal từ danh sách items
        for (OrderItem item : order.getOrderItems()) {
            subtotalAmount += (item.getProductVariant().getPrice() * item.getQuantity());
        }

        // 2. Map CustomerInfo
        OrderDetailResponseDTO.CustomerInfo customerInfo = null;
        if (order.getUser() != null) {
            customerInfo = OrderDetailResponseDTO.CustomerInfo.builder()
                    .userId(order.getUser().getId())
                    .fullName(order.getUser().getFullName())
                    .email(order.getUser().getEmail())
                    .phone(order.getUser().getPhone())
                    .build();
        }

        // 3. Xử lý logic Coupon theo Acceptance Criteria
        String couponCode = null;
        Double discountAmount = 0.0;
        Double discountValue = 0.0;
        DiscountType discountType = null; // Cần import com.fashion.model.enums.DiscountType (nếu chưa có)

        if (order.getCoupon() != null) {
            // Giả định Entity Coupon của bạn có các getter tương ứng (getCode, getDiscountValue, getDiscountType)
            couponCode = order.getCoupon().getCode();
            discountValue = order.getCoupon().getDiscountValue();
            discountType = order.getCoupon().getDiscountType();

            // Tính số tiền đã giảm = Tổng tiền hàng - Tổng tiền thanh toán (tránh số âm do sai số float/double)
            double calculatedDiscount = subtotalAmount - order.getTotalAmount();
            discountAmount = Math.max(calculatedDiscount, 0.0);
        }

        // 4. Build DTO trả về kết quả cuối cùng
        return OrderDetailResponseDTO.builder()
                .orderId(order.getId())
                .orderDate(order.getOrderDate())
                .totalAmount(order.getTotalAmount())
                .status(order.getStatus())
                .paymentMethod(order.getPaymentMethod())
                .shippingAddress(order.getShippingAddress())
                .subtotalAmount(subtotalAmount)     // THÊM MỚI
                .couponCode(couponCode)             // THÊM MỚI
                .discountAmount(discountAmount)     // THÊM MỚI
                .discountValue(discountValue)       // THÊM MỚI
                .discountType(discountType)         // THÊM MỚI
                .userInfo(customerInfo)
                .items(itemDTOs)
                .build();
    }

    @Override
    @Transactional
    public MessageResponseDTO updateOrderStatus(Long orderId, OrderStatus status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Đơn hàng không tồn tại!"));

        boolean updated = false;
        List<OrderItem> items = new ArrayList<>(order.getOrderItems());

        for (OrderItem item : items) {
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

        RefundStatus currentStatus = item.getRefundStatus();

        if (currentStatus != RefundStatus.PENDING) {
            throw new RuntimeException(
                    "Chỉ sản phẩm đang chờ xử lý mới được cập nhật trạng thái refund!"
            );
        }

        if (status != RefundStatus.COMPLETED
                && status != RefundStatus.REJECTED
                && status != RefundStatus.FAILED) {

            throw new RuntimeException(
                    "Trạng thái refund không hợp lệ!"
            );
        }

        item.setRefundStatus(status);
        if (status == RefundStatus.COMPLETED) {
            item.setStatus(OrderStatus.RETURNED);
        }
        orderItemRepository.save(item);

        // ĐỒNG BỘ VỚI RETURN REQUEST NẾU CÓ
        if (item.getReturnRequest() != null) {
            ReturnRequest rr = item.getReturnRequest();
            if (status == RefundStatus.COMPLETED) {
                // Kiểm tra xem tất cả các item trong yêu cầu hoàn trả này đã được hoàn tiền chưa
                boolean allCompleted = rr.getReturnItems().stream()
                        .allMatch(i -> i.getRefundStatus() == RefundStatus.COMPLETED
                                || i.getRefundStatus() == RefundStatus.REJECTED);

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
        if (status == RefundStatus.REJECTED) {

            String content =
                    "Yêu cầu hoàn tiền cho sản phẩm '"
                            + item.getProductName()
                            + "' trong đơn hàng #"
                            + item.getOrder().getId()
                            + " đã bị từ chối.";

            notificationService.createNotification(
                    item.getOrder().getUser(),
                    "Thông báo hoàn tiền",
                    content,
                    "WARNING",
                    item.getOrder().getId()
            );
        }
    }
}
