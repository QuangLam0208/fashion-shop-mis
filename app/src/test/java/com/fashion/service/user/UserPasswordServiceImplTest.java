package com.fashion.service.user;
import com.fashion.controller.api.UserController;
import com.fashion.dto.request.ChangePasswordRequestDTO;
import com.fashion.dto.response.MessageResponseDTO;
import com.fashion.exception.BadRequestException;
import com.fashion.exception.UnauthenticatedException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserPasswordServiceImplTest {

    @Mock
    private UserService userService;

    @InjectMocks
    private UserController userController;

    private ChangePasswordRequestDTO dto;

    @BeforeEach
    void setUp() {
        dto = new ChangePasswordRequestDTO("oldPass123", "newPass123", "newPass123");
    }

    // 1. SUCCESS (Thành công - 200 OK)
    @Test
    void changePassword_Success() {
        MessageResponseDTO successMsg = new MessageResponseDTO("Đổi mật khẩu thành công!");

        // Không cần truyền ID nữa
        when(userService.changePassword(dto)).thenReturn(successMsg);

        ResponseEntity<MessageResponseDTO> response = userController.changePassword(dto);

        assertEquals(200, response.getStatusCode().value());
        assertEquals("Đổi mật khẩu thành công!", response.getBody().getMessage());
    }

    // 2. WRONG CURRENT (Sai mật khẩu hiện tại - 400 Bad Request)
    @Test
    void changePassword_WrongCurrent() {
        when(userService.changePassword(dto))
                .thenThrow(new BadRequestException("Mật khẩu hiện tại không đúng!"));

        BadRequestException exception = assertThrows(BadRequestException.class,
                () -> userController.changePassword(dto));

        assertEquals("Mật khẩu hiện tại không đúng!", exception.getMessage());
    }

    // 3. SHORT PASSWORD (Mật khẩu quá ngắn - 400 Bad Request)
    @Test
    void changePassword_ShortPassword() {
        dto.setNewPassword("123");
        when(userService.changePassword(dto))
                .thenThrow(new BadRequestException("Mật khẩu mới phải có ít nhất 6 ký tự!"));

        BadRequestException exception = assertThrows(BadRequestException.class,
                () -> userController.changePassword(dto));

        assertEquals("Mật khẩu mới phải có ít nhất 6 ký tự!", exception.getMessage());
    }

    // 4. MISMATCH (Mật khẩu xác nhận không khớp - 400 Bad Request)
    @Test
    void changePassword_Mismatch() {
        dto.setConfirmNewPassword("khong_khop");
        when(userService.changePassword(dto))
                .thenThrow(new BadRequestException("Mật khẩu xác nhận không khớp!"));

        BadRequestException exception = assertThrows(BadRequestException.class,
                () -> userController.changePassword(dto));

        assertEquals("Mật khẩu xác nhận không khớp!", exception.getMessage());
    }

    // 5. UNAUTH 401 (Chưa đăng nhập / Token không hợp lệ - 401)
    @Test
    void changePassword_Unauth401() {
        // Mô phỏng Service ném lỗi UnauthenticatedException khi SecurityUtils không tìm thấy token
        when(userService.changePassword(dto))
                .thenThrow(new UnauthenticatedException("Vui lòng đăng nhập để thực hiện chức năng này!"));

        UnauthenticatedException exception = assertThrows(UnauthenticatedException.class,
                () -> userController.changePassword(dto));

        assertEquals("Vui lòng đăng nhập để thực hiện chức năng này!", exception.getMessage());
    }
}