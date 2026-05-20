import React from 'react';
import { Modal, Space, Typography } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';

const { Text } = Typography;

const ConfirmModal = ({ 
  isOpen, 
  title = 'Xác nhận', 
  content = 'Bạn có chắc chắn muốn thực hiện hành động này không?', 
  onConfirm, 
  onCancel, 
  loading = false,
  danger = false // Set true nếu là hành động Xoá (nút sẽ chuyển màu đỏ)
}) => {
  return (
    <Modal
      title={
        <Space>
          <ExclamationCircleOutlined style={{ color: danger ? '#ff4d4f' : '#faad14' }} />
          <span>{title}</span>
        </Space>
      }
      open={isOpen}
      onOk={onConfirm}
      onCancel={onCancel}
      confirmLoading={loading}
      okText="Xác nhận"
      cancelText="Hủy bỏ"
      okButtonProps={{ danger }} // Nút xác nhận màu đỏ nếu danger = true
      centered
    >
      <div style={{ marginTop: 16, paddingLeft: 24 }}>
        <Text>{content}</Text>
      </div>
    </Modal>
  );
};

export default ConfirmModal;