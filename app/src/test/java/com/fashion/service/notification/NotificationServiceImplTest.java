package com.fashion.service.notification;

import com.fashion.exception.ForbiddenException;
import com.fashion.model.Notification;
import com.fashion.model.User;
import com.fashion.repository.NotificationRepository;
import com.fashion.util.SecurityUtils;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificationServiceImplTest {

    @Mock
    private NotificationRepository notificationRepository;

    @InjectMocks
    private NotificationServiceImpl notificationService;

    private MockedStatic<SecurityUtils> mockedSecurityUtils;

    @BeforeEach
    void setUp() {
        mockedSecurityUtils = mockStatic(SecurityUtils.class);
    }

    @AfterEach
    void tearDown() {
        mockedSecurityUtils.close();
    }

    @Test
    void countUnread_ShouldReturnUnreadCount() {
        Long userId = 1L;
        when(notificationRepository.countByUserIdAndIsReadFalse(userId)).thenReturn(5L);

        long count = notificationService.countUnread(userId);

        assertEquals(5L, count);
        verify(notificationRepository, times(1)).countByUserIdAndIsReadFalse(userId);
    }

    @Test
    void markAsRead_WhenNotificationExistsAndBelongsToUser_ShouldMarkAsRead() {
        Long notificationId = 10L;
        Long userId = 1L;
        mockedSecurityUtils.when(SecurityUtils::getAuthenticatedUserId).thenReturn(userId);

        User user = User.builder().id(userId).build();
        Notification notification = Notification.builder()
                .id(notificationId)
                .user(user)
                .isRead(false)
                .build();

        when(notificationRepository.findById(notificationId)).thenReturn(Optional.of(notification));

        notificationService.markAsRead(notificationId);

        assertTrue(notification.isRead());
        verify(notificationRepository, times(1)).save(notification);
    }

    @Test
    void markAsRead_WhenNotificationExistsAndDoesNotBelongToUser_ShouldThrowForbiddenException() {
        Long notificationId = 10L;
        Long userId = 1L;
        Long otherUserId = 2L;
        mockedSecurityUtils.when(SecurityUtils::getAuthenticatedUserId).thenReturn(userId);

        User otherUser = User.builder().id(otherUserId).build();
        Notification notification = Notification.builder()
                .id(notificationId)
                .user(otherUser)
                .isRead(false)
                .build();

        when(notificationRepository.findById(notificationId)).thenReturn(Optional.of(notification));

        assertThrows(ForbiddenException.class, () -> notificationService.markAsRead(notificationId));
        assertFalse(notification.isRead());
        verify(notificationRepository, never()).save(any());
    }

    @Test
    void markAsRead_WhenNotificationDoesNotExist_ShouldDoNothing() {
        Long notificationId = 10L;
        when(notificationRepository.findById(notificationId)).thenReturn(Optional.empty());

        notificationService.markAsRead(notificationId);

        verify(notificationRepository, never()).save(any());
    }

    @Test
    void markAllAsRead_ShouldMarkAllUserNotificationsAsRead() {
        Long userId = 1L;
        Notification n1 = Notification.builder().id(10L).isRead(false).build();
        Notification n2 = Notification.builder().id(11L).isRead(false).build();
        List<Notification> notifications = Arrays.asList(n1, n2);

        when(notificationRepository.findByUserIdOrderByCreatedAtDesc(userId)).thenReturn(notifications);

        notificationService.markAllAsRead(userId);

        assertTrue(n1.isRead());
        assertTrue(n2.isRead());
        verify(notificationRepository, times(1)).saveAll(notifications);
    }
}
