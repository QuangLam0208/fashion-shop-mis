package com.fashion.service.offline_sale;

import com.fashion.dto.request.RecordOfflineSaleRequestDTO;
import com.fashion.dto.response.PlaceOrderResponseDTO;
import com.fashion.model.Order;
import com.fashion.model.OrderItem;
import com.fashion.model.ProductVariant;
import com.fashion.model.enums.OrderStatus;
import com.fashion.model.enums.OrderType;
import com.fashion.repository.OrderItemRepository;
import com.fashion.repository.OrderRepository;
import com.fashion.repository.ProductVariantRepository;
import com.fashion.repository.UserRepository;
import org.springframework.transaction.annotation.Transactional;

import com.fashion.dto.request.OfflineSaleItemDTO;
import com.fashion.exception.BadRequestException;
import com.fashion.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class OfflineSaleServiceImpl implements OfflineSaleService{

    private final ProductVariantRepository productVariantRepository;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final UserRepository userRepository;

    // Ghi nhận bán hàng trực tiếp
    @Override
    @Transactional
    public PlaceOrderResponseDTO recordOfflineSale(RecordOfflineSaleRequestDTO dto) {

        // Thiếu thông tin bắt buộc
        if (dto.getItems() == null || dto.getItems().isEmpty()) {
            throw new BadRequestException("Vui lòng chọn ít nhất một sản phẩm!");
        }
        if (dto.getPaymentMethod() == null) {
            throw new BadRequestException("Vui lòng chọn phương thức thanh toán!");
        }

        // Chọn sản phẩm & hiển thị thông tin
        // Kiểm tra tính hợp lệ của dữ liệu
        double totalAmount = 0.0;
        for (OfflineSaleItemDTO item : dto.getItems()) {
            ProductVariant variant = productVariantRepository.findById(item.getProductVariantId())
                    .orElseThrow(() -> new ResourceNotFoundException("Sản phẩm không tồn tại trong hệ thống!"));

            // Số lượng vượt quá tồn kho
            if (variant.getStockQuantity() < item.getQuantity()) {
                throw new BadRequestException("Sản phẩm '" + variant.getProduct().getName()
                        + "' không đủ số lượng trong kho! (Tồn kho: " + variant.getStockQuantity() + ")");
            }
            if (item.getQuantity() <= 0) {
                throw new BadRequestException("Số lượng sản phẩm phải lớn hơn 0!");
            }

            totalAmount += variant.getPrice() * item.getQuantity();
        }

        // Lưu giao dịch vào cơ sở dữ liệu
        Order.OrderBuilder orderBuilder = Order.builder()
                .orderDate(Instant.now())
                .totalAmount(totalAmount)
                .paymentMethod(dto.getPaymentMethod())
                .type(OrderType.OFFLINE)
                .status(OrderStatus.COMPLETED); // POS = Hoàn thành ngay

        // Nếu có SĐT, thử nhảy tìm User để liên kết đơn hàng
        if (dto.getCustomerPhone() != null && !dto.getCustomerPhone().isBlank()) {
            userRepository.findByPhone(dto.getCustomerPhone())
                    .ifPresent(orderBuilder::user);
        }

        Order order = orderBuilder.build();
        order = orderRepository.save(order);

        // Cập nhật tồn kho + Tạo OrderItem
        for (OfflineSaleItemDTO item : dto.getItems()) {
            ProductVariant variant = productVariantRepository.findById(item.getProductVariantId()).get();

            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .productVariant(variant)
                    .quantity((long) item.getQuantity())
                    .price(variant.getPrice()) // Bổ sung giá sản phẩm
                    .productName(variant.getProduct().getName())
                    .status(OrderStatus.COMPLETED) // Bán trực tiếp = hoàn thành ngay
                    .build();
            orderItemRepository.save(orderItem);

            // Trừ tồn kho
            variant.setStockQuantity(variant.getStockQuantity() - item.getQuantity());
            productVariantRepository.save(variant);
        }

        // Thông báo thành công
        return PlaceOrderResponseDTO.builder()
                .orderId(order.getId())
                .totalAmount(order.getTotalAmount())
                .status(OrderStatus.COMPLETED)
                .message("Ghi nhận bán hàng trực tiếp thành công! Tổng tiền: " + totalAmount + "đ")
                .build();
    }
}
