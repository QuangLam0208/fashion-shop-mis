package com.fashion.controller.api;

import com.fashion.dto.request.ChangePasswordRequestDTO;
import com.fashion.dto.request.UpdateProfileRequestDTO;
import com.fashion.dto.response.MessageResponseDTO;
import com.fashion.dto.response.ProfileResponseDTO;
import com.fashion.exception.UnauthenticatedException;
import com.fashion.model.User;
import com.fashion.service.user.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    // XEM THÔNG TIN CÁ NHÂN
    @GetMapping("/me")
    public ResponseEntity<ProfileResponseDTO> getProfile() {
        Long userId = getAuthenticatedUserId();
        ProfileResponseDTO response = userService.getProfile(userId);
        return ResponseEntity.status(HttpStatus.OK).body(response);
    }

    // CẬP NHẬT THÔNG TIN
    @PutMapping("/me")
    public ResponseEntity<ProfileResponseDTO> updateProfile(
            @Valid @RequestBody UpdateProfileRequestDTO dto) {
        Long userId = getAuthenticatedUserId();
        ProfileResponseDTO response = userService.updateProfile(userId, dto);
        return ResponseEntity.status(HttpStatus.OK).body(response);
    }

    // ĐỔI MẬT KHẨU
    @PutMapping("/me/password")
    public ResponseEntity<MessageResponseDTO> changePassword(
            @Valid @RequestBody ChangePasswordRequestDTO dto) {
        Long userId = getAuthenticatedUserId();
        MessageResponseDTO response = userService.changePassword(userId, dto);
        return ResponseEntity.status(HttpStatus.OK).body(response);
    }

    // XÓA TÀI KHOẢN
    @DeleteMapping("/me")
    public ResponseEntity<MessageResponseDTO> deleteAccount() {
        Long userId = getAuthenticatedUserId();
        MessageResponseDTO response = userService.deleteAccount(userId);
        return ResponseEntity.status(HttpStatus.OK).body(response);
    }

    // GỬI LẠI EMAIL XÁC THỰC
    @PostMapping("/me/resend-verification")
    public ResponseEntity<MessageResponseDTO> resendVerification() {
        Long userId = getAuthenticatedUserId();
        MessageResponseDTO response = userService.resendVerification(userId);
        return ResponseEntity.status(HttpStatus.OK).body(response);
    }

    // TRÍCH XUẤT userId TỪ SECURITY CONTEXT
    private Long getAuthenticatedUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof User)) {
            throw new UnauthenticatedException("Vui lòng đăng nhập để thực hiện chức năng này!");
        }
        User user = (User) authentication.getPrincipal();
        return user.getId();
    }
}
