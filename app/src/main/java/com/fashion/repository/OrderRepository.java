package com.fashion.repository;


import com.fashion.model.Order;
import com.fashion.model.enums.OrderStatus;
import com.fashion.model.enums.OrderType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    // Lấy Lịch sử mua hàng của 1 Khách hàng. Xếp TỪ MỚI NHẤT ĐẾN CŨ NHẤT
    // (OrderByOrderDateDesc)
    List<Order> findByUserIdOrderByOrderDateDesc(Long userId);

    // Lấy đơn hàng theo orderId, nhưng đảm bảo đơn hàng đó thuộc về userId
    Optional<Order> findByIdAndUserId(Long orderId, Long userId);

    // Lấy tất cả đơn hàng trong khoảng thời gian
    List<Order> findByOrderDateBetween(Date startDate, Date endDate);
 
    @Query("SELECT o FROM Order o WHERE o.orderDate BETWEEN :startDate AND :endDate " +
           "AND (" +
           "(o.paymentMethod = 'COD' AND o.status IN ('DELIVERED', 'COMPLETED')) OR " +
           "(o.paymentMethod != 'COD' AND o.status IN ('PAID', 'PROCESSING', 'SHIPPING', 'DELIVERED', 'COMPLETED'))" +
           ")")
    List<Order> findActiveOrdersInPeriod(@Param("startDate") Date startDate, @Param("endDate") Date endDate);

    // Tính tổng doanh thu theo loại đơn (ONLINE/OFFLINE) trong khoảng thời gian, loại bỏ các đơn chưa thanh toán hoặc đã hủy
    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.orderDate BETWEEN :startDate AND :endDate AND o.type = :type " +
           "AND (" +
           "(o.paymentMethod = 'COD' AND o.status IN ('DELIVERED', 'COMPLETED')) OR " +
           "(o.paymentMethod != 'COD' AND o.status IN ('PAID', 'PROCESSING', 'SHIPPING', 'DELIVERED', 'COMPLETED'))" +
           ")")
    Double calculateTotalRevenue(@Param("startDate") Date startDate, @Param("endDate") Date endDate,
            @Param("type") OrderType type);

    // Đếm số lượng đơn hàng trong khoảng thời gian, loại bỏ đơn đã hủy
    // Chỉ đếm các đơn được coi là "hợp lệ" (đã thanh toán hoặc đang giao)
    @Query("SELECT COUNT(o) FROM Order o WHERE o.orderDate BETWEEN :startDate AND :endDate " +
           "AND o.status NOT IN ('CANCELLED', 'PAYMENT_FAILED', 'PAYMENT_EXPIRED', 'PENDING_PAYMENT')")
    int countOrders(@Param("startDate") Date startDate, @Param("endDate") Date endDate);

    @Query("SELECT DISTINCT o FROM Order o LEFT JOIN o.orderItems oi WHERE (?1 IS NULL OR oi.status = ?1) AND (CAST(?2 AS date) IS NULL OR o.orderDate >= ?2) AND (CAST(?3 AS date) IS NULL OR o.orderDate <= ?3)")
    Page<Order> searchOrders(OrderStatus status, Date startDate, Date endDate, Pageable pageable);

    @Query("SELECT DISTINCT o FROM Order o LEFT JOIN o.orderItems oi WHERE o.user.id = :userId AND oi.status IN :statuses ORDER BY o.orderDate DESC")
    Page<Order> searchMyOrdersByStatuses(@Param("userId") Long userId, @Param("statuses") List<OrderStatus> statuses,
            Pageable pageable);

    @Query("SELECT DISTINCT o FROM Order o LEFT JOIN o.orderItems oi WHERE o.user.id = :userId ORDER BY o.orderDate DESC")
    Page<Order> findAllMyOrders(@Param("userId") Long userId, Pageable pageable);

    // Tìm đơn hàng quá hạn thanh toán
    List<Order> findByStatusAndOrderDateBefore(OrderStatus status, Date expireTime);

    // DASHBOARD
    // 5 đơn hàng mới nhất
    List<Order> findTop5ByOrderByOrderDateDesc();

    // Tổng doanh thu trong khoảng thời gian (tất cả loại), loại bỏ các đơn chưa thanh toán hoặc đã hủy
    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.orderDate BETWEEN :startDate AND :endDate " +
           "AND (" +
           "(o.paymentMethod = 'COD' AND o.status IN ('DELIVERED', 'COMPLETED')) OR " +
           "(o.paymentMethod != 'COD' AND o.status IN ('PAID', 'PROCESSING', 'SHIPPING', 'DELIVERED', 'COMPLETED'))" +
           ")")
    Double calculateTotalRevenueAll(@Param("startDate") Date startDate, @Param("endDate") Date endDate);

    // Đếm đơn theo từng trạng thái
    @Query("SELECT oi.status, COUNT(DISTINCT oi.order.id) FROM OrderItem oi GROUP BY oi.status")
    List<Object[]> countOrdersByItemStatus();

    // DASHBOARD USER: Đếm số lượng đơn theo trạng thái của 1 User
    @Query("SELECT oi.status, COUNT(DISTINCT oi.order.id) FROM OrderItem oi WHERE oi.order.user.id = :userId GROUP BY oi.status")
    List<Object[]> countMyOrdersByItemStatus(@Param("userId") Long userId);

    // Đếm số sản phẩm chưa đánh giá (Phải là đơn đã giao/hoàn thành)
    @Query("SELECT COUNT(oi) FROM OrderItem oi WHERE oi.order.user.id = :userId AND oi.status IN ('DELIVERED', 'COMPLETED') AND oi.isReviewed = false")
    long countUnreviewedItems(@Param("userId") Long userId);

    // Lấy đơn hàng mới nhất của 1 User
    Optional<Order> findTopByUserIdOrderByOrderDateDesc(Long userId);
}
