package com.fashion.controller.api.admin;

import com.fashion.dto.request.ProcessReturnRequestDTO;
import com.fashion.dto.response.MessageResponseDTO;
import com.fashion.dto.response.ReturnRequestResponseDTO;
import com.fashion.model.enums.ReturnStatus;
import com.fashion.service.return_request.ReturnRequestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/return-requests")
@RequiredArgsConstructor
public class AdminReturnRequestController {

    private final ReturnRequestService returnRequestService;

    // LẤY TẤT CẢ YÊU CẦU
    @GetMapping("/list")
    public ResponseEntity<Page<ReturnRequestResponseDTO>> getAllReturnRequests(
            @RequestParam(required = false) ReturnStatus status,
            Pageable pageable) {
        return ResponseEntity.ok(returnRequestService.getAllReturnRequests(status, pageable));
    }

    // XEM CHI TIẾT
    @GetMapping("/{requestId}")
    public ResponseEntity<ReturnRequestResponseDTO> getReturnRequestDetail(
            @PathVariable Long requestId
    ) {
        return ResponseEntity.ok(returnRequestService.getReturnRequestDetail(requestId));
    }

    // XỬ LÝ YÊU CẦU
    @PostMapping("/{requestId}/process")
    public ResponseEntity<MessageResponseDTO> processReturnRequest(
            @PathVariable Long requestId,
            @Valid @RequestBody ProcessReturnRequestDTO dto
    ) {
        return ResponseEntity.ok(
                returnRequestService.processReturnRequest(requestId, dto)
        );
    }
}
