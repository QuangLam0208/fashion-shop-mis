package com.fashion.repository;

import com.fashion.model.UserCoupon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserCouponRepository extends JpaRepository<UserCoupon, Long> {
    // Lấy các mã khách đã thu thập nhưng chưa xài để show lúc Thanh toán
    List<UserCoupon> findByUserIdAndUsedFalse(Long userId);
    
    // Check xem khách đã nhặt mã này vào ví chưa (ngăn thu thập 1 mã 2 lần)
    boolean existsByUserIdAndCouponId(Long userId, Long couponId);
    
    Optional<UserCoupon> findByUserIdAndCouponId(Long userId, Long couponId);

    // Rút thẻ giảm giá ra để đánh dấu thành "Đã sử dụng" khi chốt đơn
    Optional<UserCoupon> findByUserIdAndCouponCode(Long userId, String code);
}
