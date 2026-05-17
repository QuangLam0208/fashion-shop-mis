package com.fashion.repository;

import com.fashion.model.User;
import com.fashion.model.enums.Role;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    // Kiểm tra trùng lặp email/SĐT khi đăng ký
    boolean existsByEmail(String email);

    boolean existsByPhone(String phone);

    Optional<User> findByPhone(String phone);

    // Xác thực tài khoản qua link gửi về email
    Optional<User> findByVerificationToken(String verificationToken);

    // Tìm user để đăng nhập hoặc khôi phục mật khẩu
    Optional<User> findByEmail(String email);

    // Chặn trùng lặp data của user khác khi cập nhật thông tin cá nhân
    Boolean existsByEmailAndIdNot(String email, Long id);

    Boolean existsByPhoneAndIdNot(String phone, Long id);

    // Admin
    Page<User> findByRole(Role role, Pageable pageable);

    @Query("SELECT u FROM User u WHERE u.role = ?1 AND (LOWER(u.fullName) LIKE LOWER(CONCAT('%', ?2, '%')) OR LOWER(u.email) LIKE LOWER(CONCAT('%', ?2, '%')) OR LOWER(u.phone) LIKE LOWER(CONCAT('%', ?2, '%')))")
    Page<User> searchCustomers(Role role, String keyword, Pageable pageable);

    // DASHBOARD
    long countByRole(Role role);
}
