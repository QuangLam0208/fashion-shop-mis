package com.fashion.service.payment;

import com.fashion.model.Order;
import com.fashion.model.OrderItem;
import com.fashion.model.enums.OrderStatus;
import com.fashion.repository.OrderHistoryRepository;
import com.fashion.repository.OrderItemRepository;
import com.fashion.repository.OrderRepository;
import com.fashion.service.order.OrderManagementService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PaymentServiceImplTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private OrderItemRepository orderItemRepository;

    @Mock
    private OrderHistoryRepository orderHistoryRepository;

    @Mock
    private MomoService momoService;

    @Mock
    private OrderManagementService orderManagementService;

    @InjectMocks
    private PaymentServiceImpl paymentService;

    private Order mockOrder;
    private OrderItem mockOrderItem;

    @BeforeEach
    void setUp() {
        mockOrder = new Order();
        mockOrder.setId(1L);

        mockOrderItem = new OrderItem();
        mockOrderItem.setId(10L);
        mockOrderItem.setStatus(OrderStatus.PENDING_PAYMENT);
        mockOrderItem.setOrder(mockOrder);

        mockOrder.setOrderItems(List.of(mockOrderItem));
    }

    @Test
    void processMomoIPN_SignatureInvalid_ThrowsException() {
        Map<String, Object> payload = new HashMap<>();
        payload.put("orderId", 1L);
        payload.put("resultCode", 0);

        when(momoService.verifySignature(anyMap())).thenReturn(false);

        Exception exception = assertThrows(RuntimeException.class, () -> paymentService.processMomoIPN(payload));
        assertEquals("Chữ ký MoMo không hợp lệ!", exception.getMessage());
        
        verify(orderRepository, never()).findById(anyLong());
    }

    @Test
    void processMomoIPN_SignatureValid_Success_UpdatesStatusToPaid() {
        Map<String, Object> payload = new HashMap<>();
        payload.put("orderId", 1L);
        payload.put("resultCode", 0);

        when(momoService.verifySignature(anyMap())).thenReturn(true);
        when(orderRepository.findById(1L)).thenReturn(Optional.of(mockOrder));

        paymentService.processMomoIPN(payload);

        assertEquals(OrderStatus.PAID, mockOrderItem.getStatus());
        verify(orderItemRepository, times(1)).save(mockOrderItem);
        verify(orderHistoryRepository, times(1)).save(any());
        verify(orderManagementService, times(1)).updateOverallOrderStatus(mockOrder);
    }

    @Test
    void processMomoIPN_SignatureValid_Failed_UpdatesStatusToPaymentFailed() {
        Map<String, Object> payload = new HashMap<>();
        payload.put("orderId", 1L);
        payload.put("resultCode", 1006);

        when(momoService.verifySignature(anyMap())).thenReturn(true);
        when(orderRepository.findById(1L)).thenReturn(Optional.of(mockOrder));

        paymentService.processMomoIPN(payload);

        assertEquals(OrderStatus.PAYMENT_FAILED, mockOrderItem.getStatus());
        verify(orderItemRepository, times(1)).save(mockOrderItem);
        verify(orderHistoryRepository, never()).save(any());
        verify(orderManagementService, times(1)).updateOverallOrderStatus(mockOrder);
    }

    @Test
    void processMomoReturn_SignatureInvalid_ReturnsFailed() {
        Map<String, String> payload = new HashMap<>();
        payload.put("orderId", "1");
        payload.put("resultCode", "0");

        when(momoService.verifySignature(anyMap())).thenReturn(false);

        String result = paymentService.processMomoReturn(payload);

        assertEquals("failed", result);
        verify(orderRepository, never()).findById(anyLong());
    }

    @Test
    void processMomoReturn_SignatureValid_Success_ReturnsSuccess() {
        Map<String, String> payload = new HashMap<>();
        payload.put("orderId", "1");
        payload.put("resultCode", "0");

        when(momoService.verifySignature(anyMap())).thenReturn(true);
        when(orderRepository.findById(1L)).thenReturn(Optional.of(mockOrder));

        String result = paymentService.processMomoReturn(payload);

        assertEquals("success", result);
        assertEquals(OrderStatus.PAID, mockOrderItem.getStatus());
        verify(orderItemRepository, times(1)).save(mockOrderItem);
    }
}
