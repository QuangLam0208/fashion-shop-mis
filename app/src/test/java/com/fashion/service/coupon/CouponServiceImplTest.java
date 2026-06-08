package com.fashion.service.coupon;

import com.fashion.dto.request.ApplyCouponRequestDTO;
import com.fashion.dto.response.ApplyCouponResponseDTO;
import com.fashion.exception.BadRequestException;
import com.fashion.model.Coupon;
import com.fashion.model.UserCoupon;
import com.fashion.model.enums.DiscountType;
import com.fashion.repository.CouponRepository;
import com.fashion.repository.UserCouponRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class CouponServiceImplTest {

    @Mock
    private CouponRepository couponRepository;

    @Mock
    private UserCouponRepository userCouponRepository;

    @InjectMocks
    private CouponServiceImpl couponService;

    private Coupon validCoupon;
    private UserCoupon validUserCoupon;

    @BeforeEach
    void setUp() {
        validCoupon = Coupon.builder()
                .id(1L).code("TESTCODE").active(true)
                .expiryDate(Instant.now().plusSeconds(3600))
                .minOrderAmount(200000.0).usageLimit(100).usedCount(0)
                .build();

        validUserCoupon = UserCoupon.builder().used(false).build();
    }

    @Test
    void applyCoupon_PercentageDiscount_Success() {
        validCoupon.setDiscountType(DiscountType.PERCENTAGE);
        validCoupon.setDiscountValue(10.0); // Giảm 10%

        when(couponRepository.findByCodeAndActiveTrueAndExpiryDateAfter(eq("TESTCODE"), any()))
                .thenReturn(Optional.of(validCoupon));
        when(userCouponRepository.findByUserIdAndCouponCode(1L, "TESTCODE"))
                .thenReturn(Optional.of(validUserCoupon));

        ApplyCouponRequestDTO request = new ApplyCouponRequestDTO("TESTCODE");
        ApplyCouponResponseDTO response = couponService.applyCoupon(1L, request, 300000.0);

        assertEquals(30000.0, response.getDiscountAmount());
        assertEquals(270000.0, response.getNewTotalAmount());
    }

    @Test
    void applyCoupon_FixedAmountDiscount_Success() {
        validCoupon.setDiscountType(DiscountType.FIXED_AMOUNT);
        validCoupon.setDiscountValue(50000.0); // Giảm thẳng 50k

        when(couponRepository.findByCodeAndActiveTrueAndExpiryDateAfter(eq("TESTCODE"), any()))
                .thenReturn(Optional.of(validCoupon));
        when(userCouponRepository.findByUserIdAndCouponCode(1L, "TESTCODE"))
                .thenReturn(Optional.of(validUserCoupon));

        ApplyCouponRequestDTO request = new ApplyCouponRequestDTO("TESTCODE");
        ApplyCouponResponseDTO response = couponService.applyCoupon(1L, request, 300000.0);

        assertEquals(50000.0, response.getDiscountAmount());
        assertEquals(250000.0, response.getNewTotalAmount());
    }

    @Test
    void applyCoupon_OutOfUsageCount_ThrowsBadRequest() {
        validCoupon.setUsedCount(100); // Đã bằng usageLimit

        when(couponRepository.findByCodeAndActiveTrueAndExpiryDateAfter(eq("TESTCODE"), any()))
                .thenReturn(Optional.of(validCoupon));

        ApplyCouponRequestDTO request = new ApplyCouponRequestDTO("TESTCODE");

        BadRequestException ex = assertThrows(BadRequestException.class,
                () -> couponService.applyCoupon(1L, request, 300000.0));
        assertEquals("Mã giảm giá này đã hết lượt sử dụng!", ex.getMessage());
    }

    @Test
    void applyCoupon_MinOrderConditionNotMet_ThrowsBadRequest() {
        when(couponRepository.findByCodeAndActiveTrueAndExpiryDateAfter(eq("TESTCODE"), any()))
                .thenReturn(Optional.of(validCoupon));

        ApplyCouponRequestDTO request = new ApplyCouponRequestDTO("TESTCODE");

        // Đơn 150k trong khi yêu cầu min 200k
        BadRequestException ex = assertThrows(BadRequestException.class,
                () -> couponService.applyCoupon(1L, request, 150000.0));
        assertTrue(ex.getMessage().contains("chưa đạt giá trị tối thiểu"));
    }
}