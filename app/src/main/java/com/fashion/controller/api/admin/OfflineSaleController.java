package com.fashion.controller.api.admin;

import com.fashion.dto.request.RecordOfflineSaleRequestDTO;
import com.fashion.dto.response.PlaceOrderResponseDTO;
import com.fashion.service.offline_sale.OfflineSaleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/offline-sales")
@RequiredArgsConstructor
public class OfflineSaleController {

    private final OfflineSaleService offlineSaleService;

    // GHI NHẬN BÁN TRỰC TIẾP
    @PostMapping
    public ResponseEntity<PlaceOrderResponseDTO> recordOfflineSale(
            @Valid @RequestBody RecordOfflineSaleRequestDTO dto
    ) {

        PlaceOrderResponseDTO response = offlineSaleService.recordOfflineSale(dto);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
