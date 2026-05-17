package com.fashion.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.UnsupportedJwtException;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SignatureException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

/**
 * Component xử lý toàn bộ logic JWT:
 * - Tạo access token (30 phút) và refresh token (7 ngày)
 * - Parse token lấy thông tin (email, role, expiry...)
 * - Validate token (chữ ký + hạn sử dụng)
 */
@Slf4j
@Component
public class JwtTokenProvider {

    @Value("${jwt.secret}")
    private String secretKey;

    @Value("${jwt.access-token-expiration}")
    private long accessTokenExpiration;

    @Value("${jwt.refresh-token-expiration}")
    private long refreshTokenExpiration;

    /**
     * Tạo Access Token chứa email (subject) và role.
     */
    public String generateAccessToken(UserDetails userDetails) {
        Map<String, Object> extraClaims = new HashMap<>();
        // Lưu role vào claim để frontend có thể decode
        extraClaims.put("role", userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .findFirst()
                .orElse("ROLE_CUSTOMER"));
        return buildToken(extraClaims, userDetails, accessTokenExpiration);
    }

    /**
     * Tạo Refresh Token (không chứa extra claims, chỉ có subject + expiry).
     */
    public String generateRefreshToken(UserDetails userDetails) {
        return buildToken(new HashMap<>(), userDetails, refreshTokenExpiration);
    }

    private String buildToken(Map<String, Object> extraClaims,
            UserDetails userDetails,
            long expiration) {
        return Jwts.builder()
                .claims(extraClaims)
                .subject(userDetails.getUsername()) // email
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSigningKey())
                .compact();
    }

    /**
     * Lấy email (subject) từ token.
     */
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    /**
     * Lấy ngày hết hạn từ token.
     */
    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    /**
     * Generic method để extract bất kỳ claim nào từ token.
     */
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    /**
     * Kiểm tra token hợp lệ: đúng user + chưa hết hạn.
     */
    public boolean isTokenValid(String token, UserDetails userDetails) {
        try {
            final String username = extractUsername(token);
            return username.equals(userDetails.getUsername()) && !isTokenExpired(token);
        } catch (ExpiredJwtException e) {
            log.warn("JWT token đã hết hạn: {}", e.getMessage());
        } catch (MalformedJwtException e) {
            log.warn("JWT token không đúng định dạng: {}", e.getMessage());
        } catch (UnsupportedJwtException e) {
            log.warn("JWT token không được hỗ trợ: {}", e.getMessage());
        } catch (SignatureException e) {
            log.warn("Chữ ký JWT không hợp lệ: {}", e.getMessage());
        } catch (IllegalArgumentException e) {
            log.warn("JWT claims string rỗng: {}", e.getMessage());
        }
        return false;
    }

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    // ==================== KEY ====================

    private SecretKey getSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
