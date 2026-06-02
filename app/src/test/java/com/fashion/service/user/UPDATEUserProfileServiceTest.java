package com.fashion.service.user;

import com.fashion.dto.request.UpdateProfileRequestDTO;
import com.fashion.dto.response.ProfileResponseDTO;
import com.fashion.exception.BadRequestException;
import com.fashion.model.User;
import com.fashion.repository.UserRepository;
import com.fashion.service.email_log.EmailService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UPDATEUserProfileServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private EmailService emailService;
    @InjectMocks private UserServiceImpl userService;

    private User mockUser;

    @BeforeEach
    void setUp() {
        mockUser = User.builder().id(1L).email("old@gmail.com").addresses(new ArrayList<>()).build();
    }

    // TEST CASE: Cập nhật trùng số điện thoại -> Bắn lỗi 400
    @Test
    void updateProfile_DuplicatePhone_ThrowsException() {
        UpdateProfileRequestDTO dto = UpdateProfileRequestDTO.builder().phone("0999999999").build();

        when(userRepository.findById(1L)).thenReturn(Optional.of(mockUser));
        when(userRepository.existsByPhoneAndIdNot("0999999999", 1L)).thenReturn(true);

        assertThrows(BadRequestException.class, () -> userService.updateProfile(1L, dto));
    }

    // TEST CASE: Cập nhật Email -> Set pendingEmail và gửi mail
    @Test
    void updateProfile_NewEmail_SetsPendingEmailAndSendsVerification() throws Exception {
        UpdateProfileRequestDTO dto = UpdateProfileRequestDTO.builder().email("new@gmail.com").build();

        when(userRepository.findById(1L)).thenReturn(Optional.of(mockUser));
        when(userRepository.existsByEmailAndIdNot("new@gmail.com", 1L)).thenReturn(false);
        when(userRepository.save(any(User.class))).thenReturn(mockUser);

        ProfileResponseDTO response = userService.updateProfile(1L, dto);

        assertEquals("new@gmail.com", mockUser.getPendingEmail()); // Chờ xác thực email mới
        assertEquals("old@gmail.com", response.getEmail()); // Email chính vẫn là email cũ
        verify(emailService, times(1)).sendVerificationEmail(eq("new@gmail.com"), anyString());
    }
}