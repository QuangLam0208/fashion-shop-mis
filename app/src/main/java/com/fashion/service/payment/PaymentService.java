package com.fashion.service.payment;

import com.fashion.dto.request.ProcessPaymentRequestDTO;
import com.fashion.dto.response.PaymentResponseDTO;
import com.fashion.model.Order;

import java.util.Map;

public interface PaymentService {

    PaymentResponseDTO processPayment(ProcessPaymentRequestDTO dto);

    // Xử lý MoMo
    void processMomoIPN(Map<String, Object> payload);
    String processMomoReturn(Map<String, String> allParams);
}
