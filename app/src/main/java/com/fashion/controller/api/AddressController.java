package com.fashion.controller.api;

import com.fashion.dto.request.AddressRequestDTO;
import com.fashion.dto.response.AddressResponseDTO;
import com.fashion.dto.response.MessageResponseDTO;
import com.fashion.exception.UnauthenticatedException;
import com.fashion.model.User;
import com.fashion.service.address.AddressService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
@RestController
@RequestMapping("/api/users/me/addresses")
@RequiredArgsConstructor
public class AddressController {

    private final AddressService addressService;

    // Lấy ID từ token hiện tại
    private Long getAuthenticatedUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof User)) {
            throw new UnauthenticatedException("Vui lòng đăng nhập để thực hiện chức năng này!");
        }
        User user = (User) authentication.getPrincipal();
        return user.getId();
    }

    // 1. Lấy danh sách địa chỉ
    @GetMapping(value = "/get")
    public ResponseEntity<List<AddressResponseDTO>> getMyAddresses() {
        return ResponseEntity.ok(addressService.getUserAddresses(getAuthenticatedUserId()));
    }

    // 2. Thêm mới địa chỉ
    @PostMapping(value = "/create")
    public ResponseEntity<AddressResponseDTO> addAddress(@Valid @RequestBody AddressRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(addressService.createUserAddress(getAuthenticatedUserId(), dto));
    }

    // 3. Sửa địa chỉ
    @PutMapping("/update")
    public ResponseEntity<AddressResponseDTO> updateAddress(
            @PathVariable Long id,
            @Valid @RequestBody AddressRequestDTO dto) {
        return ResponseEntity.ok(addressService.updateUserAddress(getAuthenticatedUserId(), id, dto));
    }

    // 4. Xóa địa chỉ
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<MessageResponseDTO> deleteAddress(@PathVariable Long id) {
        return ResponseEntity.ok(addressService.deleteAddress(getAuthenticatedUserId(), id));
    }

    // 5. Đặt làm mặc định
    @PatchMapping("/{id}/default")
    public ResponseEntity<AddressResponseDTO> setDefaultAddress(@PathVariable Long id) {
        return ResponseEntity.ok(addressService.setDefaultAddress(getAuthenticatedUserId(), id));
    }
}