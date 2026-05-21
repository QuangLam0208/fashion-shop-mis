package com.fashion.service.user;

import com.fashion.dto.request.ChangePasswordRequestDTO;
import com.fashion.dto.request.UpdateCustomerStatusRequestDTO;
import com.fashion.dto.request.UpdateProfileRequestDTO;
import com.fashion.dto.response.CustomerDetailResponseDTO;
import com.fashion.dto.response.CustomerSummaryResponseDTO;
import com.fashion.dto.response.MessageResponseDTO;
import com.fashion.dto.response.ProfileResponseDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface UserService {
    // Quản lý thông tin cá nhân
    ProfileResponseDTO getProfile(Long userId);

    ProfileResponseDTO updateProfile(Long userId, UpdateProfileRequestDTO dto);

    // Đổi mật khẩu
    MessageResponseDTO changePassword(Long userId, ChangePasswordRequestDTO dto);

    // Xóa tài khoản
    MessageResponseDTO deleteAccount(Long userId);

    // Xác thực email
    MessageResponseDTO resendVerification(Long userId);

    // Admin
    Page<CustomerSummaryResponseDTO> getAllCustomers(String keyword, Pageable pageable);

    CustomerDetailResponseDTO getCustomerDetail(Long customerId);

    MessageResponseDTO updateCustomerStatus(Long customerId, UpdateCustomerStatusRequestDTO dto);
}
