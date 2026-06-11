package com.fashion.dto.response;

import com.fashion.model.enums.ReturnStatus;
import lombok.*;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReturnRequestListItemResponseDTO {
    private Long requestId;
    private Long orderId;
    private String customerName;
    private String customerPhone;
    private String reason;
    private Instant requestDate;
    private ReturnStatus status;
    private Integer totalItems;
}
