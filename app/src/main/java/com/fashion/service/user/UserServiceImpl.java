package com.fashion.service.user;

import com.fashion.dto.request.ChangePasswordRequestDTO;
import com.fashion.dto.request.UpdateCustomerStatusRequestDTO;
import com.fashion.dto.request.UpdateProfileRequestDTO;
import com.fashion.dto.response.*;

import com.fashion.model.Address;
import com.fashion.model.OrderItem;
import com.fashion.model.User;
import com.fashion.model.enums.Role;
import com.fashion.model.enums.UserStatus;
import com.fashion.repository.UserRepository;
import com.fashion.service.email_log.EmailService;
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

    // --- QUẢN LÝ THÔNG TIN CÁ NHÂN ---

    @Override
    public ProfileResponseDTO getProfile(Long userId) {
        User user = findUserById(userId);

        // Lấy địa chỉ mặc định (hoặc địa chỉ đầu tiên nếu không có mặc định)
        String defaultAddressStr = user.getAddresses().stream()
                .filter(Address::isDefault)
                .map(Address::getFullAddress)
                .findFirst()
                .orElse(user.getAddresses().isEmpty() ? "" : user.getAddresses().get(0).getFullAddress());

        return ProfileResponseDTO.builder()
                .userId(user.getId())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .email(user.getEmail())
                .address(defaultAddressStr) // Đã sửa đổi map sang thực thể Address
                .emailVerified(user.isEmailVerified())
                .role(user.getRole())
                .build();
    }

    @Override
    @Transactional
    public ProfileResponseDTO updateProfile(Long userId, UpdateProfileRequestDTO dto) {
        User user = findUserById(userId);

        // --- Cập nhật Phone ---
        if (dto.getPhone() != null && !dto.getPhone().isBlank()) {
            if (userRepository.existsByPhoneAndIdNot(dto.getPhone(), userId)) {
                throw new RuntimeException("Số điện thoại đã được sử dụng bởi tài khoản khác!");
            }
            user.setPhone(dto.getPhone());
        }

        // --- Quy trình Thay đổi Email (Xác thực trước - Đổi sau) ---
        if (dto.getEmail() != null && !dto.getEmail().isBlank()) {
            if (!dto.getEmail().equalsIgnoreCase(user.getEmail())) {

                // Kiểm tra xem email mới có bị trùng với người khác không
                if (userRepository.existsByEmailAndIdNot(dto.getEmail(), userId)) {
                    throw new RuntimeException("Email đã được sử dụng bởi tài khoản khác!");
                }

                // Lưu email mới vào pendingEmail và bắt đầu quy trình xác thực
                user.setPendingEmail(dto.getEmail());

                String token = createVerificationToken(user);
                try {
                    // Gửi mail xác thực đến EMAIL MỚI
                    emailService.sendVerificationEmail(user.getPendingEmail(), token);
                } catch (Exception e) {
                    System.err.println("Lỗi khi gửi mail xác thực cho email mới: " + e.getMessage());
                }
            }
        }

        // --- Cập nhật FullName ---
        if (dto.getFullName() != null && !dto.getFullName().isBlank()) {
            user.setFullName(capitalizeName(dto.getFullName()));
        }

        // --- Cập nhật Address (Ánh xạ sang bảng addresses riêng biệt) ---
        if (dto.getAddress() != null && !dto.getAddress().isBlank()) {
            // Tìm kiếm địa chỉ mặc định hiện tại hoặc chọn địa chỉ đầu tiên nếu chưa gắn default
            Address defaultAddress = user.getAddresses().stream()
                    .filter(Address::isDefault)
                    .findFirst()
                    .orElse(user.getAddresses().isEmpty() ? null : user.getAddresses().get(0));

            if (defaultAddress != null) {
                // Nếu đã có địa chỉ, cập nhật lại chuỗi fullAddress
                defaultAddress.setFullAddress(dto.getAddress());
                if (defaultAddress.getReceiverName() == null || defaultAddress.getReceiverName().isBlank()) {
                    defaultAddress.setReceiverName(user.getFullName());
                }
                if (defaultAddress.getReceiverPhone() == null || defaultAddress.getReceiverPhone().isBlank()) {
                    defaultAddress.setReceiverPhone(user.getPhone());
                }
            } else {
                // Nếu tài khoản chưa từng tạo địa chỉ, khởi tạo thực thể Address mới
                Address newAddress = Address.builder()
                        .user(user)
                        .fullAddress(dto.getAddress())
                        .receiverName(user.getFullName())
                        .receiverPhone(user.getPhone())
                        .isDefault(true)
                        .build();
                user.getAddresses().add(newAddress);
            }
        }

        user = userRepository.save(user);

        // Lấy lại chuỗi địa chỉ vừa cập nhật để trả về dữ liệu chuẩn cho DTO
        String defaultAddressStr = user.getAddresses().stream()
                .filter(Address::isDefault)
                .map(Address::getFullAddress)
                .findFirst()
                .orElse(user.getAddresses().isEmpty() ? "" : user.getAddresses().get(0).getFullAddress());

        return ProfileResponseDTO.builder()
                .userId(user.getId())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .email(user.getEmail()) // Vẫn trả về email cũ cho đến khi xác thực xong
                .address(defaultAddressStr)
                .pendingEmail(user.getPendingEmail())
                .emailVerified(user.isEmailVerified())
                .role(user.getRole())
                .build();
    }

    // --- ĐỔI MẬT KHẨU ---

    @Override
    @Transactional
    public MessageResponseDTO changePassword(Long userId, ChangePasswordRequestDTO dto) {
        User user = findUserById(userId);

        if (!passwordEncoder.matches(dto.getCurrentPassword(), user.getPassword())) {
            throw new RuntimeException("Mật khẩu hiện tại không đúng!");
        }

        if (dto.getNewPassword().length() < 6) {
            throw new RuntimeException("Mật khẩu mới phải có ít nhất 6 ký tự!");
        }

        if (!dto.getNewPassword().equals(dto.getConfirmNewPassword())) {
            throw new RuntimeException("Mật khẩu xác nhận không khớp!");
        }

        user.setPassword(passwordEncoder.encode(dto.getNewPassword()));
        userRepository.save(user);

        return MessageResponseDTO.builder()
                .message("Đổi mật khẩu thành công!")
                .build();
    }

    // --- XÓA TÀI KHOẢN ---

    @Override
    @Transactional
    public MessageResponseDTO deleteAccount(Long userId) {
        User user = findUserById(userId);
        user.setStatus(UserStatus.BLOCKED);
        userRepository.save(user);

        return MessageResponseDTO.builder()
                .message("Tài khoản đã được xóa (khóa) thành công!")
                .build();
    }

    // --- XÁC THỰC EMAIL ---

    @Override
    @Transactional
    public MessageResponseDTO resendVerification(Long userId) {
        User user = findUserById(userId);

        // Xác định email gửi đến (ưu tiên pendingEmail nếu đang đổi mail)
        String targetEmail = (user.getPendingEmail() != null) ? user.getPendingEmail() : user.getEmail();

        if (user.getPendingEmail() == null && user.isEmailVerified()) {
            throw new RuntimeException("Tài khoản đã được xác thực trước đó!");
        }

        String token = createVerificationToken(user);
        userRepository.save(user);

        try {
            emailService.sendVerificationEmail(targetEmail, token);
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi gửi lại email xác thực: " + e.getMessage());
        }

        return MessageResponseDTO.builder()
                .message("Email xác thực đã được gửi lại thành công đến " + targetEmail)
                .build();
    }

    // --- PRIVATE HELPERS ---

    private User findUserById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại!"));
    }

    private String createVerificationToken(User user) {
        String token = UUID.randomUUID().toString();
        user.setVerificationToken(token);
        user.setVerificationTokenExpiryDate(Instant.now().plus(24, ChronoUnit.HOURS));
        return token;
    }

    private String capitalizeName(String name) {
        if (name == null || name.isBlank())
            return "";
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

    // --- QUẢN LÝ KHÁCH HÀNG (ADMIN) ---

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
            throw new RuntimeException("Tài khoản không phải là khách hàng!");
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

        // Lấy địa chỉ hiển thị cho Admin xem chi tiết khách hàng
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
                .address(defaultAddressStr) // Đã sửa đổi
                .status(user.getStatus())
                .orderHistory(orderHistory)
                .build();
    }

    @Override
    @Transactional
    public MessageResponseDTO updateCustomerStatus(Long customerId, UpdateCustomerStatusRequestDTO dto) {
        User user = findUserById(customerId);
        if (user.getRole() != Role.CUSTOMER) {
            throw new RuntimeException("Chỉ có thể cập nhật trạng thái của khách hàng!");
        }
        if (dto.getStatus() == null) {
            throw new RuntimeException("Trạng thái không hợp lệ!");
        }

        user.setStatus(dto.getStatus());
        userRepository.save(user);

        return MessageResponseDTO.builder()
                .message("Cập nhật trạng thái khách hàng thành công!")
                .build();
    }
}