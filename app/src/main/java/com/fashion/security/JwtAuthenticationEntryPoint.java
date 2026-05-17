package com.fashion.security;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;

/**
 * Xử lý lỗi khi request không có token hoặc token không hợp lệ.
 * Trả về JSON response 401 Unauthorized thay vì redirect tới trang login.
 */
@Slf4j
@Component
public class JwtAuthenticationEntryPoint implements AuthenticationEntryPoint {

    @Override
    public void commence(
            HttpServletRequest request,
            HttpServletResponse response,
            AuthenticationException authException
    ) throws IOException, ServletException {

        log.error("Unauthorized error: {}", authException.getMessage());

        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setCharacterEncoding("UTF-8");

        String jsonBody = """
                {
                    "success": false,
                    "status": 401,
                    "error": "Unauthorized",
                    "message": "Bạn cần đăng nhập để truy cập tài nguyên này.",
                    "path": "%s"
                }
                """.formatted(request.getServletPath());

        response.getWriter().write(jsonBody);
    }
}
