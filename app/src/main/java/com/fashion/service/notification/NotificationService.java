package com.fashion.service.notification;

import com.fashion.model.Notification;
import com.fashion.model.User;

import java.util.List;

public interface NotificationService {
    void createNotification(User user, String title, String content, String type, Long relatedId);
    List<Notification> getMyNotifications(Long userId);
    long countUnread(Long userId);
    void markAsRead(Long notificationId);
    void markAllAsRead(Long userId);
}
