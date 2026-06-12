package com.fashion.exception;

import com.fashion.dto.response.MessageResponseDTO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;
import org.springframework.security.access.AccessDeniedException;
/**
 * Xử lý exception tập trung cho toàn bộ ứng dụng.
 */
@RestControllerAdvice
@Slf4j
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

    // 2.5 XỬ LÝ LỖI ĐỌC DỮ LIỆU JSON (Sai định dạng, sai kiểu dữ liệu) -> Trả về 400 Bad Request
    @ExceptionHandler(org.springframework.http.converter.HttpMessageNotReadableException.class)
    public ResponseEntity<MessageResponseDTO> handleHttpMessageNotReadable(org.springframework.http.converter.HttpMessageNotReadableException ex) {
        log.error("Lỗi parse JSON/Body: ", ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(MessageResponseDTO.builder()
                        .message("Dữ liệu gửi lên không đúng định dạng hoặc sai kiểu dữ liệu. Vui lòng kiểm tra lại payload (Ví dụ: truyền null cho field boolean/số, hoặc sai định dạng ngày tháng).")
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
    // 4. XỬ LÝ LỖI KHÔNG TÌM THẤY TÀI NGUYÊN (Category cha, Product...) -> Trả về 404 Not Found
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<MessageResponseDTO> handleResourceNotFound(ResourceNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(MessageResponseDTO.builder()
                        .message(ex.getMessage())
                        .build());
    }
    // 5. XỬ LÝ CÁC LỖI HỆ THỐNG KHÔNG KIỂM SOÁT ĐƯỢC (NullPointer, Đứt DB...) -> Trả về 500
    @ExceptionHandler(Exception.class)
    public ResponseEntity<MessageResponseDTO> handleGlobalException(Exception ex) {
        log.error("Hệ thống xảy ra lỗi không kiểm soát: ", ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(MessageResponseDTO.builder()
                        .message("Đã xảy ra lỗi hệ thống nghiêm trọng. Vui lòng liên hệ quản trị viên để được hỗ trợ.")
                        .build());
    }
    //6. XỬ LÍ khi user có quyền CUSTOMER cố gắng truy cập /api/admin/
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<MessageResponseDTO> handleAccessDeniedException(AccessDeniedException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(MessageResponseDTO.builder()
                        .message("Bạn không có quyền truy cập vào tài nguyên này (Yêu cầu quyền ADMIN).")
                        .build());
    }
}