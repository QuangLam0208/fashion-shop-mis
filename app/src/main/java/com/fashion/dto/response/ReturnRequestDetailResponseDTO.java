package com.fashion.dto.response;

import com.fashion.model.enums.PaymentMethod;
import com.fashion.model.enums.ReturnStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.Date;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReturnRequestDetailResponseDTO {
    private Long requestId;
    private ReturnStatus status;
    private String reason;
    private String description;
    private List<String> imageUrls;
    private Instant requestDate;
    private Instant processedAt;
    private String rejectionReason;
    private Long customerId;
    private String customerName;
    private String customerEmail;
    private String customerPhone;
    private Long orderId;
    private PaymentMethod paymentMethod;
    private List<ReturnItemDTO> items;
}
