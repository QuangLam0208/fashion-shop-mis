package com.fashion.scheduler;

import com.fashion.model.Order;
import com.fashion.model.OrderItem;
import com.fashion.model.enums.OrderStatus;
import com.fashion.repository.OrderRepository;
import com.fashion.repository.UserCouponRepository;
import com.fashion.service.order.OrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class OrderExpirationTask {

    private final OrderRepository orderRepository;
    private final OrderService orderService;
    private final UserCouponRepository userCouponRepository;

    /**
     * Chạy mỗi phút để quét các đơn hàng PENDING_PAYMENT quá 10 phút.
     */
    @Scheduled(fixedRate = 60000)
    @Transactional
    public void cleanupExpiredOrders() {
        Date tenMinutesAgo = new Date(System.currentTimeMillis() - 10 * 60 * 1000);
        List<Order> expiredOrders = orderRepository.findByStatusAndOrderDateBefore(OrderStatus.PENDING_PAYMENT, tenMinutesAgo);

        if (expiredOrders.isEmpty()) {
            return;
        }

        log.info("Phát hiện {} đơn hàng quá hạn thanh toán. Đang tiến hành hủy...", expiredOrders.size());

        for (Order order : expiredOrders) {
            log.info("Hủy đơn hàng #{} do quá hạn thanh toán 10 phút.", order.getId());

            // 1. Cập nhật trạng thái đơn hàng sang PAYMENT_EXPIRED
            order.setStatus(OrderStatus.PAYMENT_EXPIRED);

            // 2. Cập nhật trạng thái của từng món đồ
            for (OrderItem item : order.getOrderItems()) {
                item.setStatus(OrderStatus.PAYMENT_EXPIRED);
            }

            // 3. Hoàn kho
            orderService.revertInventory(order.getId());

            // 4. Hoàn trạng thái Coupon (nếu có)
            if (order.getCoupon() != null) {
                userCouponRepository.findByUserIdAndCouponCode(order.getUser().getId(), order.getCoupon().getCode())
                        .ifPresent(uc -> {
                            uc.setUsed(false);
                            userCouponRepository.save(uc);
                            log.info("Đã hoàn lại Coupon [{}] cho user [{}]", order.getCoupon().getCode(), order.getUser().getId());
                        });
            }

            orderRepository.save(order);
        }
    }
}
