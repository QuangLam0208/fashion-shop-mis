package com.fashion.controller.api;

import com.fashion.dto.request.ProcessPaymentRequestDTO;
import com.fashion.dto.response.PaymentResponseDTO;
import com.fashion.service.payment.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@Slf4j
public class PaymentController {

    private final PaymentService paymentService;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    /**
     * API xử lý thanh toán cho đơn hàng (Frontend gọi khi user bấm thanh toán)
     */
    @PostMapping("/process")
    public ResponseEntity<PaymentResponseDTO> processPayment(
            @Valid @RequestBody ProcessPaymentRequestDTO requestDTO) {
        PaymentResponseDTO response = paymentService.processPayment(requestDTO);
        return ResponseEntity.ok(response);
    }

    /**
     * API nhận Webhook/IPN từ hệ thống MoMo (Server-to-Server)
     * MoMo sẽ gọi vào endpoint này để cập nhật trạng thái giao dịch (thành công/thất bại) ngầm
     */
    @PostMapping("/momo/ipn")
    public ResponseEntity<Void> processMomoIPN(@RequestBody Map<String, Object> payload) {
        try {
            log.info("Nhận được IPN từ MoMo: {}", payload);
            paymentService.processMomoIPN(payload);

        } catch (Exception e) {
            log.error("Lỗi khi xử lý IPN MoMo: {}", e.getMessage(), e);
        }
        // Với Webhook/IPN, phía MoMo chỉ cần nhận lại HTTP Status 200 hoặc 204 báo hiệu server đã ghi nhận
        return ResponseEntity.noContent().build();
    }

    /**
     * API xử lý URL Return từ MoMo (Trang chuyển hướng người dùng sau khi thanh toán xong trên app/web MoMo)
     */
    @GetMapping("/momo/return")
    public ResponseEntity<Void> processMomoReturn(@RequestParam Map<String, String> allParams) {
        String status = paymentService.processMomoReturn(allParams);
        String orderId = allParams.get("orderId");

        String redirectUrl = frontendUrl + "personal-center?orderId=" + orderId + "&paymentStatus=" + status;

        return ResponseEntity.status(HttpStatus.FOUND)
                .location(URI.create(redirectUrl)).build();
    }
}