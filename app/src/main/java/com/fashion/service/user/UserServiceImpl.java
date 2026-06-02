package com.fashion.service.user;

import com.fashion.dto.request.ChangePasswordRequestDTO;
import com.fashion.dto.request.UpdateCustomerStatusRequestDTO;
import com.fashion.dto.request.UpdateProfileRequestDTO;
import com.fashion.dto.response.*;

import com.fashion.exception.BadRequestException;
import com.fashion.exception.ResourceNotFoundException;
import com.fashion.model.Address;
import com.fashion.model.OrderItem;
import com.fashion.model.User;
import com.fashion.model.enums.Role;
import com.fashion.model.enums.UserStatus;
import com.fashion.repository.UserRepository;
import com.fashion.service.email_log.EmailService;
import com.fashion.util.SecurityUtils; // Nhúng thẳng Utils vào Service
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    @Override
    public ProfileResponseDTO getProfile() {
        Long userId = SecurityUtils.getAuthenticatedUserId();
        User user = findUserById(userId);

        List<AddressResponseDTO> addressDTOs = user.getAddresses().stream()
                .map(a -> AddressResponseDTO.builder()
                        .id(a.getId())
                        .fullAddress(a.getFullAddress())
                        .receiverName(a.getReceiverName())
                        .receiverPhone(a.getReceiverPhone())
                        .isDefault(a.isDefault())
                        .build())
                .collect(Collectors.toList());

        return ProfileResponseDTO.builder()
                .userId(user.getId())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .email(user.getEmail())
                .address(addressDTOs)
                .emailVerified(user.isEmailVerified())
                .role(user.getRole())
                .build();
    }

    @Override
    @Transactional
    public ProfileResponseDTO updateProfile(UpdateProfileRequestDTO dto) {
        Long userId = SecurityUtils.getAuthenticatedUserId();
        User user = findUserById(userId);

        if (dto.getPhone() != null && !dto.getPhone().isBlank()) {
            if (userRepository.existsByPhoneAndIdNot(dto.getPhone(), userId)) {
                throw new BadRequestException("Số điện thoại đã được sử dụng bởi tài khoản khác!");
            }
            user.setPhone(dto.getPhone());
        }

        if (dto.getEmail() != null && !dto.getEmail().isBlank()) {
            if (!dto.getEmail().equalsIgnoreCase(user.getEmail())) {
                if (userRepository.existsByEmailAndIdNot(dto.getEmail(), userId)) {
                    throw new BadRequestException("Email đã được sử dụng bởi tài khoản khác!");
                }

                user.setPendingEmail(dto.getEmail());
                String token = createVerificationToken(user);
                try {
                    emailService.sendVerificationEmail(user.getPendingEmail(), token);
                } catch (Exception e) {
                    System.err.println("Lỗi khi gửi mail xác thực cho email mới: " + e.getMessage());
                }
            }
        }

        if (dto.getFullName() != null && !dto.getFullName().isBlank()) {
            user.setFullName(capitalizeName(dto.getFullName()));
        }
        user = userRepository.save(user);

        List<AddressResponseDTO> addressDTOs = user.getAddresses().stream()
                .map(a -> AddressResponseDTO.builder()
                        .id(a.getId())
                        .fullAddress(a.getFullAddress())
                        .receiverName(a.getReceiverName())
                        .receiverPhone(a.getReceiverPhone())
                        .isDefault(a.isDefault())
                        .build())
                .collect(Collectors.toList());

        return ProfileResponseDTO.builder()
                .userId(user.getId())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .email(user.getEmail())
                .address(addressDTOs)
                .pendingEmail(user.getPendingEmail())
                .emailVerified(user.isEmailVerified())
                .role(user.getRole())
                .build();
    }

    @Override
    @Transactional
    public MessageResponseDTO changePassword(ChangePasswordRequestDTO dto) {
        Long userId = SecurityUtils.getAuthenticatedUserId();
        User user = findUserById(userId);

        if (!passwordEncoder.matches(dto.getCurrentPassword(), user.getPassword())) {
            throw new BadRequestException("Mật khẩu hiện tại không đúng!");
        }

        if (dto.getNewPassword().length() < 6) {
            throw new BadRequestException("Mật khẩu mới phải có ít nhất 6 ký tự!");
        }

        if (!dto.getNewPassword().equals(dto.getConfirmNewPassword())) {
            throw new BadRequestException("Mật khẩu xác nhận không khớp!");
        }

        user.setPassword(passwordEncoder.encode(dto.getNewPassword()));
        userRepository.save(user);

        return MessageResponseDTO.builder()
                .message("Đổi mật khẩu thành công!")
                .build();
    }

    @Override
    @Transactional
    public MessageResponseDTO deleteAccount() {
        Long userId = SecurityUtils.getAuthenticatedUserId();
        User user = findUserById(userId);
        user.setStatus(UserStatus.BLOCKED);
        userRepository.save(user);

        return MessageResponseDTO.builder()
                .message("Tài khoản đã được xóa (khóa) thành công!")
                .build();
    }

    @Override
    @Transactional
    public MessageResponseDTO resendVerification() {
        Long userId = SecurityUtils.getAuthenticatedUserId();
        User user = findUserById(userId);

        String targetEmail = (user.getPendingEmail() != null) ? user.getPendingEmail() : user.getEmail();

        if (user.getPendingEmail() == null && user.isEmailVerified()) {
            throw new BadRequestException("Tài khoản đã được xác thực trước đó!");
        }

        String token = createVerificationToken(user);
        userRepository.save(user);

        try {
            emailService.sendVerificationEmail(targetEmail, token);
        } catch (Exception e) {
            throw new BadRequestException("Lỗi khi gửi lại email xác thực: " + e.getMessage());
        }

        return MessageResponseDTO.builder()
                .message("Email xác thực đã được gửi lại thành công đến " + targetEmail)
                .build();
    }

    @Override
    public Page<CustomerSummaryResponseDTO> getAllCustomers(String keyword, Pageable pageable) {
        Page<User> customersPage;
        if (keyword == null || keyword.trim().isEmpty()) {
            customersPage = userRepository.findByRole(Role.CUSTOMER, pageable);
        } else {
            customersPage = userRepository.searchCustomers(Role.CUSTOMER, keyword.toLowerCase(), pageable);
        }

        return customersPage.map(u -> CustomerSummaryResponseDTO.builder()
                .userId(u.getId())
                .fullName(u.getFullName())
                .email(u.getEmail())
                .phone(u.getPhone())
                .status(u.getStatus())
                .build());
    }

    @Override
    public CustomerDetailResponseDTO getCustomerDetail(Long customerId) {
        User user = findUserById(customerId);
        if (user.getRole() != Role.CUSTOMER) {
            throw new BadRequestException("Tài khoản không phải là khách hàng!");
        }

        List<OrderSummaryResponseDTO> orderHistory = user.getOrders().stream().map(o -> {
            Map<String, Integer> statusSummary = new HashMap<>();
            for (OrderItem item : o.getOrderItems()) {
                String statusStr = item.getStatus().name();
                statusSummary.put(statusStr, statusSummary.getOrDefault(statusStr, 0) + 1);
            }

            return OrderSummaryResponseDTO.builder()
                    .orderId(o.getId())
                    .orderDate(o.getOrderDate())
                    .totalAmount(o.getTotalAmount())
                    .paymentMethod(o.getPaymentMethod())
                    .itemCount(o.getOrderItems().size())
                    .statusSummary(statusSummary)
                    .build();
        }).collect(Collectors.toList());

        String defaultAddressStr = user.getAddresses().stream()
                .filter(Address::isDefault)
                .map(Address::getFullAddress)
                .findFirst()
                .orElse(user.getAddresses().isEmpty() ? "" : user.getAddresses().get(0).getFullAddress());

        return CustomerDetailResponseDTO.builder()
                .userId(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .address(defaultAddressStr)
                .status(user.getStatus())
                .orderHistory(orderHistory)
                .build();
    }

    @Override
    @Transactional
    public MessageResponseDTO updateCustomerStatus(Long customerId, UpdateCustomerStatusRequestDTO dto) {
        User user = findUserById(customerId);
        if (user.getRole() != Role.CUSTOMER) {
            throw new BadRequestException("Chỉ có thể cập nhật trạng thái của khách hàng!");
        }
        if (dto.getStatus() == null) {
            throw new BadRequestException("Trạng thái không hợp lệ!");
        }

        user.setStatus(dto.getStatus());
        userRepository.save(user);

        return MessageResponseDTO.builder()
                .message("Cập nhật trạng thái khách hàng thành công!")
                .build();
    }

    private User findUserById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Người dùng không tồn tại!"));
    }

    private String createVerificationToken(User user) {
        String token = UUID.randomUUID().toString();
        user.setVerificationToken(token);
        user.setVerificationTokenExpiryDate(Instant.now().plus(24, ChronoUnit.HOURS));
        return token;
    }

    private String capitalizeName(String name) {
        if (name == null || name.isBlank()) return "";
        String[] words = name.toLowerCase().split("\\s+");
        StringBuilder sb = new StringBuilder();
        for (String word : words) {
            if (!word.isEmpty()) {
                sb.append(Character.toUpperCase(word.charAt(0)))
                        .append(word.substring(1).toLowerCase())
                        .append(" ");
            }
        }
        return sb.toString().trim();
    }
}