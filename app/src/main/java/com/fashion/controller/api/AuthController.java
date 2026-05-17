package com.fashion.controller.api;

import com.fashion.dto.request.*;
import com.fashion.dto.response.LoginResponseDTO;
import com.fashion.dto.response.MessageResponseDTO;
import com.fashion.dto.response.RegisterResponseDTO;
import com.fashion.service.auth.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    // ĐĂNG KÝ
    @PostMapping("/register")
    public ResponseEntity<RegisterResponseDTO> register(
            @Valid @RequestBody RegisterRequestDTO dto
    ) {

        RegisterResponseDTO response = authService.registerNewAccount(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // ĐĂNG NHẬP
    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login (
            @Valid @RequestBody LoginRequestDTO dto
    ) {

        LoginResponseDTO response = authService.login(dto);
        return ResponseEntity.status(HttpStatus.OK).body(response);
    }

    // ĐĂNG XUẤT
    @PostMapping("/logout")
    public ResponseEntity<MessageResponseDTO> logout (
            @Valid @RequestBody LogoutRequestDTO dto
    ) {

        MessageResponseDTO response = authService.logout(dto);
        return ResponseEntity.status(HttpStatus.OK).body(response);
    }

    // XÁC THỰC EMAIL
    // XÁC THỰC EMAIL (Thuần JSON cho Frontend gọi)
    @GetMapping("/verify-email")
    public ResponseEntity<MessageResponseDTO> verifyEmail(@RequestParam String token) {
        authService.verifyEmail(token);
        return ResponseEntity.status(HttpStatus.OK).body(
                MessageResponseDTO.builder()
                        .message("Xác thực tài khoản thành công!")
                        .build()
        );
    }

    // GỬI LẠI EMAIL XÁC THỰC
    @PostMapping("/resend-verification")
    public ResponseEntity<MessageResponseDTO> resendVerification (
            @Valid @RequestBody ResendVerificationEmailRequestDTO dto
    ) {
        MessageResponseDTO response = authService.resendVerificationEmail(dto);
        return ResponseEntity.status(HttpStatus.OK).body(response);
    }

    // QUÊN MẬT KHẨU
    @PostMapping("/forgot-password")
    public ResponseEntity<MessageResponseDTO> forgotPassword (
            @Valid @RequestBody ForgotPasswordRequestDTO dto
    ) {

        MessageResponseDTO response = authService.forgotPassword(dto);
        return ResponseEntity.status(HttpStatus.OK).body(response);
    }

    // ĐẶT LẠI MẬT KHẨU
    @PostMapping("/reset-password")
    public ResponseEntity<MessageResponseDTO> resetPassword(@Valid @RequestBody ResetPasswordRequestDTO dto) {
        authService.resetPassword(dto);

        return ResponseEntity.ok(new MessageResponseDTO("Đặt lại mật khẩu mới thành công!"));
    }

    // LÀM MỚI TOKEN
    @PostMapping("/refresh-token")
    public ResponseEntity<LoginResponseDTO> refreshToken (
            @Valid @RequestBody RefreshTokenRequestDTO dto
    ) {
        LoginResponseDTO response = authService.refreshToken(dto);
        return ResponseEntity.status(HttpStatus.OK).body(response);
    }
}
