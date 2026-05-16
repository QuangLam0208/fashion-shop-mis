package com.fashion.repository;

import com.fashion.model.Token;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TokenRepository extends JpaRepository<Token, Long> {
    // Tìm token đăng nhập hiện tại để vô hiệu hóa (Đăng xuất)
    Optional<Token> findByToken(String token);

    // Lấy toàn bộ token ĐANG HỢP LỆ của 1 user để Force Logout (Đăng xuất khỏi mọi thiết bị)
    @Query("SELECT t FROM Token t WHERE t.user.id = :userId AND t.expired = false AND t.revoked = false")
    List<Token> findAllValidTokensByUser(@Param("userId") Long userId);
}
