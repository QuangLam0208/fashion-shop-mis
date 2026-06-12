import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, InputNumber, Select, DatePicker, message, Row, Col } from 'antd';
import dayjs from 'dayjs';
import { couponService } from '../../services/couponService';

const { Option } = Select;
const { RangePicker } = DatePicker;

const CouponEditModal = ({ open, onCancel, onSuccess, couponData }) => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const discountType = Form.useWatch('discountType', form);

  // AC-FE-US38-04: Đổ dữ liệu cũ vào form khi mở Modal
  useEffect(() => {
    if (open && couponData) {
      form.setFieldsValue({
        code: couponData.code,
        discountType: couponData.discountType,
        discountValue: couponData.discountValue,
        minOrderAmount: couponData.minOrderAmount,
        usageLimit: couponData.usageLimit,
        validityPeriod: [dayjs(couponData.startDate), dayjs(couponData.expiryDate)]
      });
    }
  }, [open, couponData, form]);

  const onFinish = async (values) => {
    setSubmitting(true);
    try {
      const [startDate, expiryDate] = values.validityPeriod;
      
      // SỬA LỖI Ở ĐÂY: Gửi kèm 'code' và 'active' cũ lên để BE vượt qua khâu Validation (@NotBlank)
      const payload = {
        code: couponData.code,          // Bắt buộc phải có để khớp DTO
        active: couponData.active,      // Bắt buộc phải có để khớp DTO
        discountType: values.discountType,
        discountValue: values.discountValue,
        minOrderAmount: values.minOrderAmount || 0,
        usageLimit: values.usageLimit,
        startDate: startDate.toISOString(),
        expiryDate: expiryDate.toISOString(),
      };

      await couponService.updateCoupon(couponData.couponId, payload);
      message.success('Cập nhật mã giảm giá thành công!');
      onSuccess(); // Báo cho trang List tải lại dữ liệu
    } catch (error) {
      message.error(error?.response?.data?.message || 'Có lỗi xảy ra khi cập nhật');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title="Chỉnh sửa Mã Giảm Giá"
      open={open}
      onCancel={onCancel}
      onOk={() => form.submit()}
      confirmLoading={submitting}
      width={700}
      destroyOnClose
      okText="Lưu thay đổi"
      cancelText="Hủy"
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item name="code" label="Mã giảm giá (Coupon Code)">
              {/* AC-FE-US38-02: Read-Only Voucher Code */}
              <Input size="large" disabled style={{ color: '#000', fontWeight: 600, backgroundColor: '#f5f5f5' }} />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item name="discountType" label="Loại giảm giá" rules={[{ required: true }]}>
              <Select size="large">
                <Option value="PERCENTAGE">Giảm theo Phần trăm (%)</Option>
                <Option value="FIXED_AMOUNT">Giảm tiền mặt (VNĐ)</Option>
              </Select>
            </Form.Item>
          </Col>

          <Col xs={24} md={8}>
            <Form.Item
              name="discountValue"
              label={discountType === 'PERCENTAGE' ? 'Mức giảm (%)' : 'Mức giảm (VNĐ)'}
              dependencies={['discountType']}
              rules={[
                { required: true, message: 'Vui lòng nhập' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (value <= 0) return Promise.reject(new Error('Phải > 0'));
                    if (getFieldValue('discountType') === 'PERCENTAGE' && value > 100) {
                      return Promise.reject(new Error('Không vượt quá 100%'));
                    }
                    return Promise.resolve();
                  },
                }),
              ]}
            >
              <InputNumber style={{ width: '100%' }} size="large" min={1} />
            </Form.Item>
          </Col>

          <Col xs={24} md={8}>
            <Form.Item name="usageLimit" label="Số lượng phát hành" rules={[{ required: true }]}>
              <InputNumber style={{ width: '100%' }} size="large" min={1} />
            </Form.Item>
          </Col>

          <Col xs={24} md={8}>
            <Form.Item name="minOrderAmount" label="Đơn tối thiểu (VNĐ)">
              <InputNumber style={{ width: '100%' }} size="large" min={0} />
            </Form.Item>
          </Col>

          <Col xs={24}>
            <Form.Item name="validityPeriod" label="Thời gian hiệu lực" rules={[{ required: true }]}>
              <RangePicker showTime format="YYYY-MM-DD HH:mm:ss" style={{ width: '100%' }} size="large" />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default CouponEditModal;