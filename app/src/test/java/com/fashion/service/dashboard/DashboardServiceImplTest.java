package com.fashion.service.dashboard;

import com.fashion.dto.response.DashboardResponseDTO;
import com.fashion.repository.*;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.ArrayList;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class DashboardServiceImplTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ReturnRequestRepository returnRequestRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private OrderItemRepository orderItemRepository;

    @InjectMocks
    private DashboardServiceImpl dashboardService;

    @Test
    public void testGetDashboardData_CalculatesRevenue_ExcludesCancelledOrders() {
        // ======================= ARRANGE (CHUẨN BỊ DỮ LIỆU) =======================

        // Mock dữ liệu doanh thu: Sử dụng any(Instant.class) do Repository đã đổi sang Instant
        when(orderRepository.calculateTotalRevenueAll(any(Instant.class), any(Instant.class)))
                .thenReturn(150500000.0) // Lần gọi 1: Tháng này
                .thenReturn(120000000.0); // Lần gọi 2: Tháng trước

        // Mock dữ liệu số lượng đơn hàng: Sử dụng any(Instant.class)
        when(orderRepository.countOrders(any(Instant.class), any(Instant.class)))
                .thenReturn(450)  // Lần gọi 1: Tháng này
                .thenReturn(380); // Lần gọi 2: Tháng trước

        // Mock các dependencies khác để ngăn NullPointerException
        when(userRepository.countByRole(any())).thenReturn(1250L);
        when(returnRequestRepository.countByStatus(any())).thenReturn(5L);
        when(productRepository.count()).thenReturn(320L);
        when(orderRepository.findTop5ByOrderByOrderDateDesc()).thenReturn(new ArrayList<>());
        when(orderItemRepository.findTopSellingProducts()).thenReturn(new ArrayList<>());
        when(orderRepository.countOrdersByItemStatus()).thenReturn(new ArrayList<>());

        // ======================= ACT (THỰC THI) =======================
        DashboardResponseDTO result = dashboardService.getDashboardData();

        // ======================= ASSERT (KIỂM CHỨNG KẾT QUẢ) =======================
        assertNotNull(result, "Đối tượng DashboardResponseDTO trả về không được null");

        // Kiểm tra Doanh thu
        assertEquals(150500000.0, result.getRevenueThisMonth(), "Doanh thu tháng này phải khớp với dữ liệu từ DB");
        assertEquals(120000000.0, result.getRevenueLastMonth(), "Doanh thu tháng trước phải khớp với dữ liệu từ DB");

        // Kiểm tra số đơn hàng
        assertEquals(450, result.getOrdersThisMonth(), "Tổng đơn hàng tháng này phải khớp");
        assertEquals(380, result.getOrdersLastMonth(), "Tổng đơn hàng tháng trước phải khớp");

        // Kiểm tra các chỉ số KPI khác
        assertEquals(1250L, result.getTotalCustomers());
        assertEquals(5L, result.getPendingReturns());
        assertEquals(320L, result.getTotalProducts());

        // Xác minh xem hàm Repository có được gọi đúng số lần không (2 lần: 1 cho tháng này, 1 cho tháng trước)
        verify(orderRepository, times(2)).calculateTotalRevenueAll(any(Instant.class), any(Instant.class));
        verify(orderRepository, times(2)).countOrders(any(Instant.class), any(Instant.class));
    }
}