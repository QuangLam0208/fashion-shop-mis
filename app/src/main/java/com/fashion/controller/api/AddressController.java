package com.fashion.controller.api;

import com.fashion.dto.request.AddressRequestDTO;
import com.fashion.dto.response.AddressResponseDTO;
import com.fashion.dto.response.MessageResponseDTO;
import com.fashion.service.address.AddressService;
import com.fashion.util.SecurityUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users/me/addresses")
@RequiredArgsConstructor
public class AddressController {

    private final AddressService addressService;

    // 1. Lấy danh sách địa chỉ
    @GetMapping(value = "/list")
    public ResponseEntity<List<AddressResponseDTO>> getMyAddresses() {
        Long userId = SecurityUtils.getAuthenticatedUserId();
        return ResponseEntity.ok(addressService.getUserAddresses(userId));
    }

    // 2. Thêm mới địa chỉ
    @PostMapping(value = "/create")
    public ResponseEntity<AddressResponseDTO> addAddress(@Valid @RequestBody AddressRequestDTO dto) {
        Long userId = SecurityUtils.getAuthenticatedUserId();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(addressService.createUserAddress(userId, dto));
    }

    // 3. Sửa địa chỉ
    @PutMapping("/update/{id}")
    public ResponseEntity<AddressResponseDTO> updateAddress(
            @PathVariable Long id,
            @Valid @RequestBody AddressRequestDTO dto) {
        Long userId = SecurityUtils.getAuthenticatedUserId();
        return ResponseEntity.ok(addressService.updateUserAddress(userId, id, dto));
    }

    // 4. Xóa địa chỉ
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<MessageResponseDTO> deleteAddress(@PathVariable Long id) {
        Long userId = SecurityUtils.getAuthenticatedUserId();
        return ResponseEntity.ok(addressService.deleteAddress(userId, id));
    }

    // 5. Đặt làm mặc định
    @PatchMapping("/{id}/default")
    public ResponseEntity<AddressResponseDTO> setDefaultAddress(@PathVariable Long id) {
        Long userId = SecurityUtils.getAuthenticatedUserId();
        return ResponseEntity.ok(addressService.setDefaultAddress(userId, id));
    }

    // 6. Lấy danh sách địa chỉ
    @GetMapping(value = "/get/{addressId}")
    public ResponseEntity<AddressResponseDTO> getMyAddress(@PathVariable Long addressId) {
        Long userId = SecurityUtils.getAuthenticatedUserId();
        return ResponseEntity.ok(addressService.getUserAddress(userId, addressId));
    }
}