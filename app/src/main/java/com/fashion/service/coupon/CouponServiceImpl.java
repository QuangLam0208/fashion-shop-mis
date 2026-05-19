package com.fashion.service.coupon;

import com.fashion.dto.request.ApplyCouponRequestDTO;
import com.fashion.dto.request.CollectCouponRequestDTO;
import com.fashion.dto.request.CreateCouponRequestDTO;
import com.fashion.dto.request.UpdateCouponRequestDTO;
import com.fashion.dto.response.ApplyCouponResponseDTO;
import com.fashion.dto.response.CouponResponseDTO;
import com.fashion.dto.response.MessageResponseDTO;
import com.fashion.model.Coupon;
import com.fashion.model.User;
import com.fashion.model.UserCoupon;
import com.fashion.model.enums.DiscountType;
import com.fashion.repository.CouponRepository;
import com.fashion.repository.UserCouponRepository;
import com.fashion.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CouponServiceImpl implements CouponService{

    private final CouponRepository couponRepository;
    private final UserCouponRepository userCouponRepository;
    private final UserRepository userRepository;

    // Xem danh sách mã giảm giá đang có
    @Override
    public List<CouponResponseDTO> getAvailableCoupons(Long userId) {
        List<Coupon> allActiveCoupons = couponRepository.findByActiveTrue();

        return allActiveCoupons.stream()
                .map(coupon -> {
                    var userCouponOpt = userCouponRepository.findByUserIdAndCouponId(userId, coupon.getId());
                    return CouponResponseDTO.builder()
                            .couponId(coupon.getId())
                            .code(coupon.getCode())
                            .discountValue(coupon.getDiscountValue())
                            .discountType(coupon.getDiscountType())
                            .startDate(coupon.getStartDate())
                            .expiryDate(coupon.getExpiryDate())
                            .minOrderAmount(coupon.getMinOrderAmount())
                            .collected(userCouponOpt.isPresent())
                            .used(userCouponOpt.map(UserCoupon::isUsed).orElse(false))
                            .build();
                })
                .toList();
    }

    // Thu thập mã giảm giá
    @Override
    @Transactional
    public MessageResponseDTO collectCoupon(Long userId, CollectCouponRequestDTO dto) {
        Coupon coupon = couponRepository.findById(dto.getCouponId())
                .orElseThrow(() -> new RuntimeException("Mã giảm giá không tồn tại!"));

        // Mã giảm giá không hợp lệ hoặc đã hết hạn
        if (!coupon.isActive()) {
            throw new RuntimeException("Mã giảm giá không còn hiệu lực!");
        }

        if (coupon.getExpiryDate().isBefore(Instant.now())) {
            throw new RuntimeException("Mã giảm giá đã hết hạn!");
        }

        // Mã giảm giá đã được thu thập trước đó
        if (userCouponRepository.existsByUserIdAndCouponId(userId, coupon.getId())) {
            throw new RuntimeException("Bạn đã thu thập mã giảm giá này trước đó!");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại!"));

        UserCoupon userCoupon = UserCoupon.builder()
                .user(user)
                .coupon(coupon)
                .used(false)
                .build();
        userCouponRepository.save(userCoupon);

        return MessageResponseDTO.builder()
                .message("Thu thập mã giảm giá thành công!")
                .build();
    }

    // Áp dụng mã giảm giá cho đơn hàng
    @Override
    public ApplyCouponResponseDTO applyCoupon(Long userId, ApplyCouponRequestDTO dto, Double currentTotal) {
        // Mã giảm giá không hợp lệ
        Coupon coupon = couponRepository.findByCodeAndActiveTrueAndExpiryDateAfter(
                        dto.getCouponCode(), Instant.now())
                .orElseThrow(() -> new RuntimeException("Mã giảm giá không hợp lệ hoặc đã hết hạn!"));

        // Mã giảm giá không thỏa điều kiện sử dụng
        if (coupon.getMinOrderAmount() != null && currentTotal < coupon.getMinOrderAmount()) {
            throw new RuntimeException("Đơn hàng chưa đạt giá trị tối thiểu " + coupon.getMinOrderAmount() + "đ để sử dụng mã này!");
        }

        // Mã giảm giá đã được sử dụng hoặc vượt quá số lượt
        UserCoupon userCoupon = userCouponRepository.findByUserIdAndCouponCode(userId, dto.getCouponCode())
                .orElseThrow(() -> new RuntimeException("Bạn chưa thu thập mã giảm giá này!"));

        if (userCoupon.isUsed()) {
            throw new RuntimeException("Mã giảm giá đã được sử dụng!");
        }

        // Tính toán giảm giá
        double discountAmount;
        if (coupon.getDiscountType() == DiscountType.PERCENTAGE) {
            discountAmount = currentTotal * (coupon.getDiscountValue() / 100.0);
        } else {
            discountAmount = coupon.getDiscountValue();
        }

        double newTotal = Math.max(0, currentTotal - discountAmount);

        return ApplyCouponResponseDTO.builder()
                .couponCode(coupon.getCode())
                .discountValue(coupon.getDiscountValue()) // Original (e.g. 10 for 10%)
                .discountAmount(discountAmount) // Calculated (e.g. 36000)
                .discountType(coupon.getDiscountType())
                .newTotalAmount(newTotal)
                .message("Áp dụng mã giảm giá thành công! Giảm " + discountAmount + "đ")
                .build();
    }

    // ADMIN API
    @Override
    public Page<CouponResponseDTO> getAllCoupons(String keyword, Pageable pageable) {
        return couponRepository.findAllForAdmin(keyword, pageable).map(this::mapToDTO);
    }

    @Override
    public CouponResponseDTO getCouponDetail(Long couponId) {
        Coupon coupon = couponRepository.findById(couponId)
                .orElseThrow(() -> new RuntimeException("Mã giảm giá không tồn tại!"));
        return mapToDTO(coupon);
    }

    @Override
    @Transactional
    public CouponResponseDTO createCoupon(CreateCouponRequestDTO dto) {
        if (couponRepository.existsByCode(dto.getCode())) {
            throw new RuntimeException("Mã CODE đã tồn tại!");
        }

        Coupon coupon = Coupon.builder()
                .code(dto.getCode())
                .discountValue(dto.getDiscountValue())
                .discountType(dto.getDiscountType())
                .startDate(dto.getStartDate())
                .expiryDate(dto.getExpiryDate())
                .minOrderAmount(dto.getMinOrderAmount())
                .usageLimit(dto.getUsageLimit())
                .active(dto.isActive())
                .build();

        return mapToDTO(couponRepository.save(coupon));
    }

    @Override
    @Transactional
    public CouponResponseDTO updateCoupon(Long couponId, UpdateCouponRequestDTO dto) {
        Coupon coupon = couponRepository.findById(couponId)
                .orElseThrow(() -> new RuntimeException("Mã giảm giá không tồn tại!"));

        if (dto.getCode() != null && !dto.getCode().equals(coupon.getCode())
                && couponRepository.existsByCode(dto.getCode())) {
            throw new RuntimeException("Mã CODE cập nhật đã tồn tại!");
        }

        if (dto.getCode() != null) coupon.setCode(dto.getCode());
        if (dto.getDiscountValue() != null) coupon.setDiscountValue(dto.getDiscountValue());
        if (dto.getDiscountType() != null) coupon.setDiscountType(dto.getDiscountType());
        if (dto.getStartDate() != null) coupon.setStartDate(dto.getStartDate());
        if (dto.getExpiryDate() != null) coupon.setExpiryDate(dto.getExpiryDate());
        if (dto.getMinOrderAmount() != null) coupon.setMinOrderAmount(dto.getMinOrderAmount());
        if (dto.getUsageLimit() != null) coupon.setUsageLimit(dto.getUsageLimit());
        coupon.setActive(dto.isActive());

        return mapToDTO(couponRepository.save(coupon));
    }

    @Override
    @Transactional
    public MessageResponseDTO toggleCouponStatus(Long couponId) {
        Coupon coupon = couponRepository.findById(couponId)
                .orElseThrow(() -> new RuntimeException("Mã giảm giá không tồn tại!"));

        coupon.setActive(!coupon.isActive());
        couponRepository.save(coupon);

        return MessageResponseDTO.builder()
                .message("Đã " + (coupon.isActive() ? "kích hoạt" : "ngừng sử dụng") + " mã giảm giá!")
                .build();
    }

    private CouponResponseDTO mapToDTO(Coupon coupon) {
        return CouponResponseDTO.builder()
                .couponId(coupon.getId())
                .code(coupon.getCode())
                .discountValue(coupon.getDiscountValue())
                .discountType(coupon.getDiscountType())
                .startDate(coupon.getStartDate())
                .expiryDate(coupon.getExpiryDate())
                .minOrderAmount(coupon.getMinOrderAmount())
                .usageLimit(coupon.getUsageLimit())
                .active(coupon.isActive())
                .collected(false)
                .build();
    }
}
