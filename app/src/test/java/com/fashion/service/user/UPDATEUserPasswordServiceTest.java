package com.fashion.service.user;

import com.fashion.controller.api.UserController;
import com.fashion.dto.request.ChangePasswordRequestDTO;
import com.fashion.dto.response.MessageResponseDTO;
import com.fashion.exception.BadRequestException;
import com.fashion.exception.UnauthenticatedException;
import com.fashion.model.User;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UPDATEUserPasswordServiceTest {

    @Mock
    private UserService userService;

    @InjectMocks
    private UserController userController;

    private User mockUser;
    private ChangePasswordRequestDTO dto;

    @BeforeEach
    void setUp() {
        // Chuẩn bị dữ liệu mẫu trước mỗi test
        mockUser = User.builder().id(1L).build();
        dto = new ChangePasswordRequestDTO("oldPass123", "newPass123", "newPass123");
    }

    @AfterEach
    void tearDown() {
        // Dọn dẹp SecurityContext sau khi test xong để không ảnh hưởng test khác
        SecurityContextHolder.clearContext();
    }

    // Hàm hỗ trợ mô phỏng User đã đăng nhập thành công
    private void mockAuthenticatedUser() {
        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(mockUser, null, null);
        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    // ==========================================
    // 1. SUCCESS (Thành công - 200 OK)
    // ==========================================
    @Test
    void changePassword_Success() {
        mockAuthenticatedUser();
        MessageResponseDTO successMsg = new MessageResponseDTO("Đổi mật khẩu thành công!");

        when(userService.changePassword(1L, dto)).thenReturn(successMsg);

        ResponseEntity<MessageResponseDTO> response = userController.changePassword(dto);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Đổi mật khẩu thành công!", response.getBody().getMessage());
    }

    // ==========================================
    // 2. WRONG CURRENT (Sai mật khẩu hiện tại - 400 Bad Request)
    // ==========================================
    @Test
    void changePassword_WrongCurrent() {
        mockAuthenticatedUser();

        when(userService.changePassword(1L, dto))
                .thenThrow(new BadRequestException("Mật khẩu hiện tại không đúng!"));

        BadRequestException exception = assertThrows(BadRequestException.class,
                () -> userController.changePassword(dto));

        assertEquals("Mật khẩu hiện tại không đúng!", exception.getMessage());
    }

    // ==========================================
    // 3. SHORT PASSWORD (Mật khẩu quá ngắn - 400 Bad Request)
    // ==========================================
    @Test
    void changePassword_ShortPassword() {
        mockAuthenticatedUser();
        dto.setNewPassword("123"); // Sửa lại DTO cho test case này

        when(userService.changePassword(1L, dto))
                .thenThrow(new BadRequestException("Mật khẩu mới phải có ít nhất 6 ký tự!"));

        BadRequestException exception = assertThrows(BadRequestException.class,
                () -> userController.changePassword(dto));

        assertEquals("Mật khẩu mới phải có ít nhất 6 ký tự!", exception.getMessage());
    }

    // ==========================================
    // 4. MISMATCH (Mật khẩu xác nhận không khớp - 400 Bad Request)
    // ==========================================
    @Test
    void changePassword_Mismatch() {
        mockAuthenticatedUser();
        dto.setConfirmNewPassword("khong_khop"); // Sửa lại DTO cho test case này

        when(userService.changePassword(1L, dto))
                .thenThrow(new BadRequestException("Mật khẩu xác nhận không khớp!"));

        BadRequestException exception = assertThrows(BadRequestException.class,
                () -> userController.changePassword(dto));

        assertEquals("Mật khẩu xác nhận không khớp!", exception.getMessage());
    }

    // ==========================================
    // 5. UNAUTH 401 (Chưa đăng nhập / Token không hợp lệ - 401)
    // ==========================================
    @Test
    void changePassword_Unauth401() {
        // Cố tình KHÔNG gọi hàm mockAuthenticatedUser() để mô phỏng chưa đăng nhập
        // Context lúc này đang trống (null)

        UnauthenticatedException exception = assertThrows(UnauthenticatedException.class,
                () -> userController.changePassword(dto));

        assertEquals("Vui lòng đăng nhập để thực hiện chức năng này!", exception.getMessage());
    }
}