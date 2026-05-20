package com.fashion.controller.api.admin;

import com.fashion.dto.request.CreateCouponRequestDTO;
import com.fashion.dto.request.UpdateCouponRequestDTO;
import com.fashion.dto.response.CouponResponseDTO;
import com.fashion.dto.response.MessageResponseDTO;
import com.fashion.service.coupon.CouponService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/coupons")
@RequiredArgsConstructor
public class AdminCouponController {
    private final CouponService couponService;

    // XEM TẤT CẢ MÃ
    @GetMapping("/list")
    public ResponseEntity<Page<CouponResponseDTO>> getAllCoupons(
            @RequestParam(required = false) String keyword,
            Pageable pageable) {
        return ResponseEntity.ok(couponService.getAllCoupons(keyword, pageable));
    }

    // XEM CHI TIẾT MÃ
    @GetMapping("/{couponId}")
    public ResponseEntity<CouponResponseDTO> getCouponDetail(
            @PathVariable Long couponId) {
        return ResponseEntity.ok(couponService.getCouponDetail(couponId));
    }

    // TẠO MÃ GIẢM GIÁ
    @PostMapping
    public ResponseEntity<CouponResponseDTO> createCoupon(
            @Valid @RequestBody CreateCouponRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(couponService.createCoupon(dto));
    }

    // CẬP NHẬT MÃ
    @PutMapping("/{couponId}")
    public ResponseEntity<CouponResponseDTO> updateCoupon(
            @PathVariable Long couponId,
            @Valid @RequestBody UpdateCouponRequestDTO dto) {
        return ResponseEntity.ok(couponService.updateCoupon(couponId, dto));
    }

    // BẬT/TẮT MÃ
    @PatchMapping("/{couponId}/toggle-status")
    public ResponseEntity<MessageResponseDTO> toggleCouponStatus(
            @PathVariable Long couponId) {
        return ResponseEntity.ok(couponService.toggleCouponStatus(couponId));
    }
}
