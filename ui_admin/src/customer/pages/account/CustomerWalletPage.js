import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Typography, message, Spin, Tag, Breadcrumb, Empty, Button } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { customerCouponService } from '../../services/customerCouponService';
import { formatCurrency, formatDateTime } from '../../../shared/utils/formatters';

const { Title, Text } = Typography;

const CustomerWalletPage = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchWalletCoupons = async () => {
      try {
        const data = await customerCouponService.getWalletCoupons();
        setCoupons(data || []);
      } catch (error) {
        message.error('Không thể tải ví voucher của bạn');
      } finally {
        setLoading(false);
      }
    };
    fetchWalletCoupons();
  }, []);

  if (loading) return <div style={{ textAlign: 'center', padding: 80 }}><Spin size="large" /></div>;

  return (
    <div style={{ backgroundColor: '#f9fafb', minHeight: '100vh', paddingBottom: 60 }}>
      <div style={{ backgroundColor: '#fff', borderBottom: '1px solid #eaeaea', padding: '16px 0', marginBottom: 32 }}>
        <div className="c-container">
          <Breadcrumb>
            <Breadcrumb.Item><Link to="/"><HomeOutlined /> Trang chủ</Link></Breadcrumb.Item>
            <Breadcrumb.Item><Link to="/account/profile">Tài khoản</Link></Breadcrumb.Item>
            <Breadcrumb.Item>Ví Voucher</Breadcrumb.Item>
          </Breadcrumb>
        </div>
      </div>

      <div className="c-container">
        <Title level={3} style={{ marginBottom: 24, color: '#1a1a1a' }}>Ví Voucher Của Tôi</Title>
        
        {coupons.length === 0 ? (
          <Card style={{ borderRadius: 12, textAlign: 'center', padding: '40px 0' }}>
            <Empty description="Bạn chưa lưu mã giảm giá nào." />
            <Button type="primary" onClick={() => navigate('/promotions')} style={{ marginTop: 16 }}>
              Thu thập thêm mã ngay
            </Button>
          </Card>
        ) : (
          <Row gutter={[24, 24]}>
            {coupons.map(coupon => (
              <Col xs={24} sm={12} md={8} key={coupon.couponId}>
                <Card style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.05)', border: '1px solid #eaeaea' }} bodyStyle={{ padding: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <Text strong style={{ fontSize: 18, color: '#e53935' }}>{coupon.code}</Text>
                    <Tag color="magenta">Giảm {coupon.discountType === 'PERCENTAGE' ? `${coupon.discountValue}%` : formatCurrency(coupon.discountValue)}</Tag>
                  </div>
                  
                  <div style={{ fontSize: 13, color: '#555', background: '#f5f5f5', padding: 12, borderRadius: 8 }}>
                    <p style={{ margin: '0 0 4px 0' }}>Đơn tối thiểu: <strong style={{ color: '#000' }}>{formatCurrency(coupon.minOrderAmount)}</strong></p>
                    <p style={{ margin: 0 }}>Hạn sử dụng: <strong style={{ color: '#d4380d' }}>{formatDateTime(coupon.expiryDate)}</strong></p>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </div>
    </div>
  );
};

export default CustomerWalletPage;