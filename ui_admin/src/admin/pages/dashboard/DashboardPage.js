import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Table, Spin, message, Typography, Tag } from 'antd';
import { ShoppingCartOutlined, DollarCircleOutlined, UserOutlined, AppstoreOutlined, WarningOutlined } from '@ant-design/icons';
import StatCard from '../../components/StatCard';
import { formatCurrency, formatDateTime } from '../../../shared/utils/formatters';
import { dashboardService } from '../../services/dashboardService';

const { Title } = Typography;

const DashboardPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const res = await dashboardService.getOverview();
        setData(res);
      } catch (error) {
        message.error('Không thể tải dữ liệu Dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  // Cấu hình bảng Top sản phẩm theo JSON mới
  // const productColumns = [
  //   { title: 'Sản phẩm', dataIndex: 'productName', key: 'productName' },
  //   { title: 'Số lượng bán', dataIndex: 'totalSold', align: 'center' },
  //   { title: 'Doanh thu', dataIndex: 'revenue', align: 'right', render: (val) => formatCurrency(val) }
  // ];
  // Cấu hình bảng Top sản phẩm theo JSON mới (Có kèm ảnh)
  const productColumns = [
    { 
      title: 'Sản phẩm', 
      key: 'productName',
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img 
            src={record.primaryImageUrl || 'https://placehold.co/40x40?text=No+Img'} 
            alt={record.productName} 
            style={{ 
              width: 40, 
              height: 40, 
              objectFit: 'cover', 
              borderRadius: '4px', 
              border: '1px solid #f0f0f0' 
            }} 
          />
          <span style={{ fontWeight: 500 }}>{record.productName}</span>
        </div>
      )
    },
    { title: 'Số lượng bán', dataIndex: 'totalSold', align: 'center' },
    { title: 'Doanh thu', dataIndex: 'revenue', align: 'right', render: (val) => formatCurrency(val) }
  ];

  // Cấu hình bảng Đơn hàng gần đây
  const orderColumns = [
    { title: 'Mã đơn', dataIndex: 'orderId', key: 'orderId' },
    { title: 'Khách hàng', dataIndex: 'customerName', key: 'customerName' },
    { title: 'Tổng tiền', dataIndex: 'totalAmount', render: (val) => formatCurrency(val) },
    { title: 'Trạng thái', dataIndex: 'status', render: (val) => <Tag color="blue">{val}</Tag> },
    { title: 'Ngày đặt', dataIndex: 'orderDate', render: (val) => formatDateTime(val) }
  ];

  if (loading) return <div style={{ textAlign: 'center', padding: 100 }}><Spin size="large" /></div>;

  return (
    <div style={{ padding: 24 }}>
      <Title level={3}>Dashboard Tổng quan</Title>
      
      {/* 5 Thẻ chỉ số (Thêm pendingReturns) */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={4}>
          <StatCard title="Doanh thu" value={formatCurrency(data?.totalRevenue || 0)} icon={<DollarCircleOutlined />} />
        </Col>
        <Col xs={24} sm={12} lg={5}>
          <StatCard title="Đơn hàng" value={data?.totalOrders || 0} icon={<ShoppingCartOutlined />} />
        </Col>
        <Col xs={24} sm={12} lg={5}>
          <StatCard title="Khách hàng" value={data?.totalCustomers || 0} icon={<UserOutlined />} />
        </Col>
        <Col xs={24} sm={12} lg={5}>
          <StatCard title="Sản phẩm" value={data?.totalProducts || 0} icon={<AppstoreOutlined />} />
        </Col>
        <Col xs={24} sm={12} lg={5}>
          <StatCard title="Đơn trả hàng" value={data?.pendingReturns || 0} icon={<WarningOutlined style={{color: 'red'}} />} />
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* Bảng Top sản phẩm */}
        <Col xs={24} lg={12}>
          <Card title="Top 5 Sản phẩm bán chạy" bordered={false}>
            <Table columns={productColumns} dataSource={data?.topSellingProducts || []} rowKey="productId" pagination={false} />
          </Card>
        </Col>
        {/* Bảng Đơn hàng gần đây */}
        <Col xs={24} lg={12}>
          <Card title="Đơn hàng gần đây" bordered={false}>
            <Table columns={orderColumns} dataSource={data?.recentOrders || []} rowKey="orderId" pagination={false} />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardPage;