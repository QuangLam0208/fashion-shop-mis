package com.fashion.repository;

import com.fashion.model.Otp;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OtpRepository extends JpaRepository<Otp, Long> {
    // Xác minh mã OTP khách hàng nhập vào có khớp với Email đang yêu cầu không
    Optional<Otp> findByUserEmailAndCode(String email, String code);

    // Xóa mã OTP cũ của user sau khi đã xác thực thành công hoặc khi tạo mã mới
    void deleteByUserEmail(String email);
}
