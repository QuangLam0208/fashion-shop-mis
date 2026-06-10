package com.fashion.dto.request;

import com.fashion.model.enums.DiscountType;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class CreateCouponRequestDTOTest {

    private static Validator validator;

    @BeforeAll
    static void setUp() {
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    private CreateCouponRequestDTO.CreateCouponRequestDTOBuilder getValidDTOBuilder() {
        return CreateCouponRequestDTO.builder()
                .code("VALIDCODE")
                .discountValue(50000.0)
                .discountType(DiscountType.FIXED_AMOUNT)
                .startDate(Instant.now().plusSeconds(3600))
                .expiryDate(Instant.now().plusSeconds(86400))
                .minOrderAmount(200000.0)
                .usageLimit(100)
                .active(true);
    }

    @Test
    void whenAllFieldsValid_thenNoViolations() {
        CreateCouponRequestDTO dto = getValidDTOBuilder().build();
        Set<ConstraintViolation<CreateCouponRequestDTO>> violations = validator.validate(dto);
        assertTrue(violations.isEmpty(), "Expected no validation errors");
    }

    @Test
    void whenDiscountValueIsNegative_thenValidationFails() {
        CreateCouponRequestDTO dto = getValidDTOBuilder().discountValue(-10.0).build();
        Set<ConstraintViolation<CreateCouponRequestDTO>> violations = validator.validate(dto);
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("discountValue")));
    }

    @Test
    void whenMinOrderAmountIsNegative_thenValidationFails() {
        CreateCouponRequestDTO dto = getValidDTOBuilder().minOrderAmount(-1.0).build();
        Set<ConstraintViolation<CreateCouponRequestDTO>> violations = validator.validate(dto);
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("minOrderAmount")));
    }

    @Test
    void whenUsageLimitIsZeroOrNegative_thenValidationFails() {
        CreateCouponRequestDTO dto0 = getValidDTOBuilder().usageLimit(0).build();
        Set<ConstraintViolation<CreateCouponRequestDTO>> violations0 = validator.validate(dto0);
        assertFalse(violations0.isEmpty());

        CreateCouponRequestDTO dtoNegative = getValidDTOBuilder().usageLimit(-5).build();
        Set<ConstraintViolation<CreateCouponRequestDTO>> violationsNegative = validator.validate(dtoNegative);
        assertFalse(violationsNegative.isEmpty());
    }

    @Test
    void whenExpiryDateIsInPast_thenValidationFails() {
        CreateCouponRequestDTO dto = getValidDTOBuilder().expiryDate(Instant.now().minusSeconds(3600)).build();
        Set<ConstraintViolation<CreateCouponRequestDTO>> violations = validator.validate(dto);
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream().anyMatch(v -> v.getPropertyPath().toString().equals("expiryDate")));
    }
}
