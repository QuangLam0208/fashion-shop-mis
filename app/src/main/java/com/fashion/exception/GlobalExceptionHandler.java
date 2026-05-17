package com.fashion.exception;

import com.fashion.dto.response.MessageResponseDTO;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

/**
 * Xử lý exception tập trung cho toàn bộ ứng dụng.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    // 1. XỬ LÝ LỖI VALIDATION (@Valid) -> Trả về 400 Bad Request
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationErrors(MethodArgumentNotValidException ex) {
        Map<String, String> fieldErrors = new HashMap<>();
        for (FieldError error : ex.getBindingResult().getFieldErrors()) {
            fieldErrors.put(error.getField(), error.getDefaultMessage());
        }

        Map<String, Object> response = new HashMap<>();
        response.put("status", HttpStatus.BAD_REQUEST.value());
        response.put("message", "Dữ liệu không hợp lệ");
        response.put("errors", fieldErrors);

        return ResponseEntity.badRequest().body(response);
    }

    // 2. XỬ LÝ LỖI CHƯA ĐĂNG NHẬP HOẶC TOKEN SAI -> Trả về 401 Unauthorized
    @ExceptionHandler(UnauthenticatedException.class)
    public ResponseEntity<MessageResponseDTO> handleUnauthenticated(UnauthenticatedException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(MessageResponseDTO.builder()
                        .message(ex.getMessage())
                        .build());
    }

    // 3. XỬ LÝ LỖI LOGIC NGHIỆP VỤ (Trùng email, sai mật khẩu...) -> Trả về 400 Bad Request
    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<MessageResponseDTO> handleBadRequestException(BadRequestException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(MessageResponseDTO.builder()
                        .message(ex.getMessage())
                        .build());
    }

    // 4. XỬ LÝ CÁC LỖI HỆ THỐNG KHÔNG KIỂM SOÁT ĐƯỢC (NullPointer, Đứt DB...) -> Trả về 500
    @ExceptionHandler(Exception.class)
    public ResponseEntity<MessageResponseDTO> handleGlobalException(Exception ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(MessageResponseDTO.builder()
                        .message("Lỗi hệ thống Server: " + ex.getMessage())
                        .build());
    }
}