package com.fashion.controller.api.admin;

import com.fashion.dto.request.UpdateCustomerStatusRequestDTO;
import com.fashion.dto.response.CustomerDetailResponseDTO;
import com.fashion.dto.response.CustomerSummaryResponseDTO;
import com.fashion.dto.response.MessageResponseDTO;
import com.fashion.service.user.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/customers")
@RequiredArgsConstructor
public class AdminUserController {

    private final UserService userService;

    // DANH SÁCH KHÁCH HÀNG
    @GetMapping
    public ResponseEntity<Page<CustomerSummaryResponseDTO>> getAllCustomers(
            @RequestParam(required = false) String keyword,
            Pageable pageable
    ) {

        Page<CustomerSummaryResponseDTO> response = userService.getAllCustomers(keyword, pageable);

        return ResponseEntity.status(HttpStatus.OK).body(response);
    }

    // XEM CHI TIẾT KHÁCH HÀNG
    @GetMapping("/{customerId}")
    public ResponseEntity<CustomerDetailResponseDTO> getCustomerDetail(
            @PathVariable Long customerId
    ) {

        CustomerDetailResponseDTO response = userService.getCustomerDetail(customerId);

        return ResponseEntity.status(HttpStatus.OK).body(response);
    }

    // CẬP NHẬT TRẠNG THÁI KHÁCH HÀNG
    @PatchMapping("/{customerId}/status")
    public ResponseEntity<MessageResponseDTO> updateCustomerStatus(
            @PathVariable Long customerId,
            @Valid @RequestBody UpdateCustomerStatusRequestDTO dto
    ) {

        MessageResponseDTO response = userService.updateCustomerStatus(customerId, dto);

        return ResponseEntity.status(HttpStatus.OK).body(response);
    }
}
