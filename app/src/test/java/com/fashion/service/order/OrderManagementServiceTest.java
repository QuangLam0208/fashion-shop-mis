package com.fashion.service.order;

import com.fashion.exception.BadRequestException;
import com.fashion.model.Order;
import com.fashion.model.OrderItem;
import com.fashion.model.enums.OrderStatus;
import com.fashion.repository.*;
import com.fashion.service.notification.NotificationService;
import com.fashion.util.SecurityUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class OrderManagementServiceTest {

    @Mock private OrderItemRepository orderItemRepository;
    @Mock private OrderHistoryRepository historyRepository;
    @Mock private OrderRepository orderRepository;
    @Mock private NotificationService notificationService;

    @InjectMocks
    private OrderManagementServiceImpl orderManagementService;

    private OrderItem sampleItem;

    @BeforeEach
    void setUp() {
        Order order = new Order();
        order.setId(1L);

        sampleItem = new OrderItem();
        sampleItem.setId(101L);
        sampleItem.setOrder(order);
    }

    @Test
    @DisplayName("Thành công: PENDING_CONFIRMATION -> CONFIRMED")
    void testTransition_PendingToConfirmed_Success() {
        try (MockedStatic<SecurityUtils> utilities = mockStatic(SecurityUtils.class)) {
            utilities.when(SecurityUtils::getAuthenticatedUserId).thenReturn(1L);

            sampleItem.setStatus(OrderStatus.PENDING_CONFIRMATION);
            when(orderItemRepository.findById(101L)).thenReturn(Optional.of(sampleItem));

            // Thực thi
            assertDoesNotThrow(() -> orderManagementService.updateOrderItemStatus(101L, OrderStatus.CONFIRMED));
            assertEquals(OrderStatus.CONFIRMED, sampleItem.getStatus());
        }
    }

    @Test
    @DisplayName("Thất bại: PENDING_CONFIRMATION -> SHIPPING (Nhảy cóc)")
    void testTransition_PendingToShipping_Fail() {
        try (MockedStatic<SecurityUtils> utilities = mockStatic(SecurityUtils.class)) {
            utilities.when(SecurityUtils::getAuthenticatedUserId).thenReturn(1L);

            sampleItem.setStatus(OrderStatus.PENDING_CONFIRMATION);
            when(orderItemRepository.findById(101L)).thenReturn(Optional.of(sampleItem));
            assertThrows(BadRequestException.class, () -> {
                orderManagementService.updateOrderItemStatus(101L, OrderStatus.SHIPPING);
            });
        }
    }

    @Test
    @DisplayName("Thành công: SHIPPING -> DELIVERED")
    void testTransition_ShippingToDelivered_Success() {
        try (MockedStatic<SecurityUtils> utilities = mockStatic(SecurityUtils.class)) {
            utilities.when(SecurityUtils::getAuthenticatedUserId).thenReturn(1L);

            sampleItem.setStatus(OrderStatus.SHIPPING);
            when(orderItemRepository.findById(101L)).thenReturn(Optional.of(sampleItem));

            assertDoesNotThrow(() -> orderManagementService.updateOrderItemStatus(101L, OrderStatus.DELIVERED));
            assertEquals(OrderStatus.DELIVERED, sampleItem.getStatus());
        }
    }
}