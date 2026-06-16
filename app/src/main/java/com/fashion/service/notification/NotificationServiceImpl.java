package com.fashion.service.notification;

import com.fashion.exception.ForbiddenException;
import com.fashion.exception.ResourceNotFoundException;
import com.fashion.model.Notification;
import com.fashion.model.User;
import com.fashion.model.enums.NotificationType;
import com.fashion.repository.NotificationRepository;
import com.fashion.repository.UserRepository;
import com.fashion.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public void createNotification(Long userId, String title, String content, String type, Long relatedId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng!"));
        Notification notification = Notification.builder()
                .user(user)
                .title(title)
                .content(content)
                .type(NotificationType.valueOf(type))
                .isRead(false)
                .relatedId(relatedId)
                .build();
        notificationRepository.save(notification);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Notification> getMyNotifications(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @Override
    @Transactional(readOnly = true)
    public long countUnread(Long userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    @Override
    @Transactional
    public void markAsRead(Long notificationId) {
        Long userId = SecurityUtils.getAuthenticatedUserId();
        notificationRepository.findById(notificationId).ifPresent(n -> {
            if (!n.getUser().getId().equals(userId)) {
                throw new ForbiddenException("Bạn không có quyền sửa thông báo này!");
            }
            n.setRead(true);
            notificationRepository.save(n);
        });
    }

    @Override
    @Transactional
    public void markAllAsRead(Long userId) {
        List<Notification> unread = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
        unread.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unread);
    }
}
