package com.fashion.service.dashboard;

import com.fashion.dto.response.DashboardResponseDTO;
import com.fashion.dto.response.RevenueReturnChartDTO;
import com.fashion.model.Order;
import com.fashion.model.Product;
import com.fashion.model.enums.OrderStatus;
import com.fashion.model.enums.PaymentMethod;
import com.fashion.model.enums.ReturnStatus;
import com.fashion.model.enums.Role;
import com.fashion.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
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
    @Override
    @Transactional(readOnly = true)
    public List<RevenueReturnChartDTO> getRevenueAndReturnRateChart(Date startDate, Date endDate) {
        // 1. Điều chỉnh endDate lên cuối ngày (23:59:59) để bao quát hết dữ liệu trong ngày
        Calendar cal = Calendar.getInstance();
        cal.setTime(endDate);
        cal.set(Calendar.HOUR_OF_DAY, 23);
        cal.set(Calendar.MINUTE, 59);
        cal.set(Calendar.SECOND, 59);
        cal.set(Calendar.MILLISECOND, 999);
        Date adjustedEndDate = cal.getTime();

        Instant startInstant = startDate.toInstant();
        Instant endInstant = adjustedEndDate.toInstant();

        // 2. Lấy toàn bộ đơn hàng trong khoảng thời gian này
        List<Order> orders = orderRepository.findAllOrdersByDateRange(startInstant, endInstant);

        // 3. Nhóm đơn hàng theo ngày (yyyy-MM-dd)
        Map<String, List<Order>> ordersByDate = orders.stream()
                .collect(Collectors.groupingBy(o ->
                        DateTimeFormatter.ofPattern("yyyy-MM-dd")
                                .withZone(ZoneId.systemDefault())
                                .format(o.getOrderDate())
                ));

        List<RevenueReturnChartDTO> chartData = new ArrayList<>();

        // 4. Khởi tạo danh sách các ngày để fill dữ liệu zero-filling (Đảm bảo trục X liên tục)
        LocalDate startLocal = startDate.toInstant().atZone(ZoneId.systemDefault()).toLocalDate();
        LocalDate endLocal = adjustedEndDate.toInstant().atZone(ZoneId.systemDefault()).toLocalDate();

        for (LocalDate date = startLocal; !date.isAfter(endLocal); date = date.plusDays(1)) {
            String dateStr = date.toString(); // Format: yyyy-MM-dd
            List<Order> dailyOrders = ordersByDate.getOrDefault(dateStr, new ArrayList<>());

            double dailyRevenue = 0.0;
            long shippedOrdersCount = 0;
            long returnedOrdersCount = 0;

            for (Order o : dailyOrders) {
                // A. Tính Doanh Thu Thực Tế (Chỉ tính các đơn hợp lệ sinh ra tiền)
                boolean isRevenueGenerating = false;
                if (o.getPaymentMethod() == PaymentMethod.COD && (o.getStatus() == OrderStatus.DELIVERED || o.getStatus() == OrderStatus.COMPLETED)) {
                    isRevenueGenerating = true;
                } else if (o.getPaymentMethod() != PaymentMethod.COD &&
                        (o.getStatus() == OrderStatus.PAID || o.getStatus() == OrderStatus.PROCESSING ||
                                o.getStatus() == OrderStatus.SHIPPING || o.getStatus() == OrderStatus.DELIVERED ||
                                o.getStatus() == OrderStatus.COMPLETED)) {
                    isRevenueGenerating = true;
                }

                if (isRevenueGenerating) {
                    dailyRevenue += (o.getTotalAmount() != null ? o.getTotalAmount() : 0.0);
                }

                // B. Xác định tổng đơn đã xuất xưởng
                boolean isShipped = o.getStatus() == OrderStatus.SHIPPING ||
                        o.getStatus() == OrderStatus.DELIVERED ||
                        o.getStatus() == OrderStatus.COMPLETED ||
                        o.getStatus() == OrderStatus.RETURNED;

                if (isShipped) {
                    shippedOrdersCount++;

                    // C. Xác định đơn có trả hàng thành công
                    boolean hasSuccessfulReturn = false;
                    if (o.getReturnRequests() != null) {
                        hasSuccessfulReturn = o.getReturnRequests().stream()
                                .anyMatch(rr -> rr.getStatus() == ReturnStatus.COMPLETED);
                    }

                    if (hasSuccessfulReturn || o.getStatus() == OrderStatus.RETURNED) {
                        returnedOrdersCount++;
                    }
                }
            }

            // D. Tính Tỷ lệ trả hàng (Return Rate %) = [Số đơn trả hàng thành công / Tổng số đơn xuất xưởng] * 100
            double returnRate = 0.0;
            if (shippedOrdersCount > 0) {
                returnRate = ((double) returnedOrdersCount / shippedOrdersCount) * 100.0;
                // Làm tròn 2 chữ số thập phân
                returnRate = Math.round(returnRate * 100.0) / 100.0;
            }

            // Ghi nhận vào biểu đồ
            chartData.add(RevenueReturnChartDTO.builder()
                    .date(dateStr)
                    .revenue(dailyRevenue)
                    .returnRate(returnRate)
                    .build());
        }

        return chartData;
    }
}