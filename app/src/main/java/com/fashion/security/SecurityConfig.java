package com.fashion.security;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

/**
 * Cấu hình Spring Security chính cho ứng dụng.
 *
 * - CSRF: tắt (stateless REST API)
 * - Session: STATELESS (dùng JWT thay vì session)
 * - CORS: cho phép frontend gọi API
 * - JWT Filter: chạy trước UsernamePasswordAuthenticationFilter
 * - Phân quyền URL theo role ADMIN / CUSTOMER
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;
    private final CustomUserDetailsService customUserDetailsService;

    // ==================== SECURITY FILTER CHAIN ====================

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // Tắt CSRF vì dùng JWT (stateless, không cần CSRF token)
                .csrf(AbstractHttpConfigurer::disable)

                // Cấu hình CORS cho phép frontend gọi API
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                // Xử lý lỗi 401 - trả JSON thay vì redirect
                .exceptionHandling(exception -> exception
                        .authenticationEntryPoint(jwtAuthenticationEntryPoint)
                )

                // Session: STATELESS — không lưu session trên server
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )

                // Phân quyền URL
                .authorizeHttpRequests(auth -> auth
                        // === PUBLIC ENDPOINTS (không cần đăng nhập) ===
                        .requestMatchers("/api/auth/**").permitAll()

                        // Xem sản phẩm, danh mục — ai cũng xem được
                        .requestMatchers(HttpMethod.GET, "/api/products/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/categories/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/reviews/**").permitAll()

                        // === ADMIN ENDPOINTS ===
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")

                        // === TẤT CẢ CÒN LẠI — phải đăng nhập ===
                        .anyRequest().authenticated()
                )

                // Đăng ký AuthenticationProvider (dùng DaoAuthenticationProvider)
                .authenticationProvider(authenticationProvider())

                // Thêm JWT filter chạy TRƯỚC UsernamePasswordAuthenticationFilter
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    // ==================== AUTHENTICATION ====================

    /**
     * AuthenticationProvider sử dụng CustomUserDetailsService + BCrypt
     * để xác thực email + password khi đăng nhập.
     */
    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider(customUserDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    /**
     * AuthenticationManager — được inject vào AuthService để gọi authenticate().
     */
    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration authenticationConfiguration
    ) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    // ==================== PASSWORD ENCODER ====================

    /**
     * Mã hoá mật khẩu bằng BCrypt (strength = 10, default).
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // ==================== CORS ====================

    /**
     * Cấu hình CORS cho phép frontend ReactJS gọi API.
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // Cho phép frontend origins
        configuration.setAllowedOrigins(List.of(
                "http://localhost:3000",  // ReactJS dev server
                "http://localhost:5173"   // Vite dev server
        ));

        // Cho phép tất cả HTTP methods
        configuration.setAllowedMethods(Arrays.asList(
                "GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"
        ));

        // Cho phép tất cả headers
        configuration.setAllowedHeaders(List.of("*"));

        // Cho phép gửi cookies / Authorization header
        configuration.setAllowCredentials(true);

        // Cache preflight request 1 giờ
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", configuration);
        return source;
    }
}
