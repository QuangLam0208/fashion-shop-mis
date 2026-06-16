import React from 'react';
import { Tag } from 'antd';

// Từ điển ánh xạ trạng thái sang màu sắc và nhãn tiếng Việt
const STATUS_CONFIG = {
  // Trạng thái đơn hàng / chung
  PENDING_CONFIRMATION: { label: 'Chờ xác nhận', color: 'orange' },
  PENDING_PAYMENT: { label: 'Chờ thanh toán', color: 'gold' },
  PAID: { label: 'Đã thanh toán', color: 'lime' },
  PROCESSING: { label: 'Đang xử lý', color: 'blue' },
  SHIPPING: { label: 'Đang giao hàng', color: 'cyan' },
  DELIVERED: { label: 'Đã giao hàng', color: 'geekblue' },
  COMPLETED: { label: 'Hoàn thành', color: 'green' },
  CANCELLED: { label: 'Đã hủy', color: 'red' },
  PAYMENT_FAILED: { label: 'Thanh toán thất bại', color: 'volcano' },
  PAYMENT_EXPIRED: { label: 'Hết hạn thanh toán', color: 'magenta' }
};

const StatusBadge = ({ status, customLabel }) => {
  const config = STATUS_CONFIG[status] || { color: 'default', label: status || 'Không rõ' };
  
  return (
    <Tag color={config.color} style={{ fontWeight: 500, borderRadius: 4 }}>
      {customLabel || config.label}
    </Tag>
  );
};

export default StatusBadge;