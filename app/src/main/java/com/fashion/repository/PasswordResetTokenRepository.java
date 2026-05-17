package com.fashion.repository;

import com.fashion.model.PasswordResetToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {
    // Tìm token khôi phục mật khẩu để xác minh tính hợp lệ
    Optional<PasswordResetToken> findByToken(String token);
}
