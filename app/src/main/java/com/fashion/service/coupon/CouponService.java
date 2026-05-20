package com.fashion.service.coupon;

import com.fashion.dto.request.CollectCouponRequestDTO;
import com.fashion.dto.request.ApplyCouponRequestDTO;
import com.fashion.dto.request.CreateCouponRequestDTO;
import com.fashion.dto.request.UpdateCouponRequestDTO;
import com.fashion.dto.response.ApplyCouponResponseDTO;
import com.fashion.dto.response.CouponResponseDTO;
import com.fashion.dto.response.MessageResponseDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface CouponService {
    // Xem danh sách mã giảm giá đang có
    List<CouponResponseDTO> getAvailableCoupons(Long userId);

    // Thu thập mã giảm giá
    MessageResponseDTO collectCoupon(Long userId, CollectCouponRequestDTO dto);

    // Áp dụng mã giảm giá cho đơn hàng
    ApplyCouponResponseDTO applyCoupon(Long userId, ApplyCouponRequestDTO dto, Double currentTotal);

    // Admin
    Page<CouponResponseDTO> getAllCoupons(String keyword, Pageable pageable);

    CouponResponseDTO getCouponDetail(Long couponId);

    CouponResponseDTO createCoupon(CreateCouponRequestDTO dto);

    CouponResponseDTO updateCoupon(Long couponId, UpdateCouponRequestDTO dto);

    MessageResponseDTO toggleCouponStatus(Long couponId);
}
