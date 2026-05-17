package com.fashion.security;

import com.fashion.repository.TokenRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Filter chạy trên MỌI request HTTP để kiểm tra JWT token.
 *
 * Luồng xử lý:
 * 1. Lấy header "Authorization: Bearer <token>"
 * 2. Extract email từ token
 * 3. Load UserDetails từ DB
 * 4. Check token trong DB (chưa bị revoked/expired)
 * 5. Validate chữ ký + hạn sử dụng
 * 6. Set Authentication vào SecurityContext
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider jwtTokenProvider;
    private final CustomUserDetailsService userDetailsService;
    private final TokenRepository tokenRepository;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        // 1. Lấy Authorization header
        final String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        final String jwt = authHeader.substring(7);

        try {
            // 2. Extract email từ token
            final String userEmail = jwtTokenProvider.extractUsername(jwt);

            // 3. Chỉ xử lý nếu chưa có authentication trong context
            if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {

                // 4. Load user từ DB
                UserDetails userDetails = userDetailsService.loadUserByUsername(userEmail);

                // 5. Check token trong DB: chưa bị revoked hoặc expired
                boolean isTokenValidInDb = tokenRepository.findByToken(jwt)
                        .map(t -> !t.isExpired() && !t.isRevoked())
                        .orElse(false);

                // 6. Validate JWT signature + expiry + DB status
                if (isTokenValidInDb && jwtTokenProvider.isTokenValid(jwt, userDetails)) {

                    UsernamePasswordAuthenticationToken authToken =
                            new UsernamePasswordAuthenticationToken(
                                    userDetails,
                                    null,
                                    userDetails.getAuthorities()
                            );

                    authToken.setDetails(
                            new WebAuthenticationDetailsSource().buildDetails(request)
                    );

                    // 7. Set vào SecurityContext
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            }
        } catch (Exception e) {
            log.error("Không thể xác thực JWT token: {}", e.getMessage());
        }

        filterChain.doFilter(request, response);
    }
}
