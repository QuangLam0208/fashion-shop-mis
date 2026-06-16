package com.fashion.controller.api.admin;

import com.fashion.dto.request.ProcessReturnRequestDTO;
import com.fashion.dto.response.MessageResponseDTO;
import com.fashion.dto.response.ReturnRequestDetailResponseDTO;
import com.fashion.dto.response.ReturnRequestListItemResponseDTO;
import com.fashion.model.enums.RefundStatus;
import com.fashion.model.enums.ReturnStatus;
import com.fashion.service.order.OrderManagementService;
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
    private final OrderManagementService orderManagementService;

    // LẤY TẤT CẢ YÊU CẦU
    @GetMapping("/list")
    public ResponseEntity<Page<ReturnRequestListItemResponseDTO>> getAllReturnRequests(
            @RequestParam(required = false) ReturnStatus status,
            Pageable pageable) {
        return ResponseEntity.ok(returnRequestService.getAllReturnRequests(status, pageable));
    }

    // XEM CHI TIẾT
    @GetMapping("/{requestId}")
    public ResponseEntity<ReturnRequestDetailResponseDTO> getReturnRequestDetail(
            @PathVariable Long requestId
    ) {
        return ResponseEntity.ok(returnRequestService.getReturnRequestDetail(requestId));
    }

    // XỬ LÝ YÊU CẦU
    @PutMapping("/{requestId}/process")
    public ResponseEntity<MessageResponseDTO> processReturnRequest(
            @PathVariable Long requestId,
            @Valid @RequestBody ProcessReturnRequestDTO dto
    ) {
        return ResponseEntity.ok(
                returnRequestService.processReturnRequest(requestId, dto)
        );
    }

    @PutMapping("/refund/{itemId}")
    public ResponseEntity<Void> updateRefundStatus(
            @PathVariable Long itemId,
            @RequestParam RefundStatus status
    ) {
        orderManagementService.updateRefundStatus(itemId, status);
        return ResponseEntity.noContent().build();
    }
}