package com.fashion.controller.api;

import com.fashion.model.Notification;
import com.fashion.service.notification.NotificationService;
import com.fashion.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    // GET /api/notifications - Lấy danh sách thông báo
    @GetMapping
    public ResponseEntity<List<Notification>> getMyNotifications() {
        Long userId = SecurityUtils.getAuthenticatedUserId();
        return ResponseEntity.ok(notificationService.getMyNotifications(userId));
    }

    // GET /api/notifications/unread-count - Đếm số lượng thông báo chưa đọc
    @GetMapping("/unread-count")
    public ResponseEntity<Long> countUnread() {
        Long userId = SecurityUtils.getAuthenticatedUserId();
        return ResponseEntity.ok(notificationService.countUnread(userId));
    }

    // PATCH /api/notifications/{id}/read - Đánh dấu đã đọc 1 mục
    @PatchMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok().build();
    }

    // PATCH /api/notifications/read-all - Đánh dấu đã đọc toàn bộ
    @PatchMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead() {
        Long userId = SecurityUtils.getAuthenticatedUserId();
        notificationService.markAllAsRead(userId);
        return ResponseEntity.ok().build();
    }
}
