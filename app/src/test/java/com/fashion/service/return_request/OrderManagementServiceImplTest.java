package com.fashion.service.return_request;

import com.fashion.exception.BadRequestException;
import com.fashion.model.Order;
import com.fashion.model.OrderItem;
import com.fashion.model.ReturnRequest;
import com.fashion.model.User;
import com.fashion.model.enums.OrderStatus;
import com.fashion.model.enums.RefundStatus;
import com.fashion.model.enums.ReturnStatus;
import com.fashion.repository.OrderItemRepository;
import com.fashion.repository.ReturnRequestRepository;
import com.fashion.service.notification.NotificationService;
import com.fashion.service.order.OrderManagementServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderManagementServiceImplTest {

    @Mock
    private OrderItemRepository orderItemRepository;

    @Mock
    private ReturnRequestRepository returnRequestRepository;

    @Mock
    private NotificationService notificationService;

    // INJECT ĐÚNG SERVICE ĐANG CHỨA HÀM updateRefundStatus
    @InjectMocks
    private OrderManagementServiceImpl orderManagementService;

    private User mockUser;
    private Order mockOrder;
    private OrderItem mockItem;
    private ReturnRequest mockReturnRequest;

    @BeforeEach
    void setUp() {
        mockUser = new User();
        mockUser.setId(100L);

        mockOrder = new Order();
        mockOrder.setId(1L);
        mockOrder.setUser(mockUser);

        mockItem = new OrderItem();
        mockItem.setId(10L);
        mockItem.setProductName("Áo thun");
        mockItem.setOrder(mockOrder);
        mockItem.setRefundStatus(RefundStatus.PENDING);
        mockItem.setStatus(OrderStatus.DELIVERED);

        mockReturnRequest = new ReturnRequest();
        mockReturnRequest.setId(5L);
        mockReturnRequest.setStatus(ReturnStatus.APPROVED);
    }

    @Test
    @DisplayName("US36 - 1: Cập nhật thành công sang COMPLETED, OrderItem đổi sang RETURNED và tạo thông báo")
    void updateRefundStatus_Success_ToCompleted() {
        when(orderItemRepository.findById(10L)).thenReturn(Optional.of(mockItem));

        // Gọi đúng Service
        orderManagementService.updateRefundStatus(10L, RefundStatus.COMPLETED);

        assertEquals(RefundStatus.COMPLETED, mockItem.getRefundStatus());
        assertEquals(OrderStatus.RETURNED, mockItem.getStatus());
        verify(orderItemRepository, times(1)).save(mockItem);

        verify(notificationService, times(1)).createNotification(
                eq(mockUser.getId()), eq("Hoàn tiền thành công"), anyString(), eq("SUCCESS"), eq(1L)
        );
    }

    @Test
    @DisplayName("US36 - 2: Ném lỗi Dependency khi cố cập nhật dữ liệu có trạng thái khác PENDING")
    void updateRefundStatus_ThrowsException_WhenStatusNotPending() {
        mockItem.setRefundStatus(RefundStatus.COMPLETED);
        when(orderItemRepository.findById(10L)).thenReturn(Optional.of(mockItem));

        BadRequestException exception = assertThrows(BadRequestException.class, () -> {
            orderManagementService.updateRefundStatus(10L, RefundStatus.COMPLETED);
        });

        assertEquals("Chỉ sản phẩm đang chờ xử lý mới được cập nhật trạng thái refund!", exception.getMessage());
        verify(orderItemRepository, never()).save(any());
    }

    @Test
    @DisplayName("US36 - 3: Tự động đóng phiếu ReturnRequest sang COMPLETED khi tất cả item con hoàn tất")
    void updateRefundStatus_AutoCloseReturnRequest() {
        mockItem.setReturnRequest(mockReturnRequest);

        OrderItem item2 = new OrderItem();
        item2.setId(11L);
        item2.setRefundStatus(RefundStatus.REJECTED);
        item2.setReturnRequest(mockReturnRequest);

        mockReturnRequest.setReturnItems(List.of(mockItem, item2));

        when(orderItemRepository.findById(10L)).thenReturn(Optional.of(mockItem));

        orderManagementService.updateRefundStatus(10L, RefundStatus.COMPLETED);

        assertEquals(ReturnStatus.COMPLETED, mockReturnRequest.getStatus());
        assertNotNull(mockReturnRequest.getProcessedAt());
        verify(returnRequestRepository, times(1)).save(mockReturnRequest);
    }
}