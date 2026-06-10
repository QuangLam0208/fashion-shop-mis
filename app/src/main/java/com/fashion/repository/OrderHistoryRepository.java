package com.fashion.repository;

import com.fashion.model.Order;
import com.fashion.model.OrderHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface OrderHistoryRepository extends JpaRepository<OrderHistory, Long> {
//    // Lấy danh sách đơn hàng theo userId, sắp xếp mới nhất lên đầu
//    List<Order> findByUser_UserIdOrderByOrderDateDesc(Long userId);
}