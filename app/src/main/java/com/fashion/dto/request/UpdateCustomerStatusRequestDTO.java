package com.fashion.dto.request;

import com.fashion.model.enums.UserStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateCustomerStatusRequestDTO {
    @NotNull(message = "Trạng thái không được để trống")
    private UserStatus status;
}
