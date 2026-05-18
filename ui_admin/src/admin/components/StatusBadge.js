import React from 'react';
import { Tag } from 'antd';

// Từ điển ánh xạ trạng thái sang màu sắc và nhãn tiếng Việt
const STATUS_CONFIG = {
  // Trạng thái đơn hàng / chung
  PENDING: { color: 'warning', label: 'Chờ xử lý' },
  PROCESSING: { color: 'processing', label: 'Đang xử lý' },
  SHIPPING: { color: 'cyan', label: 'Đang giao' },
  DELIVERED: { color: 'success', label: 'Đã giao' },
  CANCELLED: { color: 'error', label: 'Đã huỷ' },
  COMPLETED: { color: 'success', label: 'Hoàn thành' },
  
  // Trạng thái tài khoản / sản phẩm
  ACTIVE: { color: 'success', label: 'Hoạt động' },
  INACTIVE: { color: 'default', label: 'Bị khoá / Ẩn' },
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