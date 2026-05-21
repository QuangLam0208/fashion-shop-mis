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
public class ProfileResponseDTO {
    private Long userId;
    private String fullName;
    private String phone;
    private String email;
    private String address;
    private String pendingEmail;
    private boolean emailVerified;
    private Role role;
}
