package com.fashion.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderDashboardSummaryDTO {
    private long unpaidCount;
    private long processingCount;
    private long shippedCount;
    private long toReviewCount;
    private long returnCount;
    private OrderSummaryResponseDTO latestOrder;
}
