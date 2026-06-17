package com.fashion.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardResponseDTO {
    private Double totalRevenue;
    private int totalOrders;
    private long totalCustomers;
    private long pendingReturns;
    private long totalProducts;

    // Đơn hàng gần đây
    private List<RecentOrderDTO> recentOrders;

    private List<TopProductDTO> topSellingProducts;
    private Map<String, Long> orderStatusStats;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RecentOrderDTO {
        private Long orderId;
        private String customerName;
        private Double totalAmount;
        private String status;
        private Instant orderDate;
        private String paymentMethod;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TopProductDTO {
        private Long productId;
        private String productName;
        private Long totalSold;
        private Double revenue;
        private String primaryImageUrl;
    }
}