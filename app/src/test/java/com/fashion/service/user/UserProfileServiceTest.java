package com.fashion.service.user;
import com.fashion.dto.request.ChangePasswordRequestDTO;
import com.fashion.dto.response.MessageResponseDTO;
import com.fashion.exception.BadRequestException;
import com.fashion.exception.ResourceNotFoundException;
import com.fashion.model.User;
import com.fashion.repository.UserRepository;
import com.fashion.util.SecurityUtils;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserProfileServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @InjectMocks private UserServiceImpl userService;

    private User mockUser;
    private MockedStatic<SecurityUtils> mockedSecurityUtils;

    @BeforeEach
    void setUp() {
        mockUser = User.builder().id(1L).password("encoded_old_password").build();

        // Mở luồng Mock Static cho class SecurityUtils trước mỗi lần test
        mockedSecurityUtils = mockStatic(SecurityUtils.class);
        mockedSecurityUtils.when(SecurityUtils::getAuthenticatedUserId).thenReturn(1L);
    }

    @AfterEach
    void tearDown() {
        // Bắt buộc phải đóng Mock Static sau khi test xong để giải phóng bộ nhớ
        mockedSecurityUtils.close();
    }

    // 1. FAIL CASE: Sai mật khẩu hiện tại
    @Test
    void changePassword_WrongCurrentPassword_ThrowsException() {
        ChangePasswordRequestDTO dto = new ChangePasswordRequestDTO("wrong", "new123", "new123");

        when(userRepository.findById(1L)).thenReturn(Optional.of(mockUser));
        when(passwordEncoder.matches("wrong", "encoded_old_password")).thenReturn(false);

        assertThrows(BadRequestException.class, () -> userService.changePassword(dto));
    }

    // 2. FAIL CASE: Mật khẩu mới quá ngắn
    @Test
    void changePassword_ShortPassword_ThrowsException() {
        ChangePasswordRequestDTO dto = new ChangePasswordRequestDTO("old", "123", "123");

        when(userRepository.findById(1L)).thenReturn(Optional.of(mockUser));
        when(passwordEncoder.matches("old", "encoded_old_password")).thenReturn(true);

        assertThrows(BadRequestException.class, () -> userService.changePassword(dto));
    }

    // 3. FAIL CASE: Xác nhận mật khẩu không khớp
    @Test
    void changePassword_MismatchConfirm_ThrowsException() {
        ChangePasswordRequestDTO dto = new ChangePasswordRequestDTO("old", "new1234", "khongkhop");

        when(userRepository.findById(1L)).thenReturn(Optional.of(mockUser));
        when(passwordEncoder.matches("old", "encoded_old_password")).thenReturn(true);

        assertThrows(BadRequestException.class, () -> userService.changePassword(dto));
    }

    // 4. FAIL CASE: Lỗi không tìm thấy user
    @Test
    void changePassword_UserNotFound_ThrowsException() {
        ChangePasswordRequestDTO dto = new ChangePasswordRequestDTO("old", "new123", "new123");

        when(userRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> userService.changePassword(dto));
    }

    // 5. SUCCESS CASE: Đổi mật khẩu thành công
    @Test
    void changePassword_Success_UpdatesPassword() {
        ChangePasswordRequestDTO dto = new ChangePasswordRequestDTO("old", "new1234", "new1234");

        when(userRepository.findById(1L)).thenReturn(Optional.of(mockUser));
        when(passwordEncoder.matches("old", "encoded_old_password")).thenReturn(true);
        when(passwordEncoder.encode("new1234")).thenReturn("encoded_new_password");

        MessageResponseDTO response = userService.changePassword(dto);

        assertEquals("Đổi mật khẩu thành công!", response.getMessage());
        assertEquals("encoded_new_password", mockUser.getPassword());
        verify(userRepository, times(1)).save(mockUser);
    }
}