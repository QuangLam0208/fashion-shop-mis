package com.fashion.repository;

import com.fashion.model.ReturnRequest;
import com.fashion.model.enums.ReturnStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReturnRequestRepository extends JpaRepository<ReturnRequest, Long> {
    // Lấy danh sách Yêu cầu hoàn trả theo Trạng thái Ví dụ "CHỜ DUYỆT"
    // Ưu tiên xếp người gửi lâu nhất (RequestDate tăng dần) lên đầu trang để xử lý
    // trước!
    Page<ReturnRequest> findByStatusOrderByRequestDateAsc(ReturnStatus status, Pageable pageable);

    @Query("SELECT CASE WHEN COUNT(i) > 0 THEN true ELSE false END FROM OrderItem i " +
            "WHERE i.id IN :itemIds AND i.returnRequest IS NOT NULL")
    boolean existsByOrderItemIdIn(@Param("itemIds") List<Long> itemIds);

    // Lấy tất cả yêu cầu hoàn trả của 1 khách hàng
    List<ReturnRequest> findByUserIdOrderByRequestDateDesc(Long userId);

    // DASHBOARD
    long countByStatus(ReturnStatus status);
}
