package com.fashion.service.auth;

import com.fashion.dto.request.*;
import com.fashion.dto.response.LoginResponseDTO;
import com.fashion.dto.response.MessageResponseDTO;
import com.fashion.dto.response.RegisterResponseDTO;
import com.fashion.exception.BadRequestException;
import com.fashion.model.PasswordResetToken;
import com.fashion.model.RefreshToken;
import com.fashion.model.Token;
import com.fashion.model.User;
import com.fashion.model.enums.Role;
import com.fashion.model.enums.UserStatus;
import com.fashion.repository.PasswordResetTokenRepository;
import com.fashion.repository.RefreshTokenRepository;
import com.fashion.repository.TokenRepository;
import com.fashion.repository.UserRepository;
import com.fashion.security.JwtTokenProvider;
import com.fashion.service.email_log.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final TokenRepository tokenRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtTokenProvider jwtTokenProvider;

    // ĐĂNG KÝ
    @Override
    public RegisterResponseDTO registerNewAccount(RegisterRequestDTO dto) {
        validateRegisterInfo(dto);

        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new BadRequestException("Email đã được sử dụng!");
        }

        if (userRepository.existsByPhone(dto.getPhone())) {
            throw new BadRequestException("Số điện thoại đã được sử dụng!");
        }

        String encodedPassword = passwordEncoder.encode(dto.getPassword());

        User user = new User();
        user.setEmail(dto.getEmail());
        user.setFullName(capitalizeName(dto.getFullName()));
        user.setPhone(dto.getPhone());
        user.setPassword(encodedPassword);
        user.setStatus(UserStatus.PENDING);
        user.setRole(Role.CUSTOMER);

        String token = createVerificationToken(user);

        user = userRepository.save(user);

        String message = "Đăng ký thành công. Vui lòng kiểm tra email để xác thực.";
        try {
            emailService.sendVerificationEmail(user.getEmail(), token);
        } catch (Exception e) {
            message = "Đăng ký thành công nhưng hệ thống gặp lỗi khi gửi email xác thực. Vui lòng sử dụng tính năng 'Gửi lại mã' sau.";
        }

        return RegisterResponseDTO.builder()
                .userId(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .status(user.getStatus())
                .message(message)
                .build();
    }

    @Override
    public void verifyEmail(String token) {
        Optional<User> optionalUser = userRepository.findByVerificationToken(token);

        if (optionalUser.isEmpty()) {
            throw new BadRequestException("Token xác thực không hợp lệ!");
        }

        User user = optionalUser.get();
        if (user.getVerificationTokenExpiryDate().isBefore(Instant.now())) {
            throw new BadRequestException("Token xác thực đã hết hạn!");
        }

        if (user.getPendingEmail() != null) {
            user.setEmail(user.getPendingEmail());
            user.setPendingEmail(null);
        }

        // Cập nhật trạng thái người dùng
        user.setEmailVerified(true);
        user.setStatus(UserStatus.ACTIVE);
        user.setVerificationToken(null);
        user.setVerificationTokenExpiryDate(null);
        userRepository.save(user);

    }

    @Override
    public MessageResponseDTO resendVerificationEmail(ResendVerificationEmailRequestDTO dto) {
        Optional<User> optionalUser = userRepository.findByEmail(dto.getEmail());

        if (optionalUser.isEmpty()) {
            throw new BadRequestException("Không tìm thấy người dùng!");
        }

        User user = optionalUser.get();
        if (user.getStatus() == UserStatus.ACTIVE) {
            throw new BadRequestException("Tài khoản đã được xác thực trước đó!");
        }

        String newToken = createVerificationToken(user);
        userRepository.save(user);
        emailService.sendVerificationEmail(user.getEmail(), newToken);

        return MessageResponseDTO.builder()
                .message("Email xác thực đã được gửi lại thành công!")
                .build();
    }

    // ĐĂNG NHẬP
    @Override
    public LoginResponseDTO login(LoginRequestDTO dto) {
        if (dto.getEmail() == null || dto.getEmail().isBlank() ||
                dto.getPassword() == null || dto.getPassword().isBlank()) {
            throw new BadRequestException("Vui lòng nhập đầy đủ thông tin!");
        }

        User user = userRepository.findByEmail(dto.getEmail())
                .orElseThrow(() -> new BadRequestException("Tên đăng nhập không tồn tại!"));

        if (!passwordEncoder.matches(dto.getPassword(), user.getPassword())) {
            throw new BadRequestException("Mật khẩu không chính xác!");
        }

        if (user.getStatus() == UserStatus.PENDING) {
            throw new BadRequestException("Tài khoản chưa được xác thực email!");
        }
        if (user.getStatus() == UserStatus.BLOCKED) {
            throw new BadRequestException("Tài khoản đã bị khóa!");
        }

        // Vô hiệu hóa token cũ
        List<Token> validTokens = tokenRepository.findAllValidTokensByUser(user.getId());
        validTokens.forEach(t -> {
            t.setExpired(true);
            t.setRevoked(true);
        });
        tokenRepository.saveAll(validTokens);

        // Tạo JWT access token & refresh token
        String accessToken = jwtTokenProvider.generateAccessToken(user);
        String refreshToken = jwtTokenProvider.generateRefreshToken(user);

        Token newToken = Token.builder()
                .user(user)
                .token(accessToken)
                .expired(false)
                .revoked(false)
                .build();
        tokenRepository.save(newToken);

        RefreshToken newRefreshToken = RefreshToken.builder()
                .user(user)
                .token(refreshToken)
                .expiryDate(Instant.now().plus(7, ChronoUnit.DAYS))
                .revoked(false)
                .build();
        refreshTokenRepository.save(newRefreshToken);

        return LoginResponseDTO.builder()
                .userId(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole())
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .build();
    }

    // QUÊN MẬT KHẨU
    @Override
    @Transactional
    public MessageResponseDTO forgotPassword(ForgotPasswordRequestDTO dto) {
        User user = userRepository.findByEmail(dto.getEmail())
                .orElseThrow(() -> new BadRequestException("Email không tồn tại!"));

        String resetToken = UUID.randomUUID().toString();

        PasswordResetToken passwordResetToken = PasswordResetToken.builder()
                .user(user)
                .token(resetToken)
                .expiryDate(new Date(System.currentTimeMillis() + 30 * 60 * 1000)) // 30 phút
                .used(false)
                .build();
        passwordResetTokenRepository.save(passwordResetToken);

        // Đã sửa lại Port thành 3000 (ReactJS)
        String resetLink = "http://localhost:3000/reset-password?token=" + resetToken;
        emailService.sendResetPasswordEmail(user.getEmail(), resetToken);

        return MessageResponseDTO.builder()
                .message("Liên kết khôi phục mật khẩu đã được gửi đến email của bạn.")
                .build();
    }

    @Override
    @Transactional
    public MessageResponseDTO resetPassword(ResetPasswordRequestDTO dto) {
        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(dto.getToken())
                .orElseThrow(() -> new BadRequestException("Token khôi phục không hợp lệ!"));

        if (resetToken.isUsed()) {
            throw new BadRequestException("Token khôi phục đã được sử dụng!");
        }

        if (resetToken.getExpiryDate().before(new Date())) {
            throw new BadRequestException("Token khôi phục đã hết hạn!");
        }

        if (!dto.getNewPassword().equals(dto.getConfirmPassword())) {
            throw new BadRequestException("Mật khẩu xác nhận không khớp!");
        }

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(dto.getNewPassword()));
        userRepository.save(user);

        resetToken.setUsed(true);
        passwordResetTokenRepository.save(resetToken);

        return MessageResponseDTO.builder()
                .message("Đổi mật khẩu thành công!")
                .build();
    }

    // ĐĂNG XUẤT
    @Override
    public MessageResponseDTO logout(LogoutRequestDTO dto) {
        Token token = tokenRepository.findByToken(dto.getToken())
                .orElseThrow(() -> new BadRequestException("Token không hợp lệ!"));

        token.setExpired(true);
        token.setRevoked(true);
        tokenRepository.save(token);

        return MessageResponseDTO.builder()
                .message("Đăng xuất thành công!")
                .build();
    }

    // LÀM MỚI TOKEN
    @Override
    @Transactional
    public LoginResponseDTO refreshToken(RefreshTokenRequestDTO dto) {
        RefreshToken refreshToken = refreshTokenRepository.findByToken(dto.getRefreshToken())
                .orElseThrow(() -> new BadRequestException("Refresh token không hợp lệ!"));

        if (refreshToken.isRevoked()) {
            throw new BadRequestException("Refresh token đã bị thu hồi!");
        }

        if (refreshToken.getExpiryDate().isBefore(Instant.now())) {
            throw new BadRequestException("Refresh token đã hết hạn! Vui lòng đăng nhập lại.");
        }

        User user = refreshToken.getUser();

        refreshToken.setRevoked(true);
        refreshTokenRepository.save(refreshToken);

        List<Token> validTokens = tokenRepository.findAllValidTokensByUser(user.getId());
        validTokens.forEach(t -> {
            t.setExpired(true);
            t.setRevoked(true);
        });
        tokenRepository.saveAll(validTokens);

        // Tạo lại bộ token mới (Đã sửa lỗi duplicate biến)
        String newAccessToken = jwtTokenProvider.generateAccessToken(user);
        String newRefreshTokenStr = jwtTokenProvider.generateRefreshToken(user);

        Token newToken = Token.builder()
                .user(user)
                .token(newAccessToken)
                .expired(false)
                .revoked(false)
                .build();
        tokenRepository.save(newToken);

        RefreshToken newRefreshToken = RefreshToken.builder()
                .user(user)
                .token(newRefreshTokenStr)
                .expiryDate(Instant.now().plus(7, ChronoUnit.DAYS))
                .revoked(false)
                .build();
        refreshTokenRepository.save(newRefreshToken);

        return LoginResponseDTO.builder()
                .userId(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole())
                .accessToken(newAccessToken)
                .refreshToken(newRefreshTokenStr)
                .build();
    }

    // ================== PRIVATE HELPERS ==================
    private void validateRegisterInfo(RegisterRequestDTO dto) {
        if (!dto.getPassword().equals(dto.getConfirmPassword())) {
            throw new BadRequestException("Mật khẩu xác nhận không khớp!");
        }
    }

    private String createVerificationToken(User user) {
        String token = UUID.randomUUID().toString();
        user.setVerificationToken(token);
        user.setVerificationTokenExpiryDate(Instant.now().plus(24, ChronoUnit.HOURS));
        return token;
    }

    private String capitalizeName(String name) {
        if (name == null || name.isBlank()) return "";
        String[] words = name.toLowerCase().split("\\s+");
        StringBuilder sb = new StringBuilder();
        for (String word : words) {
            if (!word.isEmpty()) {
                sb.append(Character.toUpperCase(word.charAt(0)))
                        .append(word.substring(1).toLowerCase())
                        .append(" ");
            }
        }
        return sb.toString().trim();
    }
}