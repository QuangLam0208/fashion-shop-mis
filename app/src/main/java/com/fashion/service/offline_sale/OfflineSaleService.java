package com.fashion.service.offline_sale;

import com.fashion.dto.request.RecordOfflineSaleRequestDTO;
import com.fashion.dto.response.PlaceOrderResponseDTO;

public interface OfflineSaleService {
    // Ghi nhận bán hàng trực tiếp
    PlaceOrderResponseDTO recordOfflineSale(RecordOfflineSaleRequestDTO dto);
}
