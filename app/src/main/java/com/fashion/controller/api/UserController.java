package com.fashion.controller.api;

import com.fashion.dto.request.ChangePasswordRequestDTO;
import com.fashion.dto.request.UpdateProfileRequestDTO;
import com.fashion.dto.response.MessageResponseDTO;
import com.fashion.dto.response.ProfileResponseDTO;
import com.fashion.service.user.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<ProfileResponseDTO> getProfile() {
        return ResponseEntity.status(HttpStatus.OK).body(userService.getProfile());
    }

    @PutMapping("/me/update")
    public ResponseEntity<ProfileResponseDTO> updateProfile(@Valid @RequestBody UpdateProfileRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.OK).body(userService.updateProfile(dto));
    }

    @PostMapping("/me/password")
    public ResponseEntity<MessageResponseDTO> changePassword(@Valid @RequestBody ChangePasswordRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.OK).body(userService.changePassword(dto));
    }

    @DeleteMapping("/me/delete")
    public ResponseEntity<MessageResponseDTO> deleteAccount() {
        return ResponseEntity.status(HttpStatus.OK).body(userService.deleteAccount());
    }

    @PostMapping("/me/resend-verification")
    public ResponseEntity<MessageResponseDTO> resendVerification() {
        return ResponseEntity.status(HttpStatus.OK).body(userService.resendVerification());
    }
}