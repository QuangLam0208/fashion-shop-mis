package com.fashion.dto.response;

import com.fashion.model.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginResponseDTO {
    private Long userId;
    private String fullName;
    private String email;
    private Role role;
    private String accessToken;
    private String refreshToken;
}
