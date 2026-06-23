// src/admin/pages/categories/CategoryFormModal.js
import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Select, message } from 'antd';
import { adminCategoryService } from '../../services/categoryService';

const CategoryFormModal = ({ visible, onClose, onSuccess, editItem, parentOpts }) => {
  const [form] = Form.useForm();
  const [saveLoading, setSaveLoading] = useState(false);

  // AC-FE-01: Edit flow (prefill) - Tự động điền dữ liệu khi mở Modal
  useEffect(() => {
    if (visible) {
      form.resetFields();
      if (editItem) {
        form.setFieldsValue({
          name: editItem.name,
          parentId: editItem.parentId ?? null,
        });
      }
    }
  }, [visible, editItem, form]);

  const handleSave = async () => {
    let vals;
    try {
      // AC-FE-04: UI validation - Chặn submit nếu tên rỗng (không gọi API)
      vals = await form.validateFields();
    } catch {
      return; 
    }

    setSaveLoading(true);
    try {
      if (editItem && editItem.id) {
        // AC-FE-01: Gọi API PUT (update)
        await adminCategoryService.update(editItem.id, { 
          name: vals.name, 
          parentId: vals.parentId ?? null 
        });
        message.success('Cập nhật thành công');
      } else {
        // Thêm mới
        await adminCategoryService.create({ 
          name: vals.name, 
          parentId: vals.parentId ?? null 
        });
        message.success('Thêm danh mục thành công');
      }
      
      onSuccess(); // Tải lại danh sách ngay lập tức
      onClose();   // Đóng modal
    } catch (err) {
      // AC-FE-05: Error handling - Hiển thị lỗi từ BE
      message.error(err.response?.data?.message || 'Thao tác thất bại, vui lòng thử lại.');
    } finally {
      setSaveLoading(false);
    }
  };

  // Lọc bỏ chính danh mục đang sửa khỏi danh sách cha (để tránh tự chọn chính mình làm cha)
  const safeParentOpts = parentOpts.filter(opt => !editItem || opt.value !== editItem.id);

  return (
    <Modal
      open={visible}
      title={editItem && editItem.id ? 'Sửa danh mục' : 'Thêm danh mục mới'}
      onOk={handleSave}
      onCancel={onClose}
      okText={editItem && editItem.id ? 'Lưu cập nhật' : 'Thêm mới'}
      cancelText="Huỷ"
      confirmLoading={saveLoading}
      destroyOnClose
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        {/* AC-FE-04: UI Validation bắt buộc nhập */}
        <Form.Item 
          name="name" 
          label="Tên danh mục"
          rules={[{ required: true, message: 'Vui lòng nhập tên danh mục!' }]}
        >
          <Input placeholder="Ví dụ: Áo Phông" maxLength={100} showCount />
        </Form.Item>

        <Form.Item 
          name="parentId" 
          label="Danh mục cha (tuỳ chọn)"
          extra="Để trống nếu đây là danh mục cấp cao nhất."
        >
          <Select
            placeholder="— Cấp cao nhất —"
            allowClear
            options={safeParentOpts}
            showSearch
            optionFilterProp="label"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CategoryFormModal;