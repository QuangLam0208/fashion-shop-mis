package com.fashion.service.dashboard;

import com.fashion.dto.response.DashboardResponseDTO;
import com.fashion.model.Order;
import com.fashion.model.enums.OrderStatus;
import com.fashion.model.enums.ReturnStatus;
import com.fashion.model.enums.Role;
import com.fashion.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final ReturnRequestRepository returnRequestRepository;
    private final ProductRepository productRepository;
    private final OrderItemRepository orderItemRepository;

    @Override
    @Transactional(readOnly = true)
    public DashboardResponseDTO getDashboardData() {

        // Tính khoảng thời gian tháng này và tháng trước
        Calendar cal = Calendar.getInstance();

        // Đầu tháng này
        cal.set(Calendar.DAY_OF_MONTH, 1);
        cal.set(Calendar.HOUR_OF_DAY, 0);
        cal.set(Calendar.MINUTE, 0);
        cal.set(Calendar.SECOND, 0);
        cal.set(Calendar.MILLISECOND, 0);
        Date startOfThisMonth = cal.getTime();

        // Cuối tháng này (= ngày hiện tại)
        Date now = new Date();

        // Đầu tháng trước
        cal.add(Calendar.MONTH, -1);
        Date startOfLastMonth = cal.getTime();

        // Cuối tháng trước (= đầu tháng này - 1ms)
        Calendar endLastMonthCal = Calendar.getInstance();
        endLastMonthCal.setTime(startOfThisMonth);
        endLastMonthCal.add(Calendar.MILLISECOND, -1);
        Date endOfLastMonth = endLastMonthCal.getTime();

        // KPI: Doanh thu
        Double revenueThisMonth = orderRepository.calculateTotalRevenueAll(startOfThisMonth, now);
        Double revenueLastMonth = orderRepository.calculateTotalRevenueAll(startOfLastMonth, endOfLastMonth);

        // KPI: Đơn hàng
        int ordersThisMonth = orderRepository.countOrders(startOfThisMonth, now);
        int ordersLastMonth = orderRepository.countOrders(startOfLastMonth, endOfLastMonth);

        // KPI: Khách hàng
        long totalCustomers = userRepository.countByRole(Role.CUSTOMER);

        // KPI: Hoàn trả chờ xử lý
        long pendingReturns = returnRequestRepository.countByStatus(ReturnStatus.PENDING);

        // KPI: Tổng sản phẩm
        long totalProducts = productRepository.count();

        // Đơn hàng gần đây
        List<Order> recentOrders = orderRepository.findTop5ByOrderByOrderDateDesc();
        List<DashboardResponseDTO.RecentOrderDTO> recentOrderDTOs = recentOrders.stream()
                .map(o -> DashboardResponseDTO.RecentOrderDTO.builder()
                        .orderId(o.getId())
                        .customerName(o.getUser() != null ? o.getUser().getFullName()
                                : "Khách vãng lai")
                        .totalAmount(o.getTotalAmount())
                        .status(o.getOrderItems() != null && !o.getOrderItems().isEmpty()
                                ? o.getOrderItems().get(0).getStatus().name()
                                : o.getStatus().name())
                        .orderDate(o.getOrderDate())
                        .paymentMethod(o.getPaymentMethod().name())
                        .build())
                .collect(Collectors.toList());

        // Sản phẩm bán chạy (Top 5)
        List<Object[]> topSellingRaw = orderItemRepository.findTopSellingProducts();
        List<DashboardResponseDTO.TopProductDTO> topProducts = topSellingRaw.stream()
                .limit(5)
                .map(row -> DashboardResponseDTO.TopProductDTO.builder()
                        .productName((String) row[0])
                        .totalSold(((Number) row[1]).longValue())
                        .revenue(((Number) row[2]).doubleValue())
                        .build())
                .collect(Collectors.toList());

        // Thống kê đơn theo trạng thái
        List<Object[]> statusRaw = orderRepository.countOrdersByItemStatus();
        Map<String, Long> orderStatusStats = new LinkedHashMap<>();
        for (Object[] row : statusRaw) {
            OrderStatus status = (OrderStatus) row[0];
            Long count = ((Number) row[1]).longValue();
            orderStatusStats.put(status.name(), count);
        }

        return DashboardResponseDTO.builder()
                .revenueThisMonth(revenueThisMonth != null ? revenueThisMonth : 0.0)
                .revenueLastMonth(revenueLastMonth != null ? revenueLastMonth : 0.0)
                .ordersThisMonth(ordersThisMonth)
                .ordersLastMonth(ordersLastMonth)
                .totalCustomers(totalCustomers)
                .pendingReturns(pendingReturns)
                .totalProducts(totalProducts)
                .recentOrders(recentOrderDTOs)
                .topProducts(topProducts)
                .orderStatusStats(orderStatusStats)
                .build();
    }
}
