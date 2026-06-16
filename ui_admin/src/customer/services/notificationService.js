import axiosInstance from '../../shared/config/axiosInstance';

export const notificationService = {
  // Lấy danh sách 5 thông báo mới nhất
  getNotifications: async (params = { page: 0, size: 5, sort: 'createdAt,desc' }) => {
    const res = await axiosInstance.get('/api/notifications', { params });
    return res.data;
  },

  // Lấy số lượng thông báo chưa đọc
  getUnreadCount: async () => {
    const res = await axiosInstance.get('/api/notifications/unread-count');
    return res.data;
  },

  // Đánh dấu 1 thông báo là đã đọc
  markAsRead: async (id) => {
    const res = await axiosInstance.patch(`/api/notifications/${id}/read`);
    return res.data;
  },

  // Đánh dấu toàn bộ là đã đọc
  markAllAsRead: async () => {
    const res = await axiosInstance.patch('/api/notifications/read-all');
    return res.data;
  }
};