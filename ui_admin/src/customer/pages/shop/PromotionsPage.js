import React, { useState, useEffect } from 'react';
import { Card, Button, Row, Col, Typography, message, Spin, Tag, Breadcrumb, Empty } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { customerCouponService } from '../../services/customerCouponService';
import { formatCurrency, formatDateTime } from '../../../shared/utils/formatters';

const { Title } = Typography;

const PromotionsPage = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const data = await customerCouponService.getPublicCoupons();
      setCoupons(data || []);
    } catch (error) {
      message.error('Không thể tải danh sách mã giảm giá');
    } finally {
      setLoading(false);
    }
  };

  const handleCollect = async (couponId) => {
    try {
      await customerCouponService.collectCoupon({ couponId });
      message.success('Đã lưu mã giảm giá vào ví thành công!');
      
      // AC-FE-US39-01: Thay đổi nút thành "Already in Wallet" và disable lập tức
      setCoupons(prev => prev.map(c => 
        c.couponId === couponId ? { ...c, collected: true } : c
      ));
    } catch (error) {
      message.error(error?.response?.data?.message || 'Lỗi khi lưu mã giảm giá');
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: 80 }}><Spin size="large" /></div>;

  return (
    <div style={{ backgroundColor: '#f9fafb', minHeight: '100vh', paddingBottom: 60 }}>
      <div style={{ backgroundColor: '#fff', borderBottom: '1px solid #eaeaea', padding: '16px 0', marginBottom: 32 }}>
        <div className="c-container">
          <Breadcrumb>
            <Breadcrumb.Item><Link to="/"><HomeOutlined /> Trang chủ</Link></Breadcrumb.Item>
            <Breadcrumb.Item>Khuyến mãi</Breadcrumb.Item>
          </Breadcrumb>
        </div>
      </div>

      <div className="c-container">
        <Title level={2} style={{ textAlign: 'center', marginBottom: 40, color: '#1a1a1a' }}>Siêu Ưu Đãi & Khuyến Mãi</Title>
        <Row gutter={[24, 24]}>
          {coupons.map(coupon => (
            <Col xs={24} sm={12} md={8} key={coupon.couponId}>
              <Card style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} bodyStyle={{ padding: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <Title level={4} style={{ margin: 0, color: '#e53935' }}>{coupon.code}</Title>
                    <Tag color="magenta" style={{ marginTop: 8, fontSize: 13, padding: '2px 8px' }}>
                      Giảm {coupon.discountType === 'PERCENTAGE' ? `${coupon.discountValue}%` : formatCurrency(coupon.discountValue)}
                    </Tag>
                  </div>
                </div>
                <div style={{ marginTop: 16, fontSize: 13, color: '#555' }}>
                  <p style={{ margin: '4px 0' }}>Đơn tối thiểu: <strong style={{ color: '#000' }}>{formatCurrency(coupon.minOrderAmount)}</strong></p>
                  <p style={{ margin: '4px 0' }}>HSD: <strong style={{ color: '#d4380d' }}>{formatDateTime(coupon.expiryDate)}</strong></p>
                </div>
                
                {/* AC-FE-US39-05: Already Collected State */}
                <Button 
                  type={coupon.collected ? "default" : "primary"}
                  block 
                  style={{ marginTop: 20, borderRadius: 6, fontWeight: 600, background: coupon.collected ? '#f5f5f5' : '#1a1a1a' }}
                  disabled={coupon.collected}
                  onClick={() => handleCollect(coupon.couponId)}
                >
                  {coupon.collected ? 'Đã lưu trong Ví' : 'Lưu Mã'}
                </Button>
              </Card>
            </Col>
          ))}
          {coupons.length === 0 && (
            <div style={{ width: '100%', textAlign: 'center', padding: 60 }}>
              <Empty description="Hiện tại chưa có mã giảm giá nào được phát hành." />
            </div>
          )}
        </Row>
      </div>
    </div>
  );
};

export default PromotionsPage;