// src/customer/pages/landing/LandingPage.js
import React from 'react';
import { Button, Typography, Row, Col, Card } from 'antd';
import { useNavigate } from 'react-router-dom';
import { mockProducts } from '../../../shared/mocks/productMocks';
import { mockCategories } from '../../../shared/mocks/catagoryMock';
import { formatCurrency } from '../../../shared/utils/formatters';

const LandingPage = () => {
  const navigate = useNavigate();
  const featuredProducts = mockProducts.slice(0, 4);
  const topCategories    = mockCategories.filter((c) => !c.parent_id);

  return (
    <div>
      {/* Hero Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #1a1a1a 0%, #3d2b1f 100%)',
        color: '#fff', textAlign: 'center', padding: '100px 32px',
      }}>
        <Typography.Title style={{ color: '#fff', fontSize: 48, marginBottom: 16 }}>
          Thời Trang Đỉnh Cao
        </Typography.Title>
        <Typography.Paragraph style={{ color: '#c9a96e', fontSize: 18, marginBottom: 32 }}>
          Khám phá bộ sưu tập mới nhất — phong cách của bạn bắt đầu từ đây
        </Typography.Paragraph>
        <Button size="large" style={{ background: '#c9a96e', border: 'none', color: '#fff', fontWeight: 700, padding: '0 40px', height: 48 }}
          onClick={() => navigate('/shop')}>
          Mua sắm ngay
        </Button>
      </div>

      {/* Categories */}
      <div style={{ padding: '60px 32px' }}>
        <Typography.Title level={2} style={{ textAlign: 'center', marginBottom: 32 }}>Danh Mục</Typography.Title>
        <Row gutter={[16, 16]} justify="center">
          {topCategories.map((cat) => (
            <Col xs={12} sm={8} md={6} key={cat.category_id}>
              <Card hoverable onClick={() => navigate(`/shop?category=${cat.category_id}`)}
                cover={<div style={{ height: 140, background: '#f5f0ea', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40 }}>👗</div>}>
                <Card.Meta title={<div style={{ textAlign: 'center' }}>{cat.name}</div>} />
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      {/* Featured Products */}
      <div style={{ padding: '0 32px 60px', background: '#faf8f5' }}>
        <Typography.Title level={2} style={{ textAlign: 'center', paddingTop: 60, marginBottom: 32 }}>Sản Phẩm Nổi Bật</Typography.Title>
        <Row gutter={[16, 16]}>
          {featuredProducts.map((p) => (
            <Col xs={12} sm={12} md={6} key={p.product_id}>
              <Card hoverable onClick={() => navigate(`/shop/${p.product_id}`)}
                cover={<img alt={p.name} src={p.images[0]} style={{ height: 220, objectFit: 'cover' }} />}>
                <Typography.Text strong style={{ display: 'block' }}>{p.name}</Typography.Text>
                <Typography.Text style={{ color: '#c9a96e', fontWeight: 700 }}>
                  {formatCurrency(p.sale_price || p.base_price)}
                </Typography.Text>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    </div>
  );
};

export default LandingPage;