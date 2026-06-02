import React, { useEffect } from 'react';
import { Modal, Form, Input, Button, Checkbox } from 'antd';

const AddressFormModal = ({ isOpen, onClose, onSave, editingAddress }) => {
  const [form] = Form.useForm();

  // Reset form hoặc điền dữ liệu cũ mỗi khi mở Modal
  useEffect(() => {
    if (isOpen) {
      if (editingAddress) {
        form.setFieldsValue(editingAddress);
      } else {
        form.resetFields();
        form.setFieldsValue({ isDefault: false });
      }
    }
  }, [isOpen, editingAddress, form]);

  const handleFinish = (values) => {
    // Gọi hàm onSave truyền từ component cha
    onSave(values);
  };

  return (
    <Modal
      title={editingAddress ? "Sửa địa chỉ" : "Thêm địa chỉ mới"}
      open={isOpen}
      onCancel={onClose}
      footer={null}
      destroyOnClose
    >
      <Form 
        layout="vertical" 
        form={form} 
        onFinish={handleFinish} 
        style={{ marginTop: 16 }}
      >
        <Form.Item name="receiverName" label="Tên người nhận" rules={[{ required: true, message: 'Vui lòng nhập tên người nhận!' }]}>
          <Input size="large" placeholder="Nguyễn Văn A" />
        </Form.Item>
        <Form.Item name="receiverPhone" label="Số điện thoại" rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}>
          <Input size="large" placeholder="0912345678" />
        </Form.Item>
        <Form.Item name="fullAddress" label="Địa chỉ chi tiết (Số nhà, Phường, Quận, Tỉnh/TP)" rules={[{ required: true, message: 'Vui lòng nhập địa chỉ!' }]}>
          <Input.TextArea rows={3} placeholder="Ví dụ: 123 Đường ABC, Phường X, Quận Y, TP.HCM" />
        </Form.Item>
        <Form.Item name="isDefault" valuePropName="checked">
          <Checkbox>Đặt làm địa chỉ mặc định</Checkbox>
        </Form.Item>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <Button onClick={onClose}>Hủy</Button>
          <Button type="primary" htmlType="submit" style={{ background: '#1a1a1a', borderColor: '#1a1a1a' }}>
            Lưu địa chỉ
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default AddressFormModal;