import React, { useState } from 'react';
import { Card, Form, Input, InputNumber, Select, DatePicker, Button, Switch, Space, message, Row, Col, Typography } from 'antd';
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { couponService } from '../../services/couponService';

const { Title } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const CouponFormPage = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  // Theo dõi giá trị discountType để xử lý logic Validate (Phần trăm <= 100)
  const discountType = Form.useWatch('discountType', form);

  // Xử lý gửi Form
  const onFinish = async (values) => {
    setSubmitting(true);
    try {
      const [startDate, expiryDate] = values.validityPeriod;
      
      // PAYLOAD CHUẨN 100% THEO CreateCouponRequestDTO
      const payload = {
        code: values.code,
        discountType: values.discountType,
        discountValue: values.discountValue,
        minOrderAmount: values.minOrderAmount || 0,
        usageLimit: values.usageLimit,
        active: values.active,
        startDate: startDate.toISOString(),
        expiryDate: expiryDate.toISOString(),
      };

      await couponService.createCoupon(payload);
      message.success('Tạo mới mã giảm giá thành công!');
      navigate('/admin/coupons'); 
    } catch (error) {
      message.error(error?.response?.data?.message || 'Có lỗi xảy ra khi tạo mã giảm giá');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/admin/coupons')} style={{ marginRight: 16 }} />
        <Title level={3} style={{ margin: 0 }}>Tạo Mới Mã Giảm Giá</Title>
      </div>

      <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.05)', maxWidth: 900 }}>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            active: true,
            discountType: 'PERCENTAGE',
            minOrderAmount: 0
          }}
        >
          <Row gutter={24}>
            {/* Mã giảm giá - Tự động viết hoa (AC-FE-US37-03) */}
            <Col xs={24} md={12}>
              <Form.Item
                name="code"
                label="Mã giảm giá (Coupon Code)"
                normalize={(value) => (value || '').toUpperCase().replace(/\s/g, '')}
                rules={[
                  { required: true, message: 'Vui lòng nhập mã giảm giá' },
                  { min: 3, max: 50, message: 'Mã giảm giá phải từ 3-50 ký tự' },
                  { pattern: /^[A-Z0-9_-]+$/, message: 'Chỉ chứa chữ in hoa, số, gạch ngang và gạch dưới' }
                ]}
              >
                <Input placeholder="VD: SUMMER50, FREESHIP..." size="large" />
              </Form.Item>
            </Col>

            {/* Trạng thái kích hoạt */}
            <Col xs={24} md={12}>
              <Form.Item name="active" label="Trạng thái kích hoạt" valuePropName="checked">
                <Switch checkedChildren="Hoạt động" unCheckedChildren="Tạm khóa" />
              </Form.Item>
            </Col>

            {/* Loại giảm giá */}
            <Col xs={24} md={8}>
              <Form.Item
                name="discountType"
                label="Loại giảm giá"
                rules={[{ required: true, message: 'Vui lòng chọn loại giảm giá' }]}
              >
                <Select size="large">
                  <Option value="PERCENTAGE">Giảm theo Phần trăm (%)</Option>
                  <Option value="FIXED_AMOUNT">Giảm số tiền cố định (VNĐ)</Option>
                </Select>
              </Form.Item>
            </Col>

            {/* Giá trị giảm (Validate động theo loại giảm giá - AC-FE-US37-04) */}
            <Col xs={24} md={8}>
              <Form.Item
                name="discountValue"
                label={discountType === 'PERCENTAGE' ? 'Phần trăm giảm (%)' : 'Số tiền giảm (VNĐ)'}
                dependencies={['discountType']}
                rules={[
                  { required: true, message: 'Vui lòng nhập giá trị giảm' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value) return Promise.resolve();
                      if (value <= 0) return Promise.reject(new Error('Giá trị phải lớn hơn 0'));
                      if (getFieldValue('discountType') === 'PERCENTAGE' && value > 100) {
                        return Promise.reject(new Error('Phần trăm giảm không được vượt quá 100%'));
                      }
                      return Promise.resolve();
                    },
                  }),
                ]}
              >
                <InputNumber 
                  style={{ width: '100%' }} 
                  size="large"
                  min={1} 
                  max={discountType === 'PERCENTAGE' ? 100 : undefined}
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/\$\s?|(,*)/g, '')}
                />
              </Form.Item>
            </Col>

            {/* Giới hạn số lượng dùng */}
            <Col xs={24} md={8}>
              <Form.Item
                name="usageLimit"
                label="Số lượng phát hành"
                rules={[
                  { required: true, message: 'Vui lòng nhập giới hạn sử dụng' },
                  { type: 'number', min: 1, message: 'Giới hạn phải lớn hơn 0' }
                ]}
              >
                <InputNumber style={{ width: '100%' }} size="large" min={1} />
              </Form.Item>
            </Col>

            {/* Đơn hàng tối thiểu */}
            <Col xs={24} md={12}>
              <Form.Item
                name="minOrderAmount"
                label="Giá trị đơn hàng tối thiểu để áp dụng (VNĐ)"
                rules={[{ type: 'number', min: 0, message: 'Không được là số âm' }]}
              >
                <InputNumber 
                  style={{ width: '100%' }} 
                  size="large" 
                  min={0}
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/\$\s?|(,*)/g, '')}
                />
              </Form.Item>
            </Col>

            {/* Thời gian hiệu lực (startDate & endDate) */}
            <Col xs={24} md={12}>
              <Form.Item
                name="validityPeriod"
                label="Thời gian hiệu lực (Bắt đầu - Kết thúc)"
                rules={[{ required: true, message: 'Vui lòng chọn khung thời gian áp dụng' }]}
              >
                <RangePicker 
                  showTime 
                  format="YYYY-MM-DD HH:mm:ss" 
                  style={{ width: '100%' }} 
                  size="large" 
                />
              </Form.Item>
            </Col>
          </Row>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
            <Space>
              <Button onClick={() => navigate('/admin/coupons')} size="large" disabled={submitting}>
                Hủy bỏ
              </Button>
              <Button type="primary" htmlType="submit" icon={<SaveOutlined />} size="large" loading={submitting}>
                Tạo mã giảm giá
              </Button>
            </Space>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default CouponFormPage;