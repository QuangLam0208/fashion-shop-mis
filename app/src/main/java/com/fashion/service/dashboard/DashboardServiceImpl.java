package com.fashion.service.dashboard;

import com.fashion.dto.response.DashboardResponseDTO;
import com.fashion.model.Order;
import com.fashion.model.Product;
import com.fashion.model.enums.OrderStatus;
import com.fashion.model.enums.ReturnStatus;
import com.fashion.model.enums.Role;
import com.fashion.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
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

        Instant now = Instant.now();
        Instant startOfTime = Instant.EPOCH; // Dùng để tính tổng toàn thời gian

        // KPI: Doanh thu tổng (Khớp totalRevenue)
        Double totalRevenue = orderRepository.calculateTotalRevenueAll(startOfTime, now);

        // KPI: Tổng số đơn hàng (Khớp totalOrders)
        int totalOrders = orderRepository.countOrders(startOfTime, now);

        // KPI: Khách hàng (Khớp totalCustomers)
        long totalCustomers = userRepository.countByRole(Role.CUSTOMER);

        // Các KPI phụ
        long pendingReturns = returnRequestRepository.countByStatus(ReturnStatus.PENDING);
        long totalProducts = productRepository.count();

        // Đơn hàng gần đây
        List<Order> recentOrders = orderRepository.findTop5ByOrderByOrderDateDesc();
        List<DashboardResponseDTO.RecentOrderDTO> recentOrderDTOs = recentOrders.stream()
                .map(o -> DashboardResponseDTO.RecentOrderDTO.builder()
                        .orderId(o.getId())
                        .customerName(o.getUser() != null ? o.getUser().getFullName() : "Khách vãng lai")
                        .totalAmount(o.getTotalAmount())
                        .status(o.getOrderItems() != null && !o.getOrderItems().isEmpty()
                                ? o.getOrderItems().get(0).getStatus().name()
                                : o.getStatus().name())
                        .orderDate(o.getOrderDate())
                        .paymentMethod(o.getPaymentMethod().name())
                        .build())
                .collect(Collectors.toList());

        // Sản phẩm bán chạy (Top 5) -> Khớp topSellingProducts
        List<Object[]> topSellingRaw = orderItemRepository.findTopSellingProducts();
        
        List<Long> productIds = topSellingRaw.stream()
                .limit(5)
                .map(row -> row[0] != null ? ((Number) row[0]).longValue() : null)
                .filter(Objects::nonNull)
                .collect(Collectors.toList());

        Map<Long, String> productImages = new HashMap<>();
        if (!productIds.isEmpty()) {
            List<Product> products = productRepository.findAllById(productIds);
            for (Product p : products) {
                String imgUrl = p.getImages().isEmpty() ? "/images/placeholder.png" : p.getImages().get(0).getUrl();
                productImages.put(p.getId(), formatImageUrl(imgUrl));
            }
        }

        List<DashboardResponseDTO.TopProductDTO> topSellingProducts = topSellingRaw.stream()
                .limit(5)
                .map(row -> {
                    Long productId = row[0] != null ? ((Number) row[0]).longValue() : null;
                    return DashboardResponseDTO.TopProductDTO.builder()
                            .productId(productId)
                            .productName((String) row[1])
                            .totalSold(((Number) row[2]).longValue())
                            .revenue(((Number) row[3]).doubleValue())
                            .primaryImageUrl(productId != null ? productImages.getOrDefault(productId, "/images/placeholder.png") : "/images/placeholder.png")
                            .build();
                })
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
                .totalRevenue(totalRevenue != null ? totalRevenue : 0.0)
                .totalOrders(totalOrders)
                .totalCustomers(totalCustomers)
                .pendingReturns(pendingReturns)
                .totalProducts(totalProducts)
                .recentOrders(recentOrderDTOs)
                .topSellingProducts(topSellingProducts)
                .orderStatusStats(orderStatusStats)
                .build();
    }

    private String formatImageUrl(String url) {
        if (url == null)
            return "/images/placeholder.png";
        if (url.startsWith("http") || url.startsWith("/"))
            return url;
        return "/" + url;
    }
}