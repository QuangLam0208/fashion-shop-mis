package com.fashion.service.revenue;

import com.fashion.dto.response.RevenueReportDTO;
import com.fashion.model.Order;
import com.fashion.model.OrderItem;
import com.fashion.model.ProductVariant;
import com.fashion.model.enums.OrderType;
import com.fashion.repository.OrderRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.Collections;
import java.util.Date;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RevenueServiceImplTest {

    @Mock
    private OrderRepository orderRepository;

    @InjectMocks
    private RevenueServiceImpl revenueService;

    private Date startDate;
    private Date endDate;

    @BeforeEach
    void setUp() {
        startDate = new Date();
        endDate = new Date();
    }

    @Test
    void testGetDetailedRevenueReport_DiscountCalculation() {
        // 1. Chuẩn bị dữ liệu Mock
        // Giả sử có 2 sản phẩm: Giá 50,000 * 1 và 50,000 * 1 => Subtotal = 100,000
        // Khách hàng áp mã giảm giá, tổng thực trả (TotalAmount) = 80,000
        // => Thuật toán phải tính ra DiscountAmount = 20,000

        OrderItem item1 = new OrderItem();
        item1.setPrice(50000.0);
        item1.setQuantity(1L);
        item1.setProductName("Áo Thun A");

        OrderItem item2 = new OrderItem();
        item2.setPrice(50000.0);
        item2.setQuantity(1L);
        item2.setProductName("Quần Jean B");

        Order mockOrder = new Order();
        mockOrder.setId(1L);
        mockOrder.setTotalAmount(80000.0); // Khách thanh toán 80k
        mockOrder.setType(OrderType.ONLINE);
        mockOrder.setOrderDate(Instant.now());
        mockOrder.setOrderItems(List.of(item1, item2));

        // Cấu hình Mock cho Repository
        when(orderRepository.calculateTotalRevenue(any(), any(), eq(OrderType.ONLINE))).thenReturn(80000.0);
        when(orderRepository.calculateTotalRevenue(any(), any(), eq(OrderType.OFFLINE))).thenReturn(0.0);
        when(orderRepository.countOrders(any(), any())).thenReturn(1);
        when(orderRepository.findActiveOrdersInPeriod(any(), any())).thenReturn(List.of(mockOrder));

        // 2. Thực thi
        RevenueReportDTO report = revenueService.getDetailedRevenueReport(startDate, endDate);

        // 3. Kiểm tra (Assert)
        assertNotNull(report);
        assertEquals(80000.0, report.getOnlineRevenue());
        assertEquals(1, report.getTotalOrders());
        assertEquals(1, report.getOrders().size());

        // Kiểm tra logic tách phân rã tính discountAmount (100,000 - 80,000 = 20,000)
        RevenueReportDTO.OrderSummaryDTO orderSummary = report.getOrders().get(0);
        assertEquals(20000.0, orderSummary.getDiscountAmount(), "Tính toán sai số tiền giảm giá (Discount Amount)");
    }

    @Test
    void testExportRevenueReport_UnsupportedFormat_ThrowsException() {
        // Cấu hình Mock trả về dữ liệu rỗng
        when(orderRepository.calculateTotalRevenue(any(), any(), any())).thenReturn(0.0);
        when(orderRepository.countOrders(any(), any())).thenReturn(0);
        when(orderRepository.findActiveOrdersInPeriod(any(), any())).thenReturn(Collections.emptyList());

        // Kiểm tra ném ra RuntimeException khi format khác "csv"
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            revenueService.exportRevenueReport(startDate, endDate, "pdf");
        });

        assertTrue(exception.getMessage().contains("chưa được hỗ trợ"), "Message lỗi không chính xác");
    }

    @Test
    void testExportRevenueReport_Success() {
        // Kiểm tra xuất CSV không bị lỗi
        when(orderRepository.calculateTotalRevenue(any(), any(), any())).thenReturn(0.0);
        when(orderRepository.countOrders(any(), any())).thenReturn(0);
        when(orderRepository.findActiveOrdersInPeriod(any(), any())).thenReturn(Collections.emptyList());

        byte[] result = revenueService.exportRevenueReport(startDate, endDate, "csv");

        assertNotNull(result);
        assertTrue(result.length > 0);
    }
}