package com.fashion.controller.api;

import com.fashion.dto.request.ProcessPaymentRequestDTO;
import com.fashion.dto.response.PaymentResponseDTO;
import com.fashion.service.payment.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

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
        paymentService.processMomoIPN(payload);
        // Với Webhook/IPN, phía MoMo chỉ cần nhận lại HTTP Status 200 hoặc 204 báo hiệu server đã ghi nhận
        return ResponseEntity.noContent().build();
    }

    /**
     * API xử lý URL Return từ MoMo (Trang chuyển hướng người dùng sau khi thanh toán xong trên app/web MoMo)
     */
    @GetMapping("/momo/return")
    public ResponseEntity<String> processMomoReturn(@RequestParam Map<String, String> allParams) {
        String result = paymentService.processMomoReturn(allParams);


        return ResponseEntity.ok(result);
    }
}