package com.fashion.service.order;

import com.fashion.dto.response.MessageResponseDTO;
import com.fashion.dto.response.OrderDetailResponseDTO;
import com.fashion.dto.response.OrderSummaryResponseDTO;
import com.fashion.exception.BadRequestException;
import com.fashion.exception.ResourceNotFoundException;
import com.fashion.model.*;
import com.fashion.model.enums.*;
import com.fashion.repository.OrderHistoryRepository;
import com.fashion.repository.OrderItemRepository;
import com.fashion.repository.OrderRepository;
import com.fashion.repository.ReturnRequestRepository;
import com.fashion.service.email_log.EmailService;
import com.fashion.service.notification.NotificationService;
import com.fashion.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
 import com.lowagie.text.*;
 import com.lowagie.text.pdf.*;
 import java.io.ByteArrayOutputStream;
 import java.text.NumberFormat;
 import java.text.SimpleDateFormat;
import java.util.List;
import java.util.Locale;

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
    private final EmailService emailService;

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
        if (item.getOrder().getUser() != null) {
            String content = "Sản phẩm '" + item.getProductName() + "' trong đơn hàng #" + item.getOrder().getId() + " đã chuyển sang trạng thái: " + newStatus;
            notificationService.createNotification(
                    item.getOrder().getUser().getId(),
                    "Cập nhật trạng thái đơn hàng",
                    content,
                    "INFO",
                    item.getOrder().getId()
            );
        }
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

    @Override
    public byte[] generatePdfInvoice(Long orderId) {
        // 1. Lấy thông tin đơn hàng
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Đơn hàng không tồn tại!"));

        // 2. AC-US47-02: State Transition Guard (Kiểm tra trạng thái)
        if (order.getType() == OrderType.ONLINE && order.getStatus() != OrderStatus.COMPLETED) {
            throw new BadRequestException("Đơn hàng trực tuyến chưa hoàn thành, không thể xuất hóa đơn tài chính!");
        }

        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            // 3. Khởi tạo Document (Khổ A4, Margin)
            Document document = new Document(PageSize.A4, 50, 50, 50, 50);
            PdfWriter.getInstance(document, out);
            document.open();

            // Font mặc định (Lưu ý: Để hiển thị tiếng Việt có dấu chuẩn 100%, bạn nên load file .ttf,
            // ở đây ta dùng font tiêu chuẩn tích hợp sẵn)
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18);
            Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12);
            Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 12);

            // 4. AC-US47-04: Header & Tên cửa hàng
            Paragraph title = new Paragraph("FASHION SHOP - INVOICE", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingAfter(20);
            document.add(title);

            // Thông tin chung của hóa đơn
            SimpleDateFormat sdf = new SimpleDateFormat("dd/MM/yyyy HH:mm:ss");
            document.add(new Paragraph("Invoice No: ORD-" + order.getId(), headerFont));
            document.add(new Paragraph("Date: " + sdf.format(Date.from(order.getOrderDate())), normalFont));

            // 5. AC-US47-03: Dynamic Layout Rendering (Thông tin khách & Kênh bán)
            document.add(new Paragraph(" ", normalFont)); // Dòng trống
            if (order.getType() == OrderType.OFFLINE) {
                document.add(new Paragraph("Sales Channel: POS (Offline)", headerFont));
                String customerInfo = (order.getUser() != null) ? order.getUser().getPhone() : "Walk-in Customer";
                document.add(new Paragraph("Customer: " + customerInfo, normalFont));
            } else {
                document.add(new Paragraph("Sales Channel: ONLINE", headerFont));
                document.add(new Paragraph("Customer: " + order.getUser().getFullName(), normalFont));
                document.add(new Paragraph("Phone: " + order.getUser().getPhone(), normalFont));
                document.add(new Paragraph("Shipping Address: " + order.getShippingAddress(), normalFont));
            }
            document.add(new Paragraph(" ", normalFont));

            // 6. AC-US47-04: Bảng chi tiết mặt hàng (5 cột)
            PdfPTable table = new PdfPTable(5);
            table.setWidthPercentage(100);
            table.setWidths(new float[]{3f, 2f, 1f, 2f, 2f}); // Tỷ lệ độ rộng cột

            // Header của bảng
            String[] headers = {"Product", "Variant", "Quantity", "Price", "Subtotal"};
            for (String h : headers) {
                PdfPCell cell = new PdfPCell(new Phrase(h, headerFont));
                cell.setHorizontalAlignment(Element.ALIGN_CENTER);
                cell.setPadding(5);
                table.addCell(cell);
            }

            // Data của bảng
            NumberFormat currencyFormat = NumberFormat.getCurrencyInstance(new Locale("vi", "VN"));
            double subTotal = 0;

            for (OrderItem item : order.getOrderItems()) {
                table.addCell(new Phrase(item.getProductName(), normalFont));

                String variant = (item.getProductVariant() != null) ?
                        item.getProductVariant().getColor() + " / " + item.getProductVariant().getSize() : "N/A";
                table.addCell(new Phrase(variant, normalFont));

                PdfPCell qtyCell = new PdfPCell(new Phrase(String.valueOf(item.getQuantity()), normalFont));
                qtyCell.setHorizontalAlignment(Element.ALIGN_CENTER);
                table.addCell(qtyCell);

                table.addCell(new Phrase(currencyFormat.format(item.getPrice()), normalFont));

                double rowTotal = item.getPrice() * item.getQuantity();
                subTotal += rowTotal;
                table.addCell(new Phrase(currencyFormat.format(rowTotal), normalFont));
            }
            document.add(table);

            // 7. AC-US47-04: Tổng kết tiền (Subtotal, Discount, Total)
            document.add(new Paragraph(" ", normalFont));
            document.add(new Paragraph("Subtotal: " + currencyFormat.format(subTotal), normalFont));

            double discount = 0;
            if (order.getCoupon() != null) {
                // Tính toán tiền giảm giá dựa vào logic của bạn (tạm tính subTotal - totalAmount)
                discount = subTotal - order.getTotalAmount();
                document.add(new Paragraph("Discount applied: -" + currencyFormat.format(discount), normalFont));
            }

            Paragraph finalTotal = new Paragraph("TOTAL AMOUNT: " + currencyFormat.format(order.getTotalAmount()), headerFont);
            finalTotal.setAlignment(Element.ALIGN_RIGHT);
            document.add(finalTotal);

            document.close();
            return out.toByteArray();

        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi khởi tạo tài liệu PDF: " + e.getMessage());
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
                    .isReviewed(item.isReviewed())
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
        // 1. Kiểm tra sự tồn tại của sản phẩm
        OrderItem item = orderItemRepository.findById(orderItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Sản phẩm trong đơn hàng không tồn tại!"));

        // 2. Chặn nếu trạng thái hiện tại khác PENDING
        if (item.getRefundStatus() != RefundStatus.PENDING) {
            throw new BadRequestException("Chỉ sản phẩm đang chờ xử lý mới được cập nhật trạng thái refund!");
        }

        // 3. Validate tham số đích (Chỉ nhận COMPLETED, REJECTED, FAILED)
        if (status != RefundStatus.COMPLETED && status != RefundStatus.REJECTED && status != RefundStatus.FAILED) {
            throw new BadRequestException("Trạng thái refund không hợp lệ!");
        }

        // 4. Lưu trạng thái hoàn tiền & Đổi OrderStatus thành RETURNED nếu COMPLETED
        item.setRefundStatus(status);
        if (status == RefundStatus.COMPLETED) {
            item.setStatus(OrderStatus.RETURNED);
        }
        orderItemRepository.save(item);

        // 5. Kiểm tra tự động đóng phiếu ReturnRequest sang COMPLETED
        ReturnRequest returnRequest = item.getReturnRequest();
        if (returnRequest != null) {
            // Kiểm tra tất cả mặt hàng đã thoát khỏi PENDING (tức là đã kết thúc)
            boolean isAllProcessed = returnRequest.getReturnItems().stream()
                    .allMatch(i -> i.getRefundStatus() == RefundStatus.COMPLETED
                            || i.getRefundStatus() == RefundStatus.REJECTED
                            || i.getRefundStatus() == RefundStatus.FAILED);

            if (isAllProcessed) {
                returnRequest.setStatus(ReturnStatus.COMPLETED);
                returnRequest.setProcessedAt(new Date());
                returnRequestRepository.save(returnRequest);
            }
        }

        // 6. Gửi thông báo Notification
        User customer = item.getOrder().getUser();
        Long orderId = item.getOrder().getId();

        if (status == RefundStatus.COMPLETED) {
            String message = String.format("Sản phẩm '%s' trong đơn hàng #%d đã được hoàn tiền thành công.",
                    item.getProductName(), orderId);
            notificationService.createNotification(customer.getId(), "Hoàn tiền thành công", message, "SUCCESS", orderId);
            emailService.sendRefundCompletedEmail(
                    customer.getEmail(),
                    customer.getFullName(),
                    orderId,
                    item.getProductName()
            );
        } else if (status == RefundStatus.REJECTED) {
            String message = String.format("Yêu cầu hoàn tiền cho sản phẩm '%s' trong đơn hàng #%d đã bị từ chối.",
                    item.getProductName(), orderId);
            notificationService.createNotification(customer.getId(), "Hoàn tiền bị từ chối", message, "WARNING", orderId);
        }
    }
}
