package com.fashion.service.return_request;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.util.*;

import com.fashion.dto.request.SubmitReturnRequestDTO;
import com.fashion.exception.BadRequestException;
import com.fashion.model.Order;
import com.fashion.model.OrderItem;
import com.fashion.model.ReturnRequest;
import com.fashion.model.User;
import com.fashion.model.enums.OrderStatus;
import com.fashion.model.enums.RefundStatus;
import com.fashion.model.enums.ReturnStatus;
import com.fashion.repository.OrderRepository;
import com.fashion.repository.ReturnRequestRepository;
import com.fashion.util.SecurityUtils;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class ReturnRequestServiceImplTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private ReturnRequestRepository returnRepository;

    @InjectMocks
    private ReturnRequestServiceImpl returnRequestService;

    private MockedStatic<SecurityUtils> mockedSecurityUtils;

    private User mockUser;
    private Order mockOrder;
    private OrderItem item1;
    private OrderItem item2;
    private SubmitReturnRequestDTO validDto;

    @BeforeEach
    void setUp() {
        // Khởi tạo MockedStatic cho SecurityUtils trước mỗi test case
        mockedSecurityUtils = mockStatic(SecurityUtils.class);

        // Khởi tạo dữ liệu mẫu
        mockUser = new User();
        mockUser.setId(100L);

        mockOrder = new Order();
        mockOrder.setId(1L);
        mockOrder.setUser(mockUser);

        item1 = new OrderItem();
        item1.setId(10L);
        item1.setProductName("Sản phẩm A");
        item1.setStatus(OrderStatus.DELIVERED);
        item1.setOrder(mockOrder);

        item2 = new OrderItem();
        item2.setId(11L);
        item2.setProductName("Sản phẩm B");
        item2.setStatus(OrderStatus.COMPLETED);
        item2.setOrder(mockOrder);

        mockOrder.setOrderItems(Arrays.asList(item1, item2));

        validDto = new SubmitReturnRequestDTO();
        validDto.setOrderId(1L);
        validDto.setItemIds(Arrays.asList(10L, 11L));
        validDto.setReason("Hàng lỗi");
        validDto.setDescription("Bị vỡ màn hình");
        validDto.setImageUrls(List.of("http://image.com/1.png"));
    }

    @AfterEach
    void tearDown() {
        // Phải close MockedStatic sau mỗi test case để tránh ảnh hưởng đến luồng khác
        mockedSecurityUtils.close();
    }

    /**
     * Case 1: Tạo yêu cầu hoàn trả thành công khi tất cả điều kiện được thỏa mãn.
     */
    @Test
    void submitReturnRequest_Success() {
        // Giả lập SecurityUtils trả về đúng UserId sở hữu đơn hàng
        mockedSecurityUtils.when(SecurityUtils::getAuthenticatedUserId).thenReturn(100L);

        when(orderRepository.findById(1L)).thenReturn(Optional.of(mockOrder));
        when(returnRepository.existsByItemIdsAndStatuses(anyList(), anyList())).thenReturn(false);

        // Giả lập hành vi lưu dữ liệu
        when(returnRepository.save(any(ReturnRequest.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Thực thi hành động
        ReturnRequest result = returnRequestService.submitReturnRequest(validDto);

        // Kiểm tra kết quả mapping dữ liệu
        assertNotNull(result);
        assertEquals(ReturnStatus.PENDING, result.getStatus());
        assertEquals(mockOrder, result.getOrder());
        assertEquals(mockUser, result.getUser());
        assertEquals(2, result.getReturnItems().size());
        assertEquals("Hàng lỗi", result.getReason());

        // Kiểm tra trạng thái của từng sản phẩm trong đơn hàng được cập nhật
        assertEquals(RefundStatus.PENDING, item1.getRefundStatus());
        assertEquals(RefundStatus.PENDING, item2.getRefundStatus());
        assertEquals(result, item1.getReturnRequest());

        // Xác minh tương tác với Repository
        verify(orderRepository, times(1)).findById(1L);
        verify(returnRepository, times(1)).existsByItemIdsAndStatuses(anyList(), anyList());
        verify(returnRepository, times(1)).save(any(ReturnRequest.class));
    }

    /**
     * Case 2: Ném BadRequestException khi có sản phẩm chưa đạt trạng thái DELIVERED hoặc COMPLETED.
     */
    @Test
    void submitReturnRequest_ThrowsException_WhenItemStatusInvalid() {
        // Thay đổi trạng thái của item1 thành trạng thái không hợp lệ để test
        item1.setStatus(OrderStatus.SHIPPING);

        mockedSecurityUtils.when(SecurityUtils::getAuthenticatedUserId).thenReturn(100L);
        when(orderRepository.findById(1L)).thenReturn(Optional.of(mockOrder));

        // Kiểm tra exception
        BadRequestException exception = assertThrows(BadRequestException.class, () -> {
            returnRequestService.submitReturnRequest(validDto);
        });

        assertTrue(exception.getMessage().contains("chưa được giao thành công, không thể hoàn trả"));
        verify(returnRepository, never()).save(any(ReturnRequest.class));
    }

    /**
     * Case 3: Ném BadRequestException nếu sản phẩm được chọn đã có một yêu cầu hoàn trả đang xử lý.
     */
    @Test
    void submitReturnRequest_ThrowsException_WhenReturnRequestAlreadyExists() {
        mockedSecurityUtils.when(SecurityUtils::getAuthenticatedUserId).thenReturn(100L);
        when(orderRepository.findById(1L)).thenReturn(Optional.of(mockOrder));

        // Giả lập việc đã tồn tại một yêu cầu hoàn trả (PENDING/APPROVED)
        when(returnRepository.existsByItemIdsAndStatuses(anyList(), anyList())).thenReturn(true);

        // Kiểm tra exception
        BadRequestException exception = assertThrows(BadRequestException.class, () -> {
            returnRequestService.submitReturnRequest(validDto);
        });

        assertEquals("Một hoặc nhiều sản phẩm đã có yêu cầu hoàn trả đang được xử lý!", exception.getMessage());
        verify(returnRepository, never()).save(any(ReturnRequest.class));
    }

    /**
     * Case 4: Ném BadRequestException khi đơn hàng thuộc về một tài khoản khách hàng khác (Ownership Validation).
     */
    @Test
    void submitReturnRequest_ThrowsException_WhenUserDoesNotOwnOrder() {
        // Giả lập người dùng đang đăng nhập có ID là 999L (Khác với chủ đơn hàng là 100L)
        mockedSecurityUtils.when(SecurityUtils::getAuthenticatedUserId).thenReturn(999L);

        when(orderRepository.findById(1L)).thenReturn(Optional.of(mockOrder));

        // Kiểm tra exception
        BadRequestException exception = assertThrows(BadRequestException.class, () -> {
            returnRequestService.submitReturnRequest(validDto);
        });

        assertEquals("Bạn không có quyền yêu cầu hoàn trả cho đơn hàng này!", exception.getMessage());

        // Xác minh logic dừng lại ngay sau khi check quyền, không chạy xuống các bước check item hay repository phía dưới
        verify(returnRepository, never()).existsByItemIdsAndStatuses(anyList(), anyList());
        verify(returnRepository, never()).save(any(ReturnRequest.class));
    }
}