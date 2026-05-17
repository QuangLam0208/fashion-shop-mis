package com.fashion.dto.response;

import com.fashion.model.enums.UserStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RegisterResponseDTO {
    private Long userId;
    private String fullName;
    private String email;
    private UserStatus status;
    private String message;
}
