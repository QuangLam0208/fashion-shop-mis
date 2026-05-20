package com.fashion.controller.api;

import com.fashion.dto.request.SubmitReturnRequestDTO;
import com.fashion.dto.response.ReturnRequestResponseDTO;
import com.fashion.model.ReturnRequest;
import com.fashion.service.return_request.ReturnRequestService;
import com.fashion.util.SecurityUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/return-requests")
@RequiredArgsConstructor
public class ReturnRequestController {

    private final ReturnRequestService returnRequestService;

    // LẤY DS YÊU CẦU TRẢ HÀNG
    @GetMapping("/list")
    public ResponseEntity<List<ReturnRequestResponseDTO>> getReturnRequestsByCustomer() {
        Long userId = SecurityUtils.getAuthenticatedUserId();
        return ResponseEntity.ok(
                returnRequestService.getReturnRequestsByCustomer(userId));
    }

    // GỬI YÊU CẦU TRẢ HÀNG (JSON)
    @PostMapping
    public ResponseEntity<ReturnRequest> submitReturnRequest(
            @Valid @RequestBody SubmitReturnRequestDTO dto) {
        return ResponseEntity.ok(
                returnRequestService.submitReturnRequest(dto));
    }
}
