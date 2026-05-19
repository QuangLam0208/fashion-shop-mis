package com.fashion.service.payment;

import com.fashion.config.MomoConfig;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MomoService {

    private final MomoConfig momoConfig;

    /**
     * Tạo URL thanh toán MoMo
     */
    public String createPaymentUrl(Long orderId, Double amount) {
        // [MOCK PAYMENT] Thay vì gọi API của MoMo (đang bị lỗi môi trường 11007),
        // Ta chuyển hướng người dùng đến trang Mock giao diện quét QR cục bộ.
        return "/mock/momo-payment?orderId=" + orderId + "&amount=" + amount.longValue();
    }

    /**
     * Tạo URL Return giả lập (Mock) với chữ ký hợp lệ 100%
     * Được dùng bởi trang Mock MoMo khi người dùng bấm "Đã quét mã".
     */
    public String generateMockReturnUrl(String orderId, String amount) {
        String accessKey = momoConfig.getAccessKey().trim();
        String partnerCode = momoConfig.getPartnerCode().trim();
        String secretKey = momoConfig.getSecretKey().trim();
        String returnUrl = momoConfig.getReturnUrl().trim();

        String extraData = "";
        String message = "Thanh toan thanh cong";
        String orderInfo = "Thanh toan don hang " + orderId;
        String orderType = "momo_wallet";
        String requestId = UUID.randomUUID().toString().replace("-", "").substring(0, 16);
        String responseTime = String.valueOf(System.currentTimeMillis());
        String resultCode = "0"; // 0 = Thành công
        String transId = String.valueOf(System.currentTimeMillis() * 2);

        // Chuỗi dữ liệu để Verify (alphabet của key)
        String rawSignature = "accessKey=" + accessKey +
                "&amount=" + amount +
                "&extraData=" + extraData +
                "&message=" + message +
                "&orderId=" + orderId +
                "&orderInfo=" + orderInfo +
                "&orderType=" + orderType +
                "&partnerCode=" + partnerCode +
                "&requestId=" + requestId +
                "&responseTime=" + responseTime +
                "&resultCode=" + resultCode +
                "&transId=" + transId;

        String signature = hmacSha256(rawSignature, secretKey);

        return returnUrl +
                "?partnerCode=" + partnerCode +
                "&accessKey=" + accessKey +
                "&orderId=" + orderId +
                "&requestId=" + requestId +
                "&amount=" + amount +
                "&orderInfo=" + orderInfo +
                "&orderType=" + orderType +
                "&transId=" + transId +
                "&resultCode=" + resultCode +
                "&message=" + message +
                "&payType=qr" +
                "&responseTime=" + responseTime +
                "&extraData=" + extraData +
                "&signature=" + signature;
    }

    /**
     * Xác thực chữ ký MoMo gửi về (IPN hoặc Return URL)
     */
    public boolean verifySignature(Map<String, String> allParams) {
        String signature = allParams.get("signature");
        if (signature == null) return false;

        // Các tham số để tạo chữ ký verify (theo thứ tự alphabet của Key)
        // accessKey, amount, extraData, message, orderId, orderInfo, orderType, partnerCode, requestId, responseTime, resultCode, transId
        String rawSignature = "accessKey=" + allParams.get("accessKey") +
                "&amount=" + allParams.get("amount") +
                "&extraData=" + allParams.get("extraData") +
                "&message=" + allParams.get("message") +
                "&orderId=" + allParams.get("orderId") +
                "&orderInfo=" + allParams.get("orderInfo") +
                "&orderType=" + allParams.get("orderType") +
                "&partnerCode=" + allParams.get("partnerCode") +
                "&requestId=" + allParams.get("requestId") +
                "&responseTime=" + allParams.get("responseTime") +
                "&resultCode=" + allParams.get("resultCode") +
                "&transId=" + allParams.get("transId");

        String recalculatingSecretKey = momoConfig.getSecretKey().trim();
        System.out.println("MoMo Raw Signature (Verify): " + rawSignature);
        String recalculatedSignature = hmacSha256(rawSignature, recalculatingSecretKey);
        return recalculatedSignature.equalsIgnoreCase(signature);
    }

    /**
     * Tạo chữ ký HMAC-SHA256
     */
    private String hmacSha256(String data, String key) {
        try {
            SecretKeySpec secretKeySpec = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(secretKeySpec);
            byte[] rawHmac = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            return toHexString(rawHmac);
        } catch (Exception e) {
            throw new RuntimeException("Lỗi tạo signature: " + e.getMessage());
        }
    }

    private String toHexString(byte[] bytes) {
        StringBuilder sb = new StringBuilder();
        for (byte b : bytes) {
            String hex = Integer.toHexString(0xff & b);
            if (hex.length() == 1) sb.append('0');
            sb.append(hex);
        }
        return sb.toString();
    }
}
