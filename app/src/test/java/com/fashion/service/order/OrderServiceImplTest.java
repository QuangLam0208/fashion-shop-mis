package com.fashion.service.order;

import com.fashion.dto.request.CancelOrderRequestDTO;
import com.fashion.dto.request.PlaceOrderRequestDTO;
import com.fashion.dto.response.MessageResponseDTO;
import com.fashion.dto.response.PlaceOrderResponseDTO;
import com.fashion.exception.BadRequestException;
import com.fashion.exception.ResourceNotFoundException;
import com.fashion.model.*;
import com.fashion.model.enums.*;
import com.fashion.repository.*;
import com.fashion.service.notification.NotificationService;
import com.fashion.service.payment.MomoService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import org.springframework.security.access.AccessDeniedException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderServiceImplTest {

    @Mock
    private ProductVariantRepository productVariantRepository;
    @Mock
    private OrderRepository orderRepository;
    @Mock
    private OrderItemRepository orderItemRepository;
    @Mock
    private OrderHistoryRepository orderHistoryRepository;
    @Mock
    private CartItemRepository cartItemRepository;
    @Mock
    private CouponRepository couponRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private UserCouponRepository userCouponRepository;
    @Mock
    private MomoService momoService;
    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private OrderServiceImpl orderService;

    private User mockUser;
    private Product mockProduct;
    private ProductVariant mockVariant;
    private CartItem mockCartItem;

    @BeforeEach
    void setUp() {
        mockUser = User.builder()
                .id(1L)
                .fullName("Nguyễn Văn A")
                .email("test@example.com")
                .role(Role.CUSTOMER)
                .status(UserStatus.ACTIVE)
                .build();

        mockProduct = Product.builder()
                .id(10L)
                .name("Áo Thun Nam")
                .status(ProductStatus.ACTIVE)
                .variants(new ArrayList<>())
                .build();

        mockVariant = ProductVariant.builder()
                .id(100L)
                .product(mockProduct)
                .size("L")
                .color("Đen")
                .stockQuantity(10L)
                .price(200000.0)
                .build();

        mockProduct.getVariants().add(mockVariant);

        mockCartItem = CartItem.builder()
                .id(1000L)
                .user(mockUser)
                .productVariant(mockVariant)
                .quantity(2)
                .build();
    }

    // =========================================================================
    // 1. Success COD
    // =========================================================================
    @Test
    void placeOrder_Success_COD() {
        PlaceOrderRequestDTO dto = PlaceOrderRequestDTO.builder()
                .userId(1L)
                .cartItemIds(List.of(1000L))
                .shippingAddress("123 Lê Lợi")
                .paymentMethod(PaymentMethod.COD)
                .couponCode(null)
                .build();

        when(userRepository.findById(1L)).thenReturn(Optional.of(mockUser));
        when(cartItemRepository.findAllById(List.of(1000L))).thenReturn(List.of(mockCartItem));

        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> {
            Order o = invocation.getArgument(0);
            o.setId(500L);
            return o;
        });

        PlaceOrderResponseDTO response = orderService.placeOrder(dto);

        assertNotNull(response);
        assertEquals(500L, response.getOrderId());
        assertEquals(OrderStatus.PENDING_CONFIRMATION, response.getStatus());
        assertEquals(400000.0, response.getTotalAmount()); // 200000 * 2 = 400000
        assertNull(response.getPaymentUrl());
        assertTrue(response.getMessage().contains("Đặt hàng thành công"));

        // Assert: order saved
        verify(orderRepository, times(1)).save(any(Order.class));

        // Assert: orderItems created
        verify(orderItemRepository, times(1)).save(any(OrderItem.class));

        // Assert: stock deducted (10 - 2 = 8)
        assertEquals(8L, mockVariant.getStockQuantity());
        verify(productVariantRepository, times(1)).save(mockVariant);

        // Assert: cartItems deleted
        verify(cartItemRepository, times(1)).deleteAll(List.of(mockCartItem));

        // Verify notification sent
        verify(notificationService, times(1)).createNotification(
                eq(mockUser),
                eq("Đặt hàng thành công"),
                anyString(),
                eq("SUCCESS"),
                eq(500L)
        );
    }

    // =========================================================================
    // 2. Insufficient stock rollback
    // =========================================================================
    @Test
    void placeOrder_InsufficientStock_ThrowsExceptionAndNoChanges() {
        mockVariant.setStockQuantity(1L); // Stock = 1, but order quantity = 2

        PlaceOrderRequestDTO dto = PlaceOrderRequestDTO.builder()
                .userId(1L)
                .cartItemIds(List.of(1000L))
                .shippingAddress("123 Lê Lợi")
                .paymentMethod(PaymentMethod.COD)
                .couponCode(null)
                .build();

        when(userRepository.findById(1L)).thenReturn(Optional.of(mockUser));
        when(cartItemRepository.findAllById(List.of(1000L))).thenReturn(List.of(mockCartItem));

        RuntimeException ex = assertThrows(RuntimeException.class, () -> orderService.placeOrder(dto));
        assertTrue(ex.getMessage().contains("không đủ số lượng tồn kho"));

        // Assert: no order saved
        verify(orderRepository, never()).save(any(Order.class));

        // Assert: no orderItems created
        verify(orderItemRepository, never()).save(any(OrderItem.class));

        // Assert: stock unchanged
        assertEquals(1L, mockVariant.getStockQuantity());
        verify(productVariantRepository, never()).save(any(ProductVariant.class));

        // Assert: cartItems not deleted
        verify(cartItemRepository, never()).deleteAll(anyList());
    }

    // =========================================================================
    // 3. Ownership check
    // =========================================================================
    @Test
    void placeOrder_ItemNotOwnedByUser_ThrowsBadRequestException() {
        User otherUser = User.builder().id(2L).fullName("User Khác").build();
        mockCartItem.setUser(otherUser); // CartItem belongs to user 2, but order is for user 1

        PlaceOrderRequestDTO dto = PlaceOrderRequestDTO.builder()
                .userId(1L)
                .cartItemIds(List.of(1000L))
                .shippingAddress("123 Lê Lợi")
                .paymentMethod(PaymentMethod.COD)
                .couponCode(null)
                .build();

        when(userRepository.findById(1L)).thenReturn(Optional.of(mockUser));
        when(cartItemRepository.findAllById(List.of(1000L))).thenReturn(List.of(mockCartItem));

        BadRequestException ex = assertThrows(BadRequestException.class, () -> orderService.placeOrder(dto));
        assertEquals("Bạn không có quyền thanh toán các mặt hàng trong giỏ hàng này!", ex.getMessage());

        // Assert: no order saved
        verify(orderRepository, never()).save(any(Order.class));

        // Assert: no deletion, no stock changes
        verify(cartItemRepository, never()).deleteAll(anyList());
        assertEquals(10L, mockVariant.getStockQuantity());
        verify(productVariantRepository, never()).save(any(ProductVariant.class));
    }

    // =========================================================================
    // 4. Invalid cart items (empty or mismatch)
    // =========================================================================
    @Test
    void placeOrder_CartItemsEmpty_ThrowsBadRequestException() {
        PlaceOrderRequestDTO dto = PlaceOrderRequestDTO.builder()
                .userId(1L)
                .cartItemIds(List.of(1000L))
                .shippingAddress("123 Lê Lợi")
                .paymentMethod(PaymentMethod.COD)
                .couponCode(null)
                .build();

        when(userRepository.findById(1L)).thenReturn(Optional.of(mockUser));
        when(cartItemRepository.findAllById(List.of(1000L))).thenReturn(Collections.emptyList());

        BadRequestException ex = assertThrows(BadRequestException.class, () -> orderService.placeOrder(dto));
        assertEquals("Giỏ hàng rỗng hoặc các mục đã bị xóa!", ex.getMessage());

        // Assert: no order saved, no deletion, no stock changes
        verify(orderRepository, never()).save(any(Order.class));
        verify(cartItemRepository, never()).deleteAll(anyList());
        assertEquals(10L, mockVariant.getStockQuantity());
        verify(productVariantRepository, never()).save(any(ProductVariant.class));
    }

    @Test
    void placeOrder_CartItemsSizeMismatch_ThrowsBadRequestException() {
        PlaceOrderRequestDTO dto = PlaceOrderRequestDTO.builder()
                .userId(1L)
                .cartItemIds(List.of(1000L, 1001L))
                .shippingAddress("123 Lê Lợi")
                .paymentMethod(PaymentMethod.COD)
                .couponCode(null)
                .build();

        when(userRepository.findById(1L)).thenReturn(Optional.of(mockUser));
        // Requested 2 items, but DB only returns 1
        when(cartItemRepository.findAllById(List.of(1000L, 1001L))).thenReturn(List.of(mockCartItem));

        BadRequestException ex = assertThrows(BadRequestException.class, () -> orderService.placeOrder(dto));
        assertEquals("Giỏ hàng rỗng hoặc các mục đã bị xóa!", ex.getMessage());

        // Assert: no order saved, no deletion, no stock changes
        verify(orderRepository, never()).save(any(Order.class));
        verify(cartItemRepository, never()).deleteAll(anyList());
        assertEquals(10L, mockVariant.getStockQuantity());
        verify(productVariantRepository, never()).save(any(ProductVariant.class));
    }

    // =========================================================================
    // 5. AC-BE-US24-05 — Unit test verifies initialStatus logic for COD
    // =========================================================================

    /**
     * AC-BE-US24-01: Khi paymentMethod = COD
     * → order.status = PENDING_CONFIRMATION
     * → mỗi orderItem.status = PENDING_CONFIRMATION
     */
    @Test
    void placeOrder_COD_OrderAndItemStatus_ShouldBePendingConfirmation() {
        // Arrange
        PlaceOrderRequestDTO dto = PlaceOrderRequestDTO.builder()
                .userId(1L)
                .cartItemIds(List.of(1000L))
                .shippingAddress("456 Nguyễn Huệ")
                .paymentMethod(PaymentMethod.COD)
                .couponCode(null)
                .build();

        when(userRepository.findById(1L)).thenReturn(Optional.of(mockUser));
        when(cartItemRepository.findAllById(List.of(1000L))).thenReturn(List.of(mockCartItem));
        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> {
            Order o = invocation.getArgument(0);
            o.setId(600L);
            return o;
        });

        // Act
        orderService.placeOrder(dto);

        // Assert: Capture Order được lưu và verify status
        ArgumentCaptor<Order> orderCaptor = ArgumentCaptor.forClass(Order.class);
        verify(orderRepository).save(orderCaptor.capture());
        Order savedOrder = orderCaptor.getValue();
        assertEquals(OrderStatus.PENDING_CONFIRMATION, savedOrder.getStatus(),
                "AC-01: Order.status phải là PENDING_CONFIRMATION khi COD");

        // Assert: Capture OrderItem được lưu và verify status
        ArgumentCaptor<OrderItem> itemCaptor = ArgumentCaptor.forClass(OrderItem.class);
        verify(orderItemRepository, atLeastOnce()).save(itemCaptor.capture());
        List<OrderItem> savedItems = itemCaptor.getAllValues();
        assertFalse(savedItems.isEmpty(), "Phải có ít nhất 1 OrderItem được lưu");
        for (OrderItem item : savedItems) {
            assertEquals(OrderStatus.PENDING_CONFIRMATION, item.getStatus(),
                    "AC-01: OrderItem.status phải là PENDING_CONFIRMATION khi COD");
        }
    }

    /**
     * AC-BE-US24-02: Khi COD → response.paymentUrl = null
     */
    @Test
    void placeOrder_COD_PaymentUrl_ShouldBeNull() {
        // Arrange
        PlaceOrderRequestDTO dto = PlaceOrderRequestDTO.builder()
                .userId(1L)
                .cartItemIds(List.of(1000L))
                .shippingAddress("789 Trần Hưng Đạo")
                .paymentMethod(PaymentMethod.COD)
                .couponCode(null)
                .build();

        when(userRepository.findById(1L)).thenReturn(Optional.of(mockUser));
        when(cartItemRepository.findAllById(List.of(1000L))).thenReturn(List.of(mockCartItem));
        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> {
            Order o = invocation.getArgument(0);
            o.setId(601L);
            return o;
        });

        // Act
        PlaceOrderResponseDTO response = orderService.placeOrder(dto);

        // Assert: paymentUrl phải null, MoMo không được gọi
        assertNull(response.getPaymentUrl(),
                "AC-02: paymentUrl phải là null khi COD");
        verify(momoService, never()).createPaymentUrl(anyLong(), anyDouble());
    }

    /**
     * AC-BE-US24-03: Khi COD → message chứa "chờ xác nhận"
     */
    @Test
    void placeOrder_COD_Message_ShouldContainChoXacNhan() {
        // Arrange
        PlaceOrderRequestDTO dto = PlaceOrderRequestDTO.builder()
                .userId(1L)
                .cartItemIds(List.of(1000L))
                .shippingAddress("101 Hai Bà Trưng")
                .paymentMethod(PaymentMethod.COD)
                .couponCode(null)
                .build();

        when(userRepository.findById(1L)).thenReturn(Optional.of(mockUser));
        when(cartItemRepository.findAllById(List.of(1000L))).thenReturn(List.of(mockCartItem));
        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> {
            Order o = invocation.getArgument(0);
            o.setId(602L);
            return o;
        });

        // Act
        PlaceOrderResponseDTO response = orderService.placeOrder(dto);

        // Assert: message chứa "chờ xác nhận"
        assertNotNull(response.getMessage(), "Message không được null");
        assertTrue(response.getMessage().contains("chờ xác nhận"),
                "AC-03: Message phải chứa 'chờ xác nhận', actual: " + response.getMessage());
        assertTrue(response.getMessage().contains("Đặt hàng thành công"),
                "AC-03: Message phải chứa 'Đặt hàng thành công', actual: " + response.getMessage());
    }

    /**
     * AC-BE-US24-01 mở rộng: Khi MOMO → status phải là PENDING_PAYMENT (KHÔNG phải PENDING_CONFIRMATION)
     * → Đảm bảo logic phân nhánh initialStatus hoạt động đúng cho cả 2 case.
     */
    @Test
    void placeOrder_MOMO_Status_ShouldBePendingPayment_NotPendingConfirmation() {
        // Arrange
        PlaceOrderRequestDTO dto = PlaceOrderRequestDTO.builder()
                .userId(1L)
                .cartItemIds(List.of(1000L))
                .shippingAddress("202 Võ Văn Tần")
                .paymentMethod(PaymentMethod.MOMO)
                .couponCode(null)
                .build();

        when(userRepository.findById(1L)).thenReturn(Optional.of(mockUser));
        when(cartItemRepository.findAllById(List.of(1000L))).thenReturn(List.of(mockCartItem));
        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> {
            Order o = invocation.getArgument(0);
            o.setId(603L);
            return o;
        });
        when(momoService.createPaymentUrl(anyLong(), anyDouble())).thenReturn("https://momo.vn/pay/123");

        // Act
        PlaceOrderResponseDTO response = orderService.placeOrder(dto);

        // Assert: status = PENDING_PAYMENT (khác COD)
        assertEquals(OrderStatus.PENDING_PAYMENT, response.getStatus(),
                "MOMO phải có status PENDING_PAYMENT");

        // Assert: paymentUrl KHÔNG null (ngược lại COD)
        assertNotNull(response.getPaymentUrl(),
                "MOMO phải có paymentUrl");

        // Assert: OrderItem cũng phải PENDING_PAYMENT
        ArgumentCaptor<OrderItem> itemCaptor = ArgumentCaptor.forClass(OrderItem.class);
        verify(orderItemRepository, atLeastOnce()).save(itemCaptor.capture());
        for (OrderItem item : itemCaptor.getAllValues()) {
            assertEquals(OrderStatus.PENDING_PAYMENT, item.getStatus(),
                    "MOMO OrderItem.status phải là PENDING_PAYMENT");
        }
    }
    // =========================================================================
    // 6. Cancel Order Tests (AC-BE-US27)
    // =========================================================================

    @Test
    void cancelOrder_Fails_OrderNotFound() {
        when(orderRepository.findById(999L)).thenReturn(Optional.empty());
        CancelOrderRequestDTO request = new CancelOrderRequestDTO("Hủy đơn");

        ResourceNotFoundException ex = assertThrows(ResourceNotFoundException.class, () ->
                orderService.cancelOrder(1L, 999L, request)
        );

        assertEquals("Đơn hàng không tồn tại!", ex.getMessage());
    }

    @Test
    void cancelOrder_Fails_WhenOrderIsShipping() {
        Order order = Order.builder()
                .id(10L)
                .user(mockUser)
                .status(OrderStatus.SHIPPING)
                .build();

        CancelOrderRequestDTO request = new CancelOrderRequestDTO("Giao lâu quá");

        when(orderRepository.findById(10L)).thenReturn(Optional.of(order));

        BadRequestException ex = assertThrows(BadRequestException.class, () ->
                orderService.cancelOrder(1L, 10L, request)
        );

        assertTrue(ex.getMessage().contains("không thể hủy"));
        verify(orderRepository, never()).save(any(Order.class));
    }

    @Test
    void cancelOrder_Success_RestoresInventoryAndProductStatus() {
        Product outOfStockProduct = Product.builder().id(20L).status(ProductStatus.OUT_OF_STOCK).build();
        ProductVariant variantToRestore = ProductVariant.builder().id(200L).product(outOfStockProduct).stockQuantity(0L).build();

        OrderItem orderItem = OrderItem.builder()
                .id(300L)
                .status(OrderStatus.PENDING_CONFIRMATION)
                .productVariant(variantToRestore)
                .quantity(2L)
                .build();

        Order order = Order.builder()
                .id(10L)
                .user(mockUser)
                .status(OrderStatus.PENDING_CONFIRMATION)
                .paymentMethod(PaymentMethod.COD)
                .orderItems(List.of(orderItem))
                .build();

        CancelOrderRequestDTO request = new CancelOrderRequestDTO("Tôi đổi ý không mua nữa");

        when(orderRepository.findById(10L)).thenReturn(Optional.of(order));

        MessageResponseDTO response = orderService.cancelOrder(1L, 10L, request);

        assertEquals("Hủy đơn hàng thành công!", response.getMessage());
        assertEquals(OrderStatus.CANCELLED, order.getStatus());
        assertEquals(OrderStatus.CANCELLED, orderItem.getStatus());
        assertEquals("Tôi đổi ý không mua nữa", orderItem.getCancellationReason());

        // Kiểm tra số lượng tồn kho được khôi phục
        assertEquals(2L, variantToRestore.getStockQuantity());
        verify(productVariantRepository).save(variantToRestore);

        // Kiểm tra sản phẩm cha được mở lại trạng thái ACTIVE
        assertEquals(ProductStatus.ACTIVE, outOfStockProduct.getStatus());

        // Kiểm tra các repository đã được gọi lưu trữ
        verify(orderRepository).save(order);
        verify(orderItemRepository).save(orderItem);
        verify(orderHistoryRepository).save(any(OrderHistory.class));
        verify(notificationService).createNotification(eq(mockUser), anyString(), anyString(), eq("WARNING"), eq(10L));
    }

    @Test
    void cancelOrder_Success_PaidOnline_UpdatesRefundStatus() {
        ProductVariant variant = ProductVariant.builder().id(200L).product(mockProduct).stockQuantity(10L).build();
        OrderItem orderItem = OrderItem.builder()
                .id(300L)
                .status(OrderStatus.PAID)
                .productVariant(variant)
                .quantity(1L)
                .build();

        Order order = Order.builder()
                .id(10L)
                .user(mockUser)
                .status(OrderStatus.PAID)
                .paymentMethod(PaymentMethod.MOMO)
                .orderItems(List.of(orderItem))
                .build();

        CancelOrderRequestDTO request = new CancelOrderRequestDTO("Hủy đơn đã thanh toán");

        when(orderRepository.findById(10L)).thenReturn(Optional.of(order));

        MessageResponseDTO response = orderService.cancelOrder(1L, 10L, request);

        assertTrue(response.getMessage().contains("Yêu cầu hoàn tiền đang được xử lý"));
        assertEquals(OrderStatus.CANCELLED, orderItem.getStatus());
        assertEquals(RefundStatus.PENDING, orderItem.getRefundStatus());
    }
    // =========================================================================
    // 7. Get Order List & Details Tests (AC-BE-US28)
    // =========================================================================

    @Test
    void getMyOrders_Success_ReturnsOrderSummaryList() {
        // Arrange
        Order order1 = Order.builder()
                .id(10L)
                .user(mockUser)
                .totalAmount(500000.0)
                .status(OrderStatus.PENDING_CONFIRMATION)
                .paymentMethod(PaymentMethod.COD)
                .orderItems(new ArrayList<>())
                .build();

        org.springframework.data.domain.Page<Order> orderPage = new org.springframework.data.domain.PageImpl<>(List.of(order1));

        when(orderRepository.findAllMyOrders(eq(1L), any(org.springframework.data.domain.Pageable.class)))
                .thenReturn(orderPage);

        // Act
        org.springframework.data.domain.Page<com.fashion.dto.response.OrderSummaryResponseDTO> result =
                orderService.getMyOrders(1L, null, org.springframework.data.domain.PageRequest.of(0, 10));

        // Assert (AC-BE-US28-01: Returns 200 OK with correct data structure)
        assertNotNull(result);
        assertEquals(1, result.getContent().size());
        assertEquals(10L, result.getContent().get(0).getOrderId());
        assertEquals(500000.0, result.getContent().get(0).getTotalAmount());
        assertEquals(OrderStatus.PENDING_CONFIRMATION, result.getContent().get(0).getStatus());
    }

    @Test
    void getMyOrderDetail_Success_ReturnsFullData() {
        // Arrange
        OrderItem orderItem = OrderItem.builder()
                .id(300L)
                .status(OrderStatus.PENDING_CONFIRMATION)
                .productVariant(mockVariant)
                .productName("Áo Thun Nam")
                .quantity(2L)
                .price(200000.0)
                .orderHistories(new ArrayList<>())
                .build();

        Order order = Order.builder()
                .id(10L)
                .user(mockUser) // userId = 1L
                .totalAmount(400000.0)
                .status(OrderStatus.PENDING_CONFIRMATION)
                .paymentMethod(PaymentMethod.COD)
                .orderItems(List.of(orderItem))
                .build();

        when(orderRepository.findById(10L)).thenReturn(Optional.of(order));

        // Act
        com.fashion.dto.response.OrderDetailResponseDTO result = orderService.getMyOrderDetail(1L, 10L);

        // Assert
        assertNotNull(result);
        assertEquals(10L, result.getOrderId());
        assertEquals(400000.0, result.getTotalAmount());
        assertEquals(1, result.getItems().size());
        assertEquals("Áo Thun Nam", result.getItems().get(0).getProductName());
        assertEquals(200000.0, result.getItems().get(0).getPrice());
    }


    // =========================================================================
    // TEST CASE ĐÃ SỬA LẠI: HỦY ĐƠN HÀNG CỦA NGƯỜI KHÁC (ném ra 403 AccessDenied)
    // =========================================================================
    @Test
    void cancelOrder_Fails_WhenOrderOwnedByAnotherUser() {
        // Arrange
        User anotherUser = User.builder().id(2L).build();
        Order order = Order.builder()
                .id(10L)
                .user(anotherUser) // Đơn hàng thuộc về user 2
                .status(OrderStatus.PENDING_CONFIRMATION)
                .build();

        CancelOrderRequestDTO request = new CancelOrderRequestDTO("Hủy đơn");

        when(orderRepository.findById(10L)).thenReturn(Optional.of(order));

        // Act & Assert
        AccessDeniedException ex = assertThrows(AccessDeniedException.class, () ->
                orderService.cancelOrder(1L, 10L, request) // User 1 cố tình gọi hủy đơn của User 2
        );

        assertTrue(ex.getMessage().contains("Bạn không có quyền hủy đơn hàng này!"));
        verify(orderRepository, never()).save(any(Order.class));
    }

    // =========================================================================
    // TEST CASE ĐÃ SỬA LẠI: XEM CHI TIẾT ĐƠN HÀNG CỦA NGƯỜI KHÁC (ném ra 403 AccessDenied)
    // =========================================================================
    @Test
    void getMyOrderDetail_Fails_WhenOrderBelongsToOtherUser_ThrowsSecurityError() {
        // Arrange
        User anotherUser = User.builder().id(2L).build();
        Order order = Order.builder()
                .id(10L)
                .user(anotherUser) // Đơn hàng thuộc về user 2
                .build();

        when(orderRepository.findById(10L)).thenReturn(Optional.of(order));

        // Act & Assert (AC-BE-US28-02: Security Error)
        AccessDeniedException ex = assertThrows(AccessDeniedException.class, () -> {
            orderService.getMyOrderDetail(1L, 10L); // User 1 cố gắng truy cập đơn của User 2
        });

        assertTrue(ex.getMessage().contains("Truy cập bị từ chối"), "Phải trả về lỗi từ chối truy cập");
    }

    // =========================================================================
    // 2 TEST CASE MỚI THÊM VÀO: LẤY DANH SÁCH LỊCH SỬ ĐƠN HÀNG (AC-BE-US28-03)
    // =========================================================================
    @Test
    void getCustomerOrderHistory_Success_ReturnsMappedDTOList() {
        // Arrange
        User mockUser = User.builder().id(1L).fullName("Nguyễn Văn A").build();

        ProductVariant mockVariant = ProductVariant.builder()
                .id(100L)
                .size("M")
                .color("Đen")
                .price(200000.0)
                .build();

        OrderItem orderItem = OrderItem.builder()
                .id(300L)
                .status(OrderStatus.DELIVERED)
                .productVariant(mockVariant)
                .productName("Áo Thun Nam")
                .quantity(1L)
                .price(200000.0)
                .build();

        Order order = Order.builder()
                .id(20L)
                .user(mockUser)
                .totalAmount(200000.0)
                .status(OrderStatus.DELIVERED)
                .paymentMethod(PaymentMethod.VNPAY)
                .orderItems(List.of(orderItem))
                .orderDate(java.time.Instant.now())
                .build();

        when(orderRepository.findByUserIdOrderByOrderDateDesc(1L)).thenReturn(List.of(order));

        // Act
        List<com.fashion.dto.response.OrderSummaryResponseDTO> result = orderService.getCustomerOrderHistory(1L);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(20L, result.get(0).getOrderId());
        assertEquals(200000.0, result.get(0).getTotalAmount());
        assertEquals(OrderStatus.DELIVERED, result.get(0).getStatus());
        assertEquals(1, result.get(0).getItemCount());
        assertEquals("Áo Thun Nam", result.get(0).getItems().get(0).getProductName());

        verify(orderRepository, times(1)).findByUserIdOrderByOrderDateDesc(1L);
    }

    @Test
    void getCustomerOrderHistory_EmptyList_ReturnsEmpty() {
        // Arrange: Người dùng chưa có đơn hàng nào
        when(orderRepository.findByUserIdOrderByOrderDateDesc(1L)).thenReturn(java.util.Collections.emptyList());

        // Act
        List<com.fashion.dto.response.OrderSummaryResponseDTO> result = orderService.getCustomerOrderHistory(1L);

        // Assert
        assertNotNull(result);
        assertTrue(result.isEmpty());
        verify(orderRepository, times(1)).findByUserIdOrderByOrderDateDesc(1L);
    }
}
