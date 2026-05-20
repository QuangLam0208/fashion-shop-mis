package com.fashion.util;

import com.fashion.model.User;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
public class SecurityUtils {
    /**
     * Lấy ID của người dùng đang đăng nhập từ SecurityContext.
     * @return Long userId
     * @throws RuntimeException nếu người dùng chưa đăng nhập hoặc không hợp lệ.
     */
    public static Long getAuthenticatedUserId() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof User user) {
            return user.getId();
        }
        throw new RuntimeException("Bạn không có quyền truy cập vào tài nguyên này. Vui lòng đăng nhập!");
    }
}
