package com.fashion.service.order;

import com.fashion.dto.request.PlaceOrderRequestDTO;
import com.fashion.dto.response.PlaceOrderResponseDTO;
import com.fashion.exception.BadRequestException;
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
}
