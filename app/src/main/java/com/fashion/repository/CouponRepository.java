package com.fashion.repository;

import com.fashion.model.Coupon;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public interface CouponRepository extends JpaRepository<Coupon, Long> {
    // In ra các Khuyến mãi đang mở trên trang chủ
    List<Coupon> findByActiveTrue();

    // Check mã khách nhập có tồn tại và đang mở không
    Optional<Coupon> findByCodeAndActiveTrue(String code);

    // Áp dụng mã: Mã đang hiệu lực VÀ chưa qua ngày hết hạn
    Optional<Coupon> findByCodeAndActiveTrueAndExpiryDateAfter(String code, Instant currentDate);

    @Query("SELECT c FROM Coupon c WHERE " +
            "(:keyword IS NULL OR LOWER(c.code) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Coupon> findAllForAdmin(String keyword, Pageable pageable);

    boolean existsByCode(String code);
}
