package com.fashion.service.order;

import com.fashion.dto.request.CancelOrderRequestDTO;
import com.fashion.dto.request.PlaceOrderRequestDTO;
import com.fashion.dto.response.*;
import com.fashion.model.*;
import com.fashion.model.enums.*;
import com.fashion.repository.*;
import com.fashion.service.notification.NotificationService;
import com.fashion.service.payment.MomoService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.Date;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final ProductVariantRepository productVariantRepository;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final OrderHistoryRepository orderHistoryRepository;
    private final CartItemRepository cartItemRepository;
    private final CouponRepository couponRepository;
    private final UserRepository userRepository;
    private final UserCouponRepository userCouponRepository;
    private final MomoService momoService;
    private final NotificationService notificationService;

    // ĐẶT HÀNG

    @Override
    @Transactional
    public PlaceOrderResponseDTO placeOrder(PlaceOrderRequestDTO dto) {
        // 0. Tìm người dùng
        User user = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại!"));

        // 1. Lấy danh sách sản phẩm trong giỏ hàng
        List<CartItem> cartItems = cartItemRepository.findAllById(dto.getCartItemIds());
        if (cartItems.isEmpty()) {
            throw new RuntimeException("Giỏ hàng rỗng hoặc các mục đã bị xóa!");
        }

        // 2. Tính tổng tiền & Xác thực tồn kho
        double totalAmount = 0.0;
        for (CartItem item : cartItems) {
            ProductVariant variant = item.getProductVariant();
            if (variant.getStockQuantity() < item.getQuantity()) {
                throw new RuntimeException(
                        "Sản phẩm " + variant.getProduct().getName() + " không đủ số lượng tồn kho!");
            }
            totalAmount += variant.getPrice() * item.getQuantity();
        }

        // 3. Áp dụng mã giảm giá (Nếu có)
        Coupon appliedCoupon = null;
        if (dto.getCouponCode() != null && !dto.getCouponCode().trim().isEmpty()) {
            Coupon coupon = couponRepository.findByCodeAndActiveTrue(dto.getCouponCode().trim())
                    .orElseThrow(() -> new RuntimeException("Mã giảm giá không tồn tại hoặc đã bị khóa!"));

            if (coupon.getExpiryDate().isBefore(Instant.now()) ||
                    coupon.getStartDate().isAfter(Instant.now())) {
                throw new RuntimeException("Mã giảm giá không hợp lệ hoặc đã hết hạn!");
            }

            if (coupon.getMinOrderAmount() != null && totalAmount < coupon.getMinOrderAmount()) {
                throw new RuntimeException("Đơn hàng chưa đạt giá trị tối thiểu để áp dụng mã giảm giá này!");
            }

            if (coupon.getDiscountType() == DiscountType.PERCENTAGE) {
                totalAmount -= totalAmount * (coupon.getDiscountValue() / 100.0);
            } else {
                totalAmount -= coupon.getDiscountValue();
            }

            if (totalAmount < 0)
                totalAmount = 0.0;

            // 3.5. Kiểm tra xem người dùng đã dùng mã này chưa
            userCouponRepository.findByUserIdAndCouponCode(user.getId(), dto.getCouponCode().trim())
                    .ifPresent(uc -> {
                        if (uc.isUsed()) {
                            throw new RuntimeException("Mã giảm giá này đã được sử dụng!");
                        }
                    });

            appliedCoupon = coupon;
        }

        // 4. Khởi tạo & Lưu Object Order chính
        Order order = new Order();
        order.setOrderDate(new Date().toInstant());
        order.setTotalAmount(totalAmount);
        order.setShippingAddress(dto.getShippingAddress());
        order.setPaymentMethod(dto.getPaymentMethod());
        order.setType(OrderType.ONLINE);
        order.setUser(user);
        order.setCoupon(appliedCoupon); // Gán mã coupon để lưu reference

        OrderStatus initialStatus = (dto.getPaymentMethod() == PaymentMethod.COD)
                ? OrderStatus.PENDING_CONFIRMATION
                : OrderStatus.PENDING_PAYMENT;
        order.setStatus(initialStatus);

        order = orderRepository.save(order);

        // 5. Khởi tạo OrderItem (mỗi item có status riêng) và Trừ Kho

        for (CartItem item : cartItems) {
            ProductVariant variant = item.getProductVariant();

            OrderItem orderItem = OrderItem.builder()
                    .productVariant(variant)
                    .quantity((long) item.getQuantity())
                    .price(variant.getPrice())
                    .productName(variant.getProduct().getName())
                    .order(order)
                    .status(initialStatus)
                    .build();
            orderItemRepository.save(orderItem);

            variant.setStockQuantity(variant.getStockQuantity() - item.getQuantity());
            productVariantRepository.save(variant);

            // Tự động kiểm tra và cập nhật trạng thái cha nếu Hết Hàng
            Product parentProduct = variant.getProduct();
            boolean hasStock = parentProduct.getVariants().stream()
                    .anyMatch(v -> v.getStockQuantity() != null && v.getStockQuantity() > 0);

            if (!hasStock
                    && parentProduct.getStatus() == ProductStatus.ACTIVE) {
                parentProduct.setStatus(ProductStatus.OUT_OF_STOCK);
                // JPA context will auto update the parentProduct when transaction commits,
                // but if we had productRepository we could optionally call .save()
            }
        }

        // 6. Xóa các mục này khỏi giỏ hàng
        cartItemRepository.deleteAll(cartItems);

        // 7. Xử lý Thanh toán trực tuyến (MoMo)
        String paymentUrl = null;
        if (order.getPaymentMethod() == PaymentMethod.MOMO) {
            paymentUrl = momoService.createPaymentUrl(order.getId(), order.getTotalAmount());
        }

        // 7.5. Đánh dấu Coupon đã sử dụng (Nếu có)
        if (dto.getCouponCode() != null && !dto.getCouponCode().trim().isEmpty()) {
            userCouponRepository.findByUserIdAndCouponCode(user.getId(), dto.getCouponCode().trim())
                    .ifPresent(uc -> {
                        uc.setUsed(true);
                        userCouponRepository.save(uc);
                    });
        }

        // 9. Gửi thông báo
        notificationService.createNotification(
                user,
                "Đặt hàng thành công",
                "Đơn hàng #" + order.getId() + " của bạn đã được khởi tạo thành công.",
                "SUCCESS",
                order.getId());

        // 10. Trả về kết quả
        return PlaceOrderResponseDTO.builder()
                .orderId(order.getId())
                .totalAmount(order.getTotalAmount())
                .status(order.getStatus())
                .paymentUrl(paymentUrl) // Vẫn giữ để tương thích nếu FE muốn redirect ngay
                .message(order.getPaymentMethod() == PaymentMethod.MOMO
                        ? "Đơn hàng đã được khởi tạo. Vui lòng thanh toán trong vòng 10 phút."
                        : "Đặt hàng thành công! Đơn hàng của bạn đang chờ xác nhận.")
                .build();
    }

    @Override
    @Transactional
    public String retryPayment(Long userId, Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Đơn hàng không tồn tại!"));

        // Bảo mật: Kiểm tra đơn hàng có thuộc về User này không
        if (!order.getUser().getId().equals(userId)) {
            throw new RuntimeException("Bạn không có quyền thanh toán đơn hàng này!");
        }

        // Kiểm tra xem đơn hàng còn trong trạng thái PENDING_PAYMENT không
        if (order.getStatus() != OrderStatus.PENDING_PAYMENT) {
            throw new RuntimeException("Đơn hàng này không ở trạng thái chờ thanh toán!");
        }

        // Kiểm tra hết hạn (10 phút)
        long minutesElapsed = Duration.between(order.getOrderDate(), Instant.now()).toMinutes();
        if (minutesElapsed > 10) {
            throw new RuntimeException("Yêu cầu thanh toán đã hết hạn (quá 10 phút)!");
        }

        return momoService.createPaymentUrl(order.getId(), order.getTotalAmount());
    }

    @Override
    @Transactional
    public void revertInventory(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Đơn hàng không tồn tại!"));

        for (OrderItem item : order.getOrderItems()) {
            ProductVariant variant = item.getProductVariant();
            variant.setStockQuantity(variant.getStockQuantity() + item.getQuantity().intValue());
            productVariantRepository.save(variant);
        }
    }

    // THEO DÕI TRẠNG THÁI ĐƠN HÀNG - Xem danh sách

    @Override
    @Transactional(readOnly = true)
    public Page<OrderSummaryResponseDTO> getMyOrders(Long userId, List<OrderStatus> statuses, Pageable pageable) {
        Page<Order> orders;
        if (statuses == null || statuses.isEmpty()) {
            orders = orderRepository.findAllMyOrders(userId, pageable);
        } else {
            orders = orderRepository.searchMyOrdersByStatuses(userId, statuses, pageable);
        }

        return orders.map(this::convertToSummaryDTO);
    }

    private OrderSummaryResponseDTO convertToSummaryDTO(Order order) {
        // Tổng hợp trạng thái từ các OrderItem
        Map<String, Integer> statusSummary = order.getOrderItems().stream()
                .collect(Collectors.groupingBy(
                        item -> item.getStatus().name(),
                        LinkedHashMap::new,
                        Collectors.summingInt(i -> 1)));

        List<OrderItemPreviewDTO> itemPreviews = order.getOrderItems().stream()
                .map(item -> OrderItemPreviewDTO.builder()
                        .productName(item.getProductName())
                        .productImage(getProductImageUrl(item.getProductVariant()))
                        .quantity(item.getQuantity())
                        .build())
                .collect(Collectors.toList());

        return OrderSummaryResponseDTO.builder()
                .orderId(order.getId())
                .orderDate(order.getOrderDate())
                .totalAmount(order.getTotalAmount())
                .paymentMethod(order.getPaymentMethod())
                .status(order.getStatus())
                .itemCount(order.getOrderItems().size())
                .statusSummary(statusSummary)
                .items(itemPreviews)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public Page<OrderItemSummaryDTO> getMyOrderItems(Long userId, List<OrderStatus> statuses, Boolean reviewed,
                                                     Pageable pageable) {
        Page<OrderItem> items;

        if (Boolean.TRUE.equals(reviewed)) {
            // Trường hợp: Lấy Lịch sử Review (Tất cả sản phẩm đã được đánh giá thành công)
            items = orderItemRepository.findByOrderUserIdAndIsReviewedTrueOrderByOrderOrderDateDesc(userId, pageable);
        } else if (Boolean.FALSE.equals(reviewed)) {
            // Trường hợp: Lấy sản phẩm chờ đánh giá (Lọc theo isReviewed = false)
            items = orderItemRepository.findByOrderUserIdAndStatusInAndIsReviewedOrderByOrderOrderDateDesc(userId,
                    statuses, false, pageable);
        } else {
            // Trường hợp: Các tab khác (shipped, processing, etc. - không lọc isReviewed)
            // Nếu statuses chỉ chứa DELIVERED hoặc COMPLETED (Tab Đánh giá mặc định), chỉ
            // lấy sản phẩm chưa đánh giá
            boolean isReviewTab = statuses != null
                    && (statuses.contains(OrderStatus.DELIVERED) || statuses.contains(OrderStatus.COMPLETED))
                    && statuses.size() <= 2;

            if (isReviewTab) {
                items = orderItemRepository.findByOrderUserIdAndStatusInAndIsReviewedOrderByOrderOrderDateDesc(userId,
                        statuses, false, pageable);
            } else {
                items = orderItemRepository.findByOrderUserIdAndStatusInOrderByOrderOrderDateDesc(userId, statuses,
                        pageable);
            }
        }

        return items.map(item -> OrderItemSummaryDTO.builder()
                .orderItemId(item.getId())
                .orderId(item.getOrder().getId())
                .productId(item.getProductVariant() != null ? item.getProductVariant().getProduct().getId() : null)
                .orderDate(item.getOrder().getOrderDate())
                .paymentMethod(item.getOrder().getPaymentMethod())
                .productName(item.getProductName())
                .productImage(getProductImageUrl(item.getProductVariant()))
                .size(item.getProductVariant() != null ? item.getProductVariant().getSize() : null)
                .color(item.getProductVariant() != null ? item.getProductVariant().getColor() : null)
                .quantity(item.getQuantity())
                .price(item.getPrice() != null ? item.getPrice()
                        : (item.getProductVariant() != null ? item.getProductVariant().getPrice() : 0.0))
                .itemTotalAmount(item.getQuantity() * (item.getPrice() != null ? item.getPrice()
                        : (item.getProductVariant() != null ? item.getProductVariant().getPrice() : 0.0)))
                .orderTotalAmount(item.getOrder().getTotalAmount())
                .status(item.getStatus())
                .refundStatus(item.getRefundStatus())
                .cancellationReason(item.getCancellationReason())
                .isReviewed(item.isReviewed())
                .build());
    }

    // THEO DÕI TRẠNG THÁI ĐƠN HÀNG - Xem chi tiết

    @Override
    @Transactional(readOnly = true)
    public OrderDetailResponseDTO getMyOrderDetail(Long userId, Long orderId) {
        Order order = orderRepository.findByIdAndUserId(orderId, userId)
                .orElseThrow(
                        () -> new RuntimeException("Đơn hàng không tồn tại hoặc không thuộc quyền sở hữu của bạn!"));

        List<OrderDetailResponseDTO.OrderItemDTO> itemDTOs = order.getOrderItems().stream()
                .map(item -> {
                    List<OrderDetailResponseDTO.OrderHistoryDTO> historyDTOs = item.getOrderHistories().stream()
                            .map(h -> OrderDetailResponseDTO.OrderHistoryDTO.builder()
                                    .previousStatus(h.getPreviousStatus())
                                    .newStatus(h.getNewStatus())
                                    .changeDate(h.getChangeDate().toInstant())
                                    .build())
                            .toList();

                    return OrderDetailResponseDTO.OrderItemDTO.builder()
                            .orderItemId(item.getId())
                            .productId(item.getProductVariant() != null ? item.getProductVariant().getProduct().getId()
                                    : null)
                            .productName(item.getProductName())
                            .productImage(getProductImageUrl(item.getProductVariant()))
                            .size(item.getProductVariant() != null ? item.getProductVariant().getSize() : null)
                            .color(item.getProductVariant() != null ? item.getProductVariant().getColor() : null)
                            .quantity(item.getQuantity())
                            .price(item.getPrice() != null ? item.getPrice()
                                    : (item.getProductVariant() != null ? item.getProductVariant().getPrice() : 0.0))
                            .status(item.getStatus())
                            .refundStatus(item.getRefundStatus())
                            .cancellationReason(item.getCancellationReason())
                            .histories(historyDTOs)
                            .build();
                })
                .toList();

        double subtotal = 0.0;
        for (OrderDetailResponseDTO.OrderItemDTO item : itemDTOs) {
            subtotal += item.getPrice() * item.getQuantity();
        }

        return OrderDetailResponseDTO.builder()
                .orderId(order.getId())
                .orderDate(order.getOrderDate())
                .totalAmount(order.getTotalAmount())
                .status(order.getStatus())
                .paymentMethod(order.getPaymentMethod())
                .shippingAddress(order.getShippingAddress())
                .subtotalAmount(subtotal)
                .discountAmount(subtotal - order.getTotalAmount())
                .couponCode(order.getCoupon() != null ? order.getCoupon().getCode() : null)
                .discountValue(order.getCoupon() != null ? order.getCoupon().getDiscountValue() : null)
                .discountType(order.getCoupon() != null ? order.getCoupon().getDiscountType() : null)
                .items(itemDTOs)
                .build();
    }

    /**
     * Helper to get the correct product image URL (Absolute path)
     */
    private String getProductImageUrl(ProductVariant variant) {
        if (variant == null || variant.getProduct() == null || variant.getProduct().getImages() == null
                || variant.getProduct().getImages().isEmpty()) {
            return null;
        }

        // Ưu tiên lấy hình ảnh khớp màu sắc với Variant
        String targetUrl = variant.getProduct().getImages().stream()
                .filter(img -> img.getColor() != null && img.getColor().equalsIgnoreCase(variant.getColor()))
                .map(ProductImage::getUrl)
                .findFirst()
                .orElse(variant.getProduct().getImages().getFirst().getUrl());

        if (targetUrl == null)
            return null;

        // Đảm bảo đường dẫn tuyệt đối (bắt đầu bằng /)
        if (!targetUrl.startsWith("/") && !targetUrl.startsWith("http")) {
            targetUrl = "/" + targetUrl;
        }

        return targetUrl;
    }

    // HỦY ĐƠN HÀNG

    @Override
    @Transactional
    public MessageResponseDTO cancelOrder(Long userId, Long orderId, CancelOrderRequestDTO dto) {
        Order order = orderRepository.findByIdAndUserId(orderId, userId)
                .orElseThrow(
                        () -> new RuntimeException("Đơn hàng không tồn tại hoặc không thuộc quyền sở hữu của bạn!"));

        Set<OrderStatus> cancellableStatuses = Set.of(
                OrderStatus.PENDING_PAYMENT,
                OrderStatus.PENDING_CONFIRMATION,
                OrderStatus.PAID,
                OrderStatus.PROCESSING);

        boolean hasRefund = false;
        boolean refundFailed = false;

        for (OrderItem item : order.getOrderItems()) {
            if (!cancellableStatuses.contains(item.getStatus())) {
                throw new RuntimeException("Sản phẩm '" + item.getProductName() + "' ở trạng thái "
                        + item.getStatus() + " không thể hủy!");
            }

            OrderStatus previousStatus = item.getStatus();

            // Nếu item đã thanh toán online → hoàn tiền
            if (previousStatus == OrderStatus.PAID && order.getPaymentMethod() != PaymentMethod.COD) {
                try {
                    item.setRefundStatus(RefundStatus.PENDING);
                    hasRefund = true;
                } catch (Exception e) {
                    item.setRefundStatus(RefundStatus.FAILED);
                    refundFailed = true;
                }
            }

            item.setStatus(OrderStatus.CANCELLED);
            item.setCancellationReason(dto.getCancellationReason());
            orderItemRepository.save(item);

            // Lưu lịch sử chuyển trạng thái
            OrderHistory history = OrderHistory.builder()
                    .orderItem(item)
                    .previousStatus(previousStatus)
                    .newStatus(OrderStatus.CANCELLED)
                    .changeDate(new Date())
                    .build();
            orderHistoryRepository.save(history);

            // Hoàn lại tồn kho
            if (item.getProductVariant() != null) {
                ProductVariant variant = item.getProductVariant();
                variant.setStockQuantity(variant.getStockQuantity() + item.getQuantity().intValue());
                productVariantRepository.save(variant);
            }
        }

        String message = "Hủy đơn hàng thành công!";

        // Gửi thông báo hủy đơn
        notificationService.createNotification(
                order.getUser(),
                "Đơn hàng đã được hủy",
                "Đơn hàng #" + order.getId() + " đã được hủy thành công. Lý do: " + dto.getCancellationReason(),
                "WARNING",
                order.getId());

        if (hasRefund && !refundFailed) {
            message += " Yêu cầu hoàn tiền đang được xử lý.";
        } else if (refundFailed) {
            message += " Lỗi khi hoàn tiền một số sản phẩm, vui lòng liên hệ hỗ trợ.";
        }

        return MessageResponseDTO.builder()
                .message(message)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public OrderDashboardSummaryDTO getDashboardSummary(Long userId) {
        List<Object[]> statusCounts = orderRepository.countMyOrdersByItemStatus(userId);

        long unpaid = 0;
        long processing = 0;
        long shipped = 0;
        long returns = 0;

        for (Object[] row : statusCounts) {
            OrderStatus status = (OrderStatus) row[0];
            long count = (long) row[1];

            switch (status) {
                case PENDING_PAYMENT:
                    unpaid += count;
                    break;
                case PENDING_CONFIRMATION:
                case PAID:
                case PROCESSING:
                    processing += count;
                    break;
                case SHIPPING:
                    shipped += count;
                    break;
                case CANCELLED:
                    // Trong hệ thống này, Return được gộp chung hoặc xử lý qua RefundStatus,
                    // tạm thời gộp Cancelled vào Returns nếu có RefundStatus hoặc đơn giản là
                    // Cancelled
                    returns += count;
                    break;
                default:
                    break;
            }
        }

        long toReviewCount = orderRepository.countUnreviewedItems(userId);
        OrderSummaryResponseDTO latestOrder = orderRepository.findTopByUserIdOrderByOrderDateDesc(userId)
                .map(this::convertToSummaryDTO)
                .orElse(null);

        return OrderDashboardSummaryDTO.builder()
                .unpaidCount(unpaid)
                .processingCount(processing)
                .shippedCount(shipped)
                .toReviewCount(toReviewCount)
                .returnCount(returns)
                .latestOrder(latestOrder)
                .build();
    }
}
