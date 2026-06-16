package com.fashion.service.coupon;

import com.fashion.dto.request.ApplyCouponRequestDTO;
import com.fashion.dto.request.CollectCouponRequestDTO;
import com.fashion.dto.request.UpdateCouponRequestDTO;
import com.fashion.dto.response.ApplyCouponResponseDTO;
import com.fashion.dto.response.CouponResponseDTO;
import com.fashion.dto.response.MessageResponseDTO;
import com.fashion.exception.BadRequestException;
import com.fashion.exception.ResourceNotFoundException;
import com.fashion.model.Coupon;
import com.fashion.model.User;
import com.fashion.model.UserCoupon;
import com.fashion.model.enums.DiscountType;
import com.fashion.repository.CouponRepository;
import com.fashion.repository.UserCouponRepository;
import com.fashion.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.Collections;
import java.util.List;
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

    @Mock
    private UserRepository userRepository;

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

        validUserCoupon = UserCoupon.builder()
                .used(false)
                .coupon(validCoupon)
                .build();
    }

    // ==========================================
    // UNIT TESTS CHO VOUCHER WALLET (AC-BE-US39-03)
    // ==========================================

    @Test
    void collectCoupon_Success() {
        when(couponRepository.findById(1L)).thenReturn(Optional.of(validCoupon));
        when(userCouponRepository.existsByUserIdAndCouponId(1L, 1L)).thenReturn(false);

        User mockUser = new User();
        mockUser.setId(1L);
        when(userRepository.findById(1L)).thenReturn(Optional.of(mockUser));

        CollectCouponRequestDTO request = new CollectCouponRequestDTO(1L);
        MessageResponseDTO response = couponService.collectCoupon(1L, request);

        assertNotNull(response);
        assertEquals("Thu thập mã giảm giá thành công!", response.getMessage());
    }

    @Test
    void collectCoupon_Duplicate_ThrowsBadRequest() {
        when(couponRepository.findById(1L)).thenReturn(Optional.of(validCoupon));
        when(userCouponRepository.existsByUserIdAndCouponId(1L, 1L)).thenReturn(true);

        CollectCouponRequestDTO request = new CollectCouponRequestDTO(1L);

        BadRequestException ex = assertThrows(BadRequestException.class,
                () -> couponService.collectCoupon(1L, request));
        assertEquals("You have already collected this coupon.", ex.getMessage());
    }

    @Test
    void collectCoupon_ExhaustedLimit_ThrowsBadRequest() {
        validCoupon.setUsedCount(100);
        validCoupon.setUsageLimit(100); // Đã chạm giới hạn

        when(couponRepository.findById(1L)).thenReturn(Optional.of(validCoupon));

        CollectCouponRequestDTO request = new CollectCouponRequestDTO(1L);

        BadRequestException ex = assertThrows(BadRequestException.class,
                () -> couponService.collectCoupon(1L, request));
        assertEquals("Mã giảm giá đã đạt giới hạn thu thập hoặc sử dụng!", ex.getMessage());
    }

    @Test
    void getMyWallet_Success() {
        when(userCouponRepository.findByUserIdAndUsedFalse(1L))
                .thenReturn(Collections.singletonList(validUserCoupon));

        List<CouponResponseDTO> response = couponService.getMyWallet(1L);

        assertNotNull(response);
        assertEquals(1, response.size());
        assertEquals("TESTCODE", response.get(0).getCode());
        assertTrue(response.get(0).isCollected());
        assertFalse(response.get(0).isUsed());
    }

    // ==========================================
    // CÁC TEST CŨ CỦA BẠN
    // ==========================================

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
        updateDto.setCode("NEWCODE");
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

        assertEquals("NEWCODE", response.getCode());
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
      
    @Test
    void createCoupon_Success() {
        com.fashion.dto.request.CreateCouponRequestDTO request = com.fashion.dto.request.CreateCouponRequestDTO.builder()
                .code("NEWCODE")
                .discountValue(20.0)
                .discountType(DiscountType.PERCENTAGE)
                .startDate(Instant.now().plusSeconds(3600))
                .expiryDate(Instant.now().plusSeconds(7200))
                .minOrderAmount(100000.0)
                .usageLimit(50)
                .active(true)
                .build();

        Coupon savedCoupon = Coupon.builder()
                .id(2L).code("NEWCODE").discountValue(20.0)
                .discountType(DiscountType.PERCENTAGE)
                .build();

        when(couponRepository.existsByCode("NEWCODE")).thenReturn(false);
        when(couponRepository.save(any(Coupon.class))).thenReturn(savedCoupon);

        com.fashion.dto.response.CouponResponseDTO response = couponService.createCoupon(request);

        assertNotNull(response);
        assertEquals("NEWCODE", response.getCode());
        assertEquals(20.0, response.getDiscountValue());
    }

    @Test
    void createCoupon_DuplicateCode_ThrowsBadRequest() {
        com.fashion.dto.request.CreateCouponRequestDTO request = com.fashion.dto.request.CreateCouponRequestDTO.builder()
                .code("EXISTINGCODE")
                .build();

        when(couponRepository.existsByCode("EXISTINGCODE")).thenReturn(true);

        BadRequestException ex = assertThrows(BadRequestException.class,
                () -> couponService.createCoupon(request));
        assertEquals("This coupon code already exists in the system!", ex.getMessage());
    }

    @Test
    void createCoupon_InvalidDateRange_ThrowsBadRequest() {
        com.fashion.dto.request.CreateCouponRequestDTO request = com.fashion.dto.request.CreateCouponRequestDTO.builder()
                .code("NEWCODE")
                .startDate(Instant.now().plusSeconds(7200)) // Start later
                .expiryDate(Instant.now().plusSeconds(3600)) // End earlier
                .build();

        when(couponRepository.existsByCode("NEWCODE")).thenReturn(false);

        BadRequestException ex = assertThrows(BadRequestException.class,
                () -> couponService.createCoupon(request));
        assertEquals("Invalid date range: End date must be later than start date", ex.getMessage());
    }

    @Test
    void createCoupon_PercentageExceeds100_ThrowsBadRequest() {
        com.fashion.dto.request.CreateCouponRequestDTO request = com.fashion.dto.request.CreateCouponRequestDTO.builder()
                .code("NEWCODE")
                .discountType(DiscountType.PERCENTAGE)
                .discountValue(150.0) // Invalid percentage
                .startDate(Instant.now().plusSeconds(3600))
                .expiryDate(Instant.now().plusSeconds(7200))
                .build();

        when(couponRepository.existsByCode("NEWCODE")).thenReturn(false);

        BadRequestException ex = assertThrows(BadRequestException.class,
                () -> couponService.createCoupon(request));
        assertEquals("Discount percentage must be between 1 and 100", ex.getMessage());
    }

    @Test
    void createCoupon_PercentageLessThan1_ThrowsBadRequest() {
        com.fashion.dto.request.CreateCouponRequestDTO request = com.fashion.dto.request.CreateCouponRequestDTO.builder()
                .code("NEWCODE")
                .discountType(DiscountType.PERCENTAGE)
                .discountValue(0.5) // Invalid percentage
                .startDate(Instant.now().plusSeconds(3600))
                .expiryDate(Instant.now().plusSeconds(7200))
                .build();

        when(couponRepository.existsByCode("NEWCODE")).thenReturn(false);

        BadRequestException ex = assertThrows(BadRequestException.class,
                () -> couponService.createCoupon(request));
        assertEquals("Discount percentage must be between 1 and 100", ex.getMessage());
    }
}