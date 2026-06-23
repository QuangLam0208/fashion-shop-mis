package com.fashion.dto.response;

import com.fashion.model.enums.UserStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomerDetailResponseDTO {
    private Long userId;
    private String fullName;
    private String email;
    private String phone;
    private String address;
    private UserStatus status;
    private List<OrderSummaryResponseDTO> orderHistory;
}
