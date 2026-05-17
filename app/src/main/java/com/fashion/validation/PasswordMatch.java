package com.fashion.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.*;

@Documented
@Constraint(validatedBy = PasswordMatchValidator.class)
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
public @interface PasswordMatch {
    String message() default "Mật khẩu xác nhận không khớp";
    String passwordField();
    String confirmPasswordField();
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}
