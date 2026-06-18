package com.fashion.service.email_log;

public interface EmailService {
    Boolean sendVerificationEmail (String email, String token);
    Boolean sendResetPasswordEmail(String email, String token);
    Boolean sendReturnRejectedEmail(String toEmail, String customerName, Long orderId, String reason);
    Boolean sendReturnApprovedEmail(String toEmail, String customerName, Long orderId);
    Boolean sendRefundCompletedEmail(String toEmail, String customerName, Long orderId, String productName);
}
