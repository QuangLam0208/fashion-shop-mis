package com.fashion.service.auth;


import com.fashion.dto.request.*;
import com.fashion.dto.response.LoginResponseDTO;
import com.fashion.dto.response.MessageResponseDTO;
import com.fashion.dto.response.RegisterResponseDTO;

public interface AuthService {
    // Đăng ký tài khoản
    RegisterResponseDTO registerNewAccount(RegisterRequestDTO dto);

    // Xác thực email
    void verifyEmail(String token);

    // Gửi lại xác thực
    MessageResponseDTO resendVerificationEmail(ResendVerificationEmailRequestDTO dto);

    // Đăng nhập
    LoginResponseDTO login(LoginRequestDTO dto);

    // Quên mật khẩu
    MessageResponseDTO forgotPassword(ForgotPasswordRequestDTO dto);
    MessageResponseDTO resetPassword(ResetPasswordRequestDTO dto);

    // Đăng xuất
    MessageResponseDTO logout(LogoutRequestDTO dto);

    // Làm mới token
    LoginResponseDTO refreshToken(RefreshTokenRequestDTO dto);
}
