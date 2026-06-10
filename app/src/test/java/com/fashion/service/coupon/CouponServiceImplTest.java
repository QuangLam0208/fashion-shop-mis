package com.fashion.service.coupon;

import com.fashion.dto.request.ApplyCouponRequestDTO;
import com.fashion.dto.request.UpdateCouponRequestDTO;
import com.fashion.dto.response.ApplyCouponResponseDTO;
import com.fashion.dto.response.CouponResponseDTO;
import com.fashion.dto.response.MessageResponseDTO;
import com.fashion.exception.BadRequestException;
import com.fashion.exception.ResourceNotFoundException;
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

    @Test
    void updateCoupon_Success() {
        UpdateCouponRequestDTO updateDto = new UpdateCouponRequestDTO();
        updateDto.setCode("NEWCODE"); // This will now update the code
        updateDto.setDiscountValue(15.0);
        updateDto.setDiscountType(DiscountType.FIXED_AMOUNT);
        updateDto.setStartDate(Instant.now().plusSeconds(60));
        updateDto.setExpiryDate(Instant.now().plusSeconds(3600 * 2));
        updateDto.setMinOrderAmount(300000.0);
        updateDto.setUsageLimit(200);
        updateDto.setActive(false);

        when(couponRepository.findById(1L)).thenReturn(Optional.of(validCoupon));
        when(couponRepository.existsByCode("NEWCODE")).thenReturn(false);
        when(couponRepository.save(any(Coupon.class))).thenAnswer(invocation -> invocation.getArgument(0));

        CouponResponseDTO response = couponService.updateCoupon(1L, updateDto);

        assertEquals("NEWCODE", response.getCode()); // Code is now updated
        assertEquals(15.0, response.getDiscountValue());
        assertEquals(DiscountType.FIXED_AMOUNT, response.getDiscountType());
        assertEquals(updateDto.getStartDate(), response.getStartDate());
        assertEquals(updateDto.getExpiryDate(), response.getExpiryDate());
        assertEquals(300000.0, response.getMinOrderAmount());
        assertEquals(200, response.getUsageLimit());
        assertFalse(response.isActive());
    }

    @Test
    void updateCoupon_NotFound() {
        UpdateCouponRequestDTO updateDto = new UpdateCouponRequestDTO();
        when(couponRepository.findById(99L)).thenReturn(Optional.empty());

        ResourceNotFoundException ex = assertThrows(ResourceNotFoundException.class,
                () -> couponService.updateCoupon(99L, updateDto));
        assertEquals("Mã giảm giá không tồn tại!", ex.getMessage());
    }

    @Test
    void toggleCouponStatus_Success() {
        when(couponRepository.findById(1L)).thenReturn(Optional.of(validCoupon));
        when(couponRepository.save(any(Coupon.class))).thenAnswer(invocation -> invocation.getArgument(0));

        boolean initialStatus = validCoupon.isActive();

        MessageResponseDTO response = couponService.toggleCouponStatus(1L);

        assertNotEquals(initialStatus, validCoupon.isActive());
        assertTrue(response.getMessage().contains("ngừng sử dụng") || response.getMessage().contains("kích hoạt"));
    }

    @Test
    void toggleCouponStatus_NotFound() {
        when(couponRepository.findById(99L)).thenReturn(Optional.empty());

        ResourceNotFoundException ex = assertThrows(ResourceNotFoundException.class,
                () -> couponService.toggleCouponStatus(99L));
        assertEquals("Mã giảm giá không tồn tại!", ex.getMessage());
    }
}