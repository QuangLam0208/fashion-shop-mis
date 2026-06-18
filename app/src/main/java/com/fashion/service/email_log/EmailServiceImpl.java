package com.fashion.service.email_log;

import com.fashion.model.EmailLog;
import com.fashion.repository.EmailLogRepository;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.util.Date;

@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;
    private final EmailLogRepository emailLogRepository;

    // Hàm 1: Gửi Email xác thực đăng ký
    @Override
    public Boolean sendVerificationEmail(String email, String token) {
        String subject = "Xác thực tài khoản H&Y Fashion";
        String link = "http://localhost:3000/verify-email?token=" + token;
        String content = "<h3>Chào mừng bạn đến với H&Y Fashion!</h3>"
                + "<p>Vui lòng click vào đường link dưới đây để xác thực tài khoản của bạn:</p>"
                + "<p><a href=\"" + link + "\">" + link + "</a></p>"
                + "<p>Trân trọng</p>";

        return sendEmail(email, subject, content);
    }

    // Hàm 2: Gửi Email quên mật khẩu
    // NHỚ KHAI BÁO HÀM NÀY VÀO TRONG TỆP EmailService.java NỮA NHÉ!
    public Boolean sendResetPasswordEmail(String email, String token) {
        String subject = "Khôi phục mật khẩu H&Y Fashion";
        String link = "http://localhost:3000/reset-password?token=" + token;
        String content = "<h3>Yêu cầu khôi phục mật khẩu</h3>"
                + "<p>Bạn vừa yêu cầu khôi phục mật khẩu. Vui lòng click vào link bên dưới để đặt lại mật khẩu mới:</p>"
                + "<p><a href=\"" + link + "\">" + link + "</a></p>"
                + "<p>Nếu bạn không yêu cầu, vui lòng bỏ qua email này.</p>"
                + "<p>Trân trọng</p>";

        return sendEmail(email, subject, content);
    }

    @Override
    public Boolean sendReturnRejectedEmail(String toEmail, String customerName, Long orderId, String reason) {
        String subject = "Thông báo từ chối yêu cầu đổi trả - Đơn hàng #" + orderId;
        String content = "<h3>Chào " + customerName + ",</h3>"
                + "<p>Rất tiếc, yêu cầu đổi trả cho đơn hàng <b>#" + orderId + "</b> của bạn đã bị từ chối.</p>"
                + "<p><b>Lý do từ quản trị viên:</b> " + reason + "</p>"
                + "<p>Vui lòng liên hệ bộ phận CSKH nếu bạn cần thêm thông tin.</p>"
                + "<p>Trân trọng,<br>Đội ngũ H&Y Fashion.</p>";

        return sendEmail(toEmail, subject, content);
    }

    @Override
    public Boolean sendReturnApprovedEmail(String toEmail, String customerName, Long orderId) {
        String subject = "Yêu cầu đổi trả được chấp nhận - Đơn hàng #" + orderId;
        String content = "<h3>Chào " + customerName + ",</h3>"
                + "<p>Yêu cầu đổi trả cho đơn hàng <b>#" + orderId + "</b> của bạn đã được chấp nhận.</p>"
                + "<p>Hệ thống đang tiến hành kiểm tra và sẽ xử lý hoàn tiền cho bạn trong thời gian sớm nhất.</p>"
                + "<p>Trân trọng,<br>Đội ngũ H&Y Fashion.</p>";

        return sendEmail(toEmail, subject, content);
    }

    @Override
    public Boolean sendRefundCompletedEmail(String toEmail, String customerName, Long orderId, String productName) {
        String subject = "Xác nhận hoàn tiền thành công - Đơn hàng #" + orderId;
        String content = "<h3>Chào " + customerName + ",</h3>"
                + "<p>Chúng tôi xin xác nhận số tiền cho sản phẩm <b>'" + productName + "'</b> thuộc đơn hàng <b>#" + orderId
                + "</b> đã được hoàn trả thành công về tài khoản thanh toán ban đầu của bạn.</p>"
                + "<p>Quá trình hoàn tiền đã hoàn tất nhằm minh bạch hóa tài chính.</p>"
                + "<p>Cảm ơn bạn đã luôn tin tưởng mua sắm tại cửa hàng.</p>"
                + "<p>Trân trọng,<br>Đội ngũ H&Y Fashion.</p>";

        return sendEmail(toEmail, subject, content);
    }

    // Hàm dùng chung để gửi đi
    private Boolean sendEmail(String toEmail, String subject, String content) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(toEmail);
            helper.setSubject(subject);
            helper.setText(content, true);

            mailSender.send(message);
            saveLog(toEmail, "Email Sent: " + subject);
            return true;
        } catch (Exception e) {
            saveLog(toEmail, "FAILED to send email: " + e.getMessage());
            throw new RuntimeException("Không thể gửi email!");
        }
    }

    private void saveLog(String toEmail, String content) {
        EmailLog emailLog = EmailLog.builder()
                .toEmail(toEmail)
                .content(content)
                .sentAt(new Date())
                .build();
        emailLogRepository.save(emailLog);
    }
}