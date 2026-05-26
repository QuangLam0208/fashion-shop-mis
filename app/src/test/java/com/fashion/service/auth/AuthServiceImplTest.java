package com.fashion.service.auth;

import com.fashion.dto.request.LoginRequestDTO;
import com.fashion.dto.request.LogoutRequestDTO;
import com.fashion.dto.request.RegisterRequestDTO;
import com.fashion.dto.request.ResendVerificationEmailRequestDTO;
import com.fashion.dto.response.LoginResponseDTO;
import com.fashion.dto.response.MessageResponseDTO;
import com.fashion.dto.response.RegisterResponseDTO;
import com.fashion.exception.BadRequestException;
import com.fashion.model.RefreshToken;
import com.fashion.model.Token;
import com.fashion.model.User;
import com.fashion.model.enums.Role;
import com.fashion.model.enums.UserStatus;
import com.fashion.repository.RefreshTokenRepository;
import com.fashion.repository.TokenRepository;
import com.fashion.repository.UserRepository;
import com.fashion.security.JwtTokenProvider;
import com.fashion.service.email_log.EmailService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AuthServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private EmailService emailService;

    @InjectMocks
    private AuthServiceImpl authService;

    @Mock
    private TokenRepository tokenRepository;

    @Mock
    private RefreshTokenRepository refreshTokenRepository;

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    private RegisterRequestDTO validRegisterDto;

    @BeforeEach
    void setUp() {
        // Chuẩn bị dữ liệu chuẩn trước mỗi test
        validRegisterDto = RegisterRequestDTO.builder()
                .fullName("nguyen van a")
                .email("test@example.com")
                .phone("0987654321")
                .password("password123")
                .confirmPassword("password123")
                .build();
    }

    // =========================================================================
    // TEST CASES CHO USER STORY 01: REGISTER ACCOUNT
    // =========================================================================

    @Test
    void testRegisterNewAccount_Success() throws Exception {
        // Arrange
        when(userRepository.existsByEmail(validRegisterDto.getEmail())).thenReturn(false);
        when(userRepository.existsByPhone(validRegisterDto.getPhone())).thenReturn(false);
        when(passwordEncoder.encode(validRegisterDto.getPassword())).thenReturn("encodedPassword123");

        User savedUser = new User();
        savedUser.setId(1L);
        savedUser.setFullName("Nguyen Van A"); // Đã được format hoa chữ cái đầu
        savedUser.setEmail(validRegisterDto.getEmail());
        savedUser.setStatus(UserStatus.PENDING);

        when(userRepository.save(any(User.class))).thenReturn(savedUser);

        // Act
        RegisterResponseDTO response = authService.registerNewAccount(validRegisterDto);

        // Assert
        assertNotNull(response);
        assertEquals(1L, response.getUserId());
        assertEquals("Nguyen Van A", response.getFullName());
        assertEquals(UserStatus.PENDING, response.getStatus());
        assertEquals("Đăng ký thành công. Vui lòng kiểm tra email để xác thực.", response.getMessage());

        // Verify (Kiểm tra xem các mock object có được gọi đúng số lần không)
        verify(userRepository, times(1)).save(any(User.class));
        verify(emailService, times(1)).sendVerificationEmail(eq(validRegisterDto.getEmail()), anyString());
    }

    @Test
    void testRegisterNewAccount_PasswordMismatch_ThrowsBadRequestException() {
        // Arrange
        validRegisterDto.setConfirmPassword("differentPassword");

        // Act & Assert
        BadRequestException exception = assertThrows(BadRequestException.class,
                () -> authService.registerNewAccount(validRegisterDto));

        assertEquals("Mật khẩu xác nhận không khớp!", exception.getMessage());
        verify(userRepository, never()).save(any(User.class)); // Đảm bảo chưa lưu vào DB
    }

    @Test
    void testRegisterNewAccount_EmailAlreadyExists_ThrowsBadRequestException() {
        // Arrange
        when(userRepository.existsByEmail(validRegisterDto.getEmail())).thenReturn(true);

        // Act & Assert
        BadRequestException exception = assertThrows(BadRequestException.class,
                () -> authService.registerNewAccount(validRegisterDto));

        assertEquals("Email đã được sử dụng!", exception.getMessage());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void testRegisterNewAccount_PhoneAlreadyExists_ThrowsBadRequestException() {
        // Arrange
        when(userRepository.existsByEmail(validRegisterDto.getEmail())).thenReturn(false);
        when(userRepository.existsByPhone(validRegisterDto.getPhone())).thenReturn(true);

        // Act & Assert
        BadRequestException exception = assertThrows(BadRequestException.class,
                () -> authService.registerNewAccount(validRegisterDto));

        assertEquals("Số điện thoại đã được sử dụng!", exception.getMessage());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void testRegisterNewAccount_EmailServiceFails_ReturnsAlternativeMessage() throws Exception {
        // Arrange
        when(userRepository.existsByEmail(validRegisterDto.getEmail())).thenReturn(false);
        when(userRepository.existsByPhone(validRegisterDto.getPhone())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("encodedPass");

        User savedUser = new User();
        savedUser.setId(2L);
        when(userRepository.save(any(User.class))).thenReturn(savedUser);

        // Giả lập lỗi khi gửi email
        doThrow(new RuntimeException("SMTP Server Down"))
                .when(emailService).sendVerificationEmail(any(), any());

        // Act
        RegisterResponseDTO response = authService.registerNewAccount(validRegisterDto);

        // Assert
        assertNotNull(response);
        assertEquals("Đăng ký thành công nhưng hệ thống gặp lỗi khi gửi email xác thực. Vui lòng sử dụng tính năng 'Gửi lại mã' sau.", response.getMessage());
        verify(userRepository, times(1)).save(any(User.class)); // Tài khoản vẫn được lưu
    }

    // =========================================================================
    // TEST CASES CHO USER STORY 02: EMAIL VERIFICATION (XÁC THỰC EMAIL)
    // =========================================================================

    @Test
    void testVerifyEmail_Success() {
        // Arrange: Tạo user với token hợp lệ, chưa hết hạn
        String validToken = "valid-uuid-token";
        User user = new User();
        user.setEmail("test@example.com");
        user.setVerificationToken(validToken);
        // Hạn sử dụng: 1 giờ trong tương lai
        user.setVerificationTokenExpiryDate(Instant.now().plus(1, ChronoUnit.HOURS));
        user.setStatus(UserStatus.PENDING);

        when(userRepository.findByVerificationToken(validToken)).thenReturn(Optional.of(user));

        // Act
        authService.verifyEmail(validToken);

        // Assert: Kiểm tra trạng thái đã chuyển ACTIVE và token bị xóa
        assertTrue(user.isEmailVerified());
        assertEquals(UserStatus.ACTIVE, user.getStatus());
        assertNull(user.getVerificationToken());
        assertNull(user.getVerificationTokenExpiryDate());

        // Verify user đã được lưu vào DB
        verify(userRepository, times(1)).save(user);
    }

    @Test
    void testVerifyEmail_WithPendingEmail_Success() {
        // Arrange: Trường hợp user đang muốn đổi email (pendingEmail != null)
        String validToken = "valid-uuid-token";
        User user = new User();
        user.setEmail("old@example.com");
        user.setPendingEmail("new@example.com");
        user.setVerificationTokenExpiryDate(Instant.now().plus(1, ChronoUnit.HOURS));
        user.setStatus(UserStatus.PENDING);

        when(userRepository.findByVerificationToken(validToken)).thenReturn(Optional.of(user));

        // Act
        authService.verifyEmail(validToken);

        // Assert: Pending email phải được chuyển thành email chính
        assertEquals("new@example.com", user.getEmail());
        assertNull(user.getPendingEmail());
        assertEquals(UserStatus.ACTIVE, user.getStatus());
        verify(userRepository, times(1)).save(user);
    }

    @Test
    void testVerifyEmail_InvalidToken_ThrowsBadRequestException() {
        // Arrange: Token không tồn tại trong DB
        String invalidToken = "invalid-token";
        when(userRepository.findByVerificationToken(invalidToken)).thenReturn(Optional.empty());

        // Act & Assert
        BadRequestException exception = assertThrows(BadRequestException.class,
                () -> authService.verifyEmail(invalidToken));

        assertEquals("Token xác thực không hợp lệ!", exception.getMessage());
        // Verify user không bị thay đổi và không được lưu
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void testVerifyEmail_ExpiredToken_ThrowsBadRequestException() {
        // Arrange: Token đã hết hạn
        String expiredToken = "expired-token";
        User user = new User();
        user.setVerificationToken(expiredToken);
        // Hạn sử dụng: 1 giờ trong quá khứ
        user.setVerificationTokenExpiryDate(Instant.now().minus(1, ChronoUnit.HOURS));
        user.setStatus(UserStatus.PENDING);

        when(userRepository.findByVerificationToken(expiredToken)).thenReturn(Optional.of(user));

        // Act & Assert
        BadRequestException exception = assertThrows(BadRequestException.class,
                () -> authService.verifyEmail(expiredToken));

        assertEquals("Token xác thực đã hết hạn!", exception.getMessage());
        assertEquals(UserStatus.PENDING, user.getStatus()); // Đảm bảo trạng thái vẫn là PENDING
        verify(userRepository, never()).save(any(User.class));
    }

    // =========================================================================
    // TEST CASES CHO GỬI LẠI EMAIL XÁC THỰC
    // =========================================================================

    @Test
    void testResendVerificationEmail_Success() {
        // Arrange: User hợp lệ, trạng thái PENDING
        ResendVerificationEmailRequestDTO requestDto = new ResendVerificationEmailRequestDTO();
        requestDto.setEmail("test@example.com");

        User user = new User();
        user.setEmail("test@example.com");
        user.setStatus(UserStatus.PENDING);

        when(userRepository.findByEmail(requestDto.getEmail())).thenReturn(Optional.of(user));

        // Act
        MessageResponseDTO response = authService.resendVerificationEmail(requestDto);

        // Assert: Xác nhận logic chạy thành công
        assertEquals("Email xác thực đã được gửi lại thành công!", response.getMessage());

        // Xác minh token mới đã được tạo và gán cho user
        assertNotNull(user.getVerificationToken());
        assertNotNull(user.getVerificationTokenExpiryDate());
        assertTrue(user.getVerificationTokenExpiryDate().isAfter(Instant.now()));

        // Kiểm tra hàm save và hàm gửi email được gọi 1 lần
        verify(userRepository, times(1)).save(user);
        verify(emailService, times(1)).sendVerificationEmail(eq(user.getEmail()), anyString());
    }

    @Test
    void testResendVerificationEmail_UserNotFound_ThrowsBadRequestException() {
        // Arrange: Không tìm thấy email trong DB
        ResendVerificationEmailRequestDTO requestDto = new ResendVerificationEmailRequestDTO();
        requestDto.setEmail("notfound@example.com");

        when(userRepository.findByEmail(requestDto.getEmail())).thenReturn(Optional.empty());

        // Act & Assert
        BadRequestException exception = assertThrows(BadRequestException.class,
                () -> authService.resendVerificationEmail(requestDto));

        assertEquals("Không tìm thấy người dùng!", exception.getMessage());
        verify(emailService, never()).sendVerificationEmail(anyString(), anyString()); // Chắc chắn email không được gửi
    }

    @Test
    void testResendVerificationEmail_UserAlreadyActive_ThrowsBadRequestException() {
        // Arrange: Tìm thấy User nhưng trạng thái đã ACTIVE
        ResendVerificationEmailRequestDTO requestDto = new ResendVerificationEmailRequestDTO();
        requestDto.setEmail("active@example.com");

        User user = new User();
        user.setEmail("active@example.com");
        user.setStatus(UserStatus.ACTIVE);

        when(userRepository.findByEmail(requestDto.getEmail())).thenReturn(Optional.of(user));

        // Act & Assert
        BadRequestException exception = assertThrows(BadRequestException.class,
                () -> authService.resendVerificationEmail(requestDto));

        assertEquals("Tài khoản đã được xác thực trước đó!", exception.getMessage());
        verify(emailService, never()).sendVerificationEmail(anyString(), anyString());
        verify(userRepository, never()).save(any(User.class));
    }

    // =========================================================================
    // TEST CASES CHO USER STORY 03: LOGIN
    // =========================================================================

    @Test
    void testLogin_Success() {
        // Arrange
        LoginRequestDTO loginRequest = LoginRequestDTO.builder()
                .email("test@example.com")
                .password("password123")
                .build();

        User activeUser = new User();
        activeUser.setId(1L);
        activeUser.setEmail("test@example.com");
        activeUser.setPassword("encodedPassword");
        activeUser.setFullName("Nguyen Van A");
        activeUser.setStatus(UserStatus.ACTIVE);
        activeUser.setRole(Role.CUSTOMER);

        // Giả lập logic tìm user và check password
        when(userRepository.findByEmail(loginRequest.getEmail())).thenReturn(Optional.of(activeUser));
        when(passwordEncoder.matches(loginRequest.getPassword(), activeUser.getPassword())).thenReturn(true);

        // Giả lập có 1 token cũ đang active để test logic thu hồi (revoke) token
        Token oldToken = new Token();
        oldToken.setToken("old-access-token");
        oldToken.setExpired(false);
        oldToken.setRevoked(false);
        List<Token> validTokens = new ArrayList<>();
        validTokens.add(oldToken);

        when(tokenRepository.findAllValidTokensByUser(activeUser.getId())).thenReturn(validTokens);

        // Giả lập provider sinh ra token mới
        String newAccessToken = "new-access-token-jwt";
        String newRefreshToken = "new-refresh-token-jwt";
        when(jwtTokenProvider.generateAccessToken(activeUser)).thenReturn(newAccessToken);
        when(jwtTokenProvider.generateRefreshToken(activeUser)).thenReturn(newRefreshToken);

        // Act
        LoginResponseDTO response = authService.login(loginRequest);

        // Assert
        assertNotNull(response);
        assertEquals(1L, response.getUserId());
        assertEquals("test@example.com", response.getEmail());
        assertEquals("Nguyen Van A", response.getFullName());
        assertEquals(Role.CUSTOMER, response.getRole());
        assertEquals(newAccessToken, response.getAccessToken());
        assertEquals(newRefreshToken, response.getRefreshToken());

        // Kiểm tra xem token cũ đã bị vô hiệu hóa chưa
        assertTrue(oldToken.isExpired());
        assertTrue(oldToken.isRevoked());
        verify(tokenRepository, times(1)).saveAll(validTokens);

        // Kiểm tra các token mới có được lưu vào DB không
        verify(tokenRepository, times(1)).save(any(Token.class));
        verify(refreshTokenRepository, times(1)).save(any(RefreshToken.class));
    }

    @Test
    void testLogin_MissingInformation_ThrowsBadRequestException() {
        // Arrange: Trường hợp thiếu Email hoặc Password
        LoginRequestDTO missingEmailDto = LoginRequestDTO.builder()
                .email("")
                .password("password123")
                .build();
        LoginRequestDTO missingPasswordDto = LoginRequestDTO.builder()
                .email("test@example.com")
                .password(null)
                .build();

        // Act & Assert
        assertThrows(BadRequestException.class, () -> authService.login(missingEmailDto));
        assertThrows(BadRequestException.class, () -> authService.login(missingPasswordDto));

        // Xác minh không gọi vào repository
        verify(userRepository, never()).findByEmail(anyString());
    }

    @Test
    void testLogin_UserNotFound_ThrowsBadRequestException() {
        // Arrange
        LoginRequestDTO loginRequest = LoginRequestDTO.builder()
                .email("notfound@example.com")
                .password("password123")
                .build();
        when(userRepository.findByEmail(loginRequest.getEmail())).thenReturn(Optional.empty());

        // Act & Assert
        BadRequestException exception = assertThrows(BadRequestException.class,
                () -> authService.login(loginRequest));

        assertEquals("Tên đăng nhập không tồn tại!", exception.getMessage());
    }

    @Test
    void testLogin_WrongPassword_ThrowsBadRequestException() {
        // Arrange
        LoginRequestDTO loginRequest = LoginRequestDTO.builder()
                .email("test@example.com")
                .password("wrongpassword")
                .build();
        User user = new User();
        user.setPassword("encodedPassword");

        when(userRepository.findByEmail(loginRequest.getEmail())).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())).thenReturn(false);

        // Act & Assert
        BadRequestException exception = assertThrows(BadRequestException.class,
                () -> authService.login(loginRequest));

        assertEquals("Mật khẩu không chính xác!", exception.getMessage());
    }

    @Test
    void testLogin_UserPending_ThrowsBadRequestException() {
        // Arrange
        LoginRequestDTO loginRequest = LoginRequestDTO.builder()
                .email("test@example.com")
                .password("password123")
                .build();
        User pendingUser = new User();
        pendingUser.setPassword("encodedPassword");
        pendingUser.setStatus(UserStatus.PENDING); // Trạng thái PENDING

        when(userRepository.findByEmail(loginRequest.getEmail())).thenReturn(Optional.of(pendingUser));
        when(passwordEncoder.matches(loginRequest.getPassword(), pendingUser.getPassword())).thenReturn(true);

        // Act & Assert
        BadRequestException exception = assertThrows(BadRequestException.class,
                () -> authService.login(loginRequest));

        assertEquals("Tài khoản chưa được xác thực email!", exception.getMessage());
        verify(jwtTokenProvider, never()).generateAccessToken(any()); // Đảm bảo token không được tạo
    }

    @Test
    void testLogin_UserBlocked_ThrowsBadRequestException() {
        // Arrange
        LoginRequestDTO loginRequest = LoginRequestDTO.builder()
                .email("test@example.com")
                .password("password123")
                .build();
        User blockedUser = new User();
        blockedUser.setPassword("encodedPassword");
        blockedUser.setStatus(UserStatus.BLOCKED); // Trạng thái BLOCKED

        when(userRepository.findByEmail(loginRequest.getEmail())).thenReturn(Optional.of(blockedUser));
        when(passwordEncoder.matches(loginRequest.getPassword(), blockedUser.getPassword())).thenReturn(true);

        // Act & Assert
        BadRequestException exception = assertThrows(BadRequestException.class,
                () -> authService.login(loginRequest));

        assertEquals("Tài khoản đã bị khóa!", exception.getMessage());
        verify(jwtTokenProvider, never()).generateAccessToken(any());
    }

    // =========================================================================
    // TEST CASES CHO USER STORY 04: LOGOUT
    // =========================================================================

    @Test
    void testLogout_Success() {
        // Arrange
        String validTokenStr = "valid-jwt-token";

        // Khởi tạo DTO (Sử dụng Builder hoặc Setter tùy theo class của bạn)
        LogoutRequestDTO requestDto = new LogoutRequestDTO(validTokenStr);

        Token token = new Token();
        token.setToken(validTokenStr);
        token.setExpired(false);
        token.setRevoked(false);

        // Giả lập tìm thấy token trong DB
        when(tokenRepository.findByToken(validTokenStr)).thenReturn(Optional.of(token));

        // Act
        MessageResponseDTO response = authService.logout(requestDto);

        // Assert
        assertNotNull(response);
        assertEquals("Đăng xuất thành công!", response.getMessage());

        // Xác minh token đã bị vô hiệu hóa
        assertTrue(token.isExpired());
        assertTrue(token.isRevoked());

        // Xác minh repository đã gọi hàm save để lưu cập nhật vào DB
        verify(tokenRepository, times(1)).save(token);
    }

    @Test
    void testLogout_InvalidToken_ThrowsBadRequestException() {
        // Arrange
        String invalidTokenStr = "invalid-jwt-token";

        LogoutRequestDTO requestDto = new LogoutRequestDTO(invalidTokenStr);

        // Giả lập KHÔNG tìm thấy token trong DB
        when(tokenRepository.findByToken(invalidTokenStr)).thenReturn(Optional.empty());

        // Act & Assert
        BadRequestException exception = assertThrows(BadRequestException.class,
                () -> authService.logout(requestDto));

        assertEquals("Token không hợp lệ!", exception.getMessage());

        // Xác minh chắc chắn rằng hệ thống không tiến hành lưu trữ bậy bạ vào DB
        verify(tokenRepository, never()).save(any(Token.class));
    }


}