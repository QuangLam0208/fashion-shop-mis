// src/admin/pages/dashboard/DashboardPage.js
import React from 'react';
import { Row, Col, Card, Statistic, Typography } from 'antd';
import { ShoppingOutlined, OrderedListOutlined, UserOutlined, DollarOutlined } from '@ant-design/icons';
import { mockDashboardStats } from '../../../shared/mocks/dashboardMock';

const { Title } = Typography;

const DashboardPage = () => {
  const stats = mockDashboardStats;

  const cards = [
    { title: 'Doanh thu',        value: stats.total_revenue,   prefix: '',   suffix: '₫', icon: <DollarOutlined />,      color: '#1890ff' },
    { title: 'Đơn hàng',         value: stats.total_orders,    prefix: '',   suffix: '',  icon: <OrderedListOutlined />, color: '#52c41a' },
    { title: 'Khách hàng',        value: stats.total_customers, prefix: '',   suffix: '',  icon: <UserOutlined />,        color: '#faad14' },
    { title: 'Sản phẩm',          value: stats.total_products,  prefix: '',   suffix: '',  icon: <ShoppingOutlined />,    color: '#f5222d' },
  ];

  return (
    <div>
      <Title level={4} style={{ marginBottom: 24 }}>Dashboard</Title>
      <Row gutter={[16, 16]}>
        {cards.map((c) => (
          <Col xs={24} sm={12} lg={6} key={c.title}>
            <Card>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Statistic
                  title={c.title}
                  value={c.value}
                  prefix={c.prefix}
                  suffix={c.suffix}
                  formatter={c.title === 'Doanh thu'
                    ? (v) => new Intl.NumberFormat('vi-VN').format(v)
                    : undefined}
                />
                <div style={{ fontSize: 36, color: c.color, opacity: 0.25 }}>{c.icon}</div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default DashboardPage;