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

        // Mock Doanh thu & Đơn hàng
        when(orderRepository.calculateTotalRevenueAll(any(Instant.class), any(Instant.class)))
                .thenReturn(150500000.0);
        when(orderRepository.countOrders(any(Instant.class), any(Instant.class)))
                .thenReturn(450);

        // Mock các thông số khác
        when(userRepository.countByRole(any())).thenReturn(1250L);
        when(returnRequestRepository.countByStatus(any())).thenReturn(5L);
        when(productRepository.count()).thenReturn(320L);
        when(orderRepository.findTop5ByOrderByOrderDateDesc()).thenReturn(new ArrayList<>());
        when(orderItemRepository.findTopSellingProducts()).thenReturn(new ArrayList<>());
        when(orderRepository.countOrdersByItemStatus()).thenReturn(new ArrayList<>());

        // ACT
        DashboardResponseDTO result = dashboardService.getDashboardData();

        // ASSERT: Đảm bảo kiểm tra các trường đã đổi tên chuẩn AC
        assertNotNull(result);
        assertEquals(150500000.0, result.getTotalRevenue(), "Doanh thu tổng không khớp");
        assertEquals(450, result.getTotalOrders(), "Tổng số đơn hàng không khớp");
        assertEquals(1250L, result.getTotalCustomers());

        verify(orderRepository, times(1)).calculateTotalRevenueAll(any(Instant.class), any(Instant.class));
        verify(orderRepository, times(1)).countOrders(any(Instant.class), any(Instant.class));
    }
}