package com.fashion.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.Date;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardResponseDTO {
    // KPI Cards
    private Double revenueThisMonth;
    private Double revenueLastMonth;
    private int ordersThisMonth;
    private int ordersLastMonth;
    private long totalCustomers;
    private long pendingReturns;
    private long totalProducts;

    // Đơn hàng gần đây
    private List<RecentOrderDTO> recentOrders;

    // Sản phẩm bán chạy
    private List<TopProductDTO> topProducts;

    // Thống kê đơn theo trạng thái
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
    }
}
