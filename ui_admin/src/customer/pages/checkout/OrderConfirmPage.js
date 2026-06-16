import React from 'react';
import { Result, Button, Card, Typography, Descriptions } from 'antd';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { formatCurrency } from '../../../shared/utils/formatters';

const { Text } = Typography;

const STATUS_MAP = {
  PENDING_CONFIRMATION: 'Chờ xác nhận',
  PENDING_PAYMENT: 'Chờ thanh toán',
  PAID: 'Đã thanh toán',
  PROCESSING: 'Đang xử lý',
  SHIPPING: 'Đang giao hàng',
  DELIVERED: 'Đã giao hàng',
  COMPLETED: 'Hoàn thành',
  CANCELLED: 'Đã hủy',
  PAYMENT_FAILED: 'Thanh toán thất bại',
  PAYMENT_EXPIRED: 'Hết hạn thanh toán'
};

const OrderConfirmPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const orderData = location.state;

  if (!orderData) {
    return <Navigate to="/" replace />;
  }

  // Dịch trạng thái sang tiếng Việt
  const displayStatus = STATUS_MAP[orderData.status] || orderData.status;

  return (
    <div style={{ backgroundColor: '#f9fafb', minHeight: '100vh', padding: '60px 20px' }}>
      <div className="c-container" style={{ maxWidth: 700, margin: '0 auto' }}>
        <Card style={{ borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.06)', border: 'none', padding: '20px 0' }}>
          <Result
            status="success"
            title="Đặt hàng thành công!"
            subTitle={orderData.message || "Cảm ơn bạn đã tin tưởng và mua sắm tại hệ thống của chúng tôi."}
            extra={[
              <Button 
                key="orders" 
                type="primary" 
                size="large" 
                style={{ background: '#1a1a1a', borderColor: '#1a1a1a', borderRadius: 8 }}
                onClick={() => navigate('/account/orders')}
              >
                Xem đơn hàng
              </Button>,
              <Button 
                key="home" 
                size="large" 
                style={{ borderRadius: 8 }}
                onClick={() => navigate('/')}
              >
                Về trang chủ
              </Button>,
            ]}
          >
            <div style={{ background: '#fafafa', padding: 24, borderRadius: 12, marginTop: 16, textAlign: 'left' }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, borderBottom: '1px solid #eaeaea', paddingBottom: 12 }}>
                Chi tiết tóm tắt
              </h3>
              <Descriptions column={1} size="small" labelStyle={{ color: '#64748b' }}>
                <Descriptions.Item label="Mã đơn hàng">
                  <Text strong>#{orderData.orderId}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Phương thức TT">
                  <Text strong>Thanh toán khi nhận hàng (COD)</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Trạng thái">
                  {/* ĐÃ SỬA: Hiển thị tiếng Việt */}
                  <Text type="warning" strong>{displayStatus}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Tổng thanh toán">
                  <Text style={{ color: '#e53935', fontWeight: 700, fontSize: 16 }}>
                    {formatCurrency(orderData.totalAmount)}
                  </Text>
                </Descriptions.Item>
              </Descriptions>
            </div>
          </Result>
        </Card>
      </div>
    </div>
  );
};

export default OrderConfirmPage;