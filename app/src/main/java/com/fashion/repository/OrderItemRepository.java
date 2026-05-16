package com.fashion.repository;

import com.fashion.model.OrderItem;
import com.fashion.model.enums.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    // Tìm đơn hàng thành công gần nhất của 1 người dùng cho 1 sản phẩm cụ thể
    Optional<OrderItem> findFirstByOrder_User_IdAndProductVariant_Product_IdOrderByOrder_OrderDateDesc(Long userId, Long productId);

    // Tìm OrderItem chưa đánh giá gần nhất của 1 người dùng cho 1 sản phẩm cụ thể
    Optional<OrderItem> findFirstByOrder_User_IdAndProductVariant_Product_IdAndIsReviewedFalseOrderByOrder_OrderDateDesc(Long userId, Long productId);

    // Lấy tất cả OrderItem của 1 đơn hàng
    List<OrderItem> findByOrder_Id(Long orderId);

    // Kiểm tra Khách hàng X đã mua thành công Sản phẩm Y chưa (để cấp quyền Đánh giá)
    boolean existsByOrder_User_IdAndStatusAndProductVariant_Product_Id(Long userId, OrderStatus status, Long productId);

    // Lấy tất cả OrderItem của 1 đơn theo trạng thái cụ thể
    List<OrderItem> findByOrder_IdAndStatus(Long orderId, OrderStatus status);

    // Truy vấn dành cho UI Cá nhân: Tách mảnh sản phẩm dựa vào Phân luồng Status và User
    Page<OrderItem> findByOrder_User_IdAndStatusInOrderByOrder_OrderDateDesc(Long userId, List<OrderStatus> statuses, Pageable pageable);

    // Truy vấn có lọc trạng thái đánh giá (Dùng cho tab Đã giao & Đánh giá)
    Page<OrderItem> findByOrder_User_IdAndStatusInAndIsReviewedOrderByOrder_OrderDateDesc(Long userId, List<OrderStatus> statuses, boolean isReviewed, Pageable pageable);

    // Truy vấn các sản phẩm đã đánh giá (Dùng cho Lịch sử Review)
    Page<OrderItem> findByOrder_User_IdAndIsReviewedTrueOrderByOrder_OrderDateDesc(Long userId, Pageable pageable);

    // DASHBOARD - Top 5 sản phẩm bán chạy nhất
    @Query("SELECT oi.productName, SUM(oi.quantity), SUM(oi.quantity * oi.price) " +
            "FROM OrderItem oi WHERE oi.status = com.fashion.model.enums.OrderStatus.DELIVERED " +
            "OR oi.status = com.fashion.model.enums.OrderStatus.COMPLETED " +
            "GROUP BY oi.productName ORDER BY SUM(oi.quantity) DESC")
    List<Object[]> findTopSellingProducts();
}