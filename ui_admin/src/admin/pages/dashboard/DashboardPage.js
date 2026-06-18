import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Table, Spin, message, Typography, Tag } from 'antd';
import { ShoppingCartOutlined, DollarCircleOutlined, UserOutlined, AppstoreOutlined, WarningOutlined } from '@ant-design/icons';
// Import các component của Recharts
import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

import StatCard from '../../components/StatCard';
import { formatCurrency, formatDateTime } from '../../../shared/utils/formatters';
import { dashboardService } from '../../services/dashboardService';

const { Title } = Typography;

// Hàm xử lý dữ liệu từ recentOrders để vẽ biểu đồ
const processChartData = (orders) => {
  if (!orders || orders.length === 0) return [];
  const grouped = {};
  
  orders.forEach(order => {
    const dateObj = new Date(order.orderDate);
    const dateStr = `${dateObj.getDate()}/${dateObj.getMonth() + 1}`; // Format dạng DD/MM
    
    if (!grouped[dateStr]) {
      grouped[dateStr] = { date: dateStr, revenue: 0, totalCount: 0, returnCount: 0 };
    }
    
    // Chỉ cộng doanh thu các đơn hàng hợp lệ (Không tính đơn Đã trả/Đã hủy)
    if (order.status !== 'RETURNED' && order.status !== 'CANCELLED') {
      grouped[dateStr].revenue += order.totalAmount;
    }
    
    grouped[dateStr].totalCount += 1;
    if (order.status === 'RETURNED') {
      grouped[dateStr].returnCount += 1;
    }
  });

  // Chuyển thành mảng, tính phần trăm tỷ lệ trả hàng và đảo ngược (để ngày cũ hiển thị trước)
  return Object.values(grouped).map(item => ({
    date: item.date,
    revenue: item.revenue,
    returnRate: item.totalCount > 0 ? Math.round((item.returnCount / item.totalCount) * 100) : 0
  })).reverse(); 
};

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

  const chartData = processChartData(data?.recentOrders);

  // Cấu hình bảng Top sản phẩm (Đã map ảnh primaryImageUrl)
  const productColumns = [
    { 
      title: 'Sản phẩm', 
      key: 'productName',
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img 
            src={record.primaryImageUrl || 'https://placehold.co/40x40?text=No+Img'} 
            alt={record.productName} 
            style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: '4px', border: '1px solid #f0f0f0' }} 
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
    { title: 'Mã đơn', dataIndex: 'orderId', key: 'orderId', render: val => <strong>#{val}</strong> },
    { title: 'Khách hàng', dataIndex: 'customerName', key: 'customerName' },
    { title: 'Tổng tiền', dataIndex: 'totalAmount', render: (val) => formatCurrency(val) },
    { 
      title: 'Trạng thái', 
      dataIndex: 'status', 
      render: (val) => {
        let color = 'blue';
        if (val === 'DELIVERED') color = 'green';
        if (val === 'RETURNED' || val === 'CANCELLED') color = 'red';
        return <Tag color={color}>{val}</Tag>;
      } 
    },
    { title: 'Ngày đặt', dataIndex: 'orderDate', render: (val) => formatDateTime(val) }
  ];

  if (loading) return <div style={{ textAlign: 'center', padding: 100 }}><Spin size="large" /></div>;

  return (
    <div style={{ padding: 24 }}>
      <Title level={3} style={{ marginBottom: 24 }}>Dashboard Tổng quan</Title>
      
      {/* 5 Thẻ chỉ số */}
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

      {/* BIỂU ĐỒ KẾT HỢP (DOANH THU & ĐỔI TRẢ) */}
      <Card title="Biến động Doanh số & Tỷ lệ Đổi trả hàng hóa" bordered={false} style={{ marginBottom: 24, borderRadius: 8 }}>
        <ResponsiveContainer width="100%" height={350}>
          <ComposedChart data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={{ fill: '#888' }} axisLine={false} tickLine={false} />
            
            {/* Trục Y trái cho Doanh thu */}
            <YAxis yAxisId="left" orientation="left" tickFormatter={(val) => `${val / 1000}k`} tick={{ fill: '#1677ff' }} axisLine={false} tickLine={false} />
            
            {/* Trục Y phải cho Tỷ lệ đổi trả (%) */}
            <YAxis yAxisId="right" orientation="right" tickFormatter={(val) => `${val}%`} tick={{ fill: '#ff4d4f' }} axisLine={false} tickLine={false} domain={[0, 100]} />
            
            <Tooltip 
              formatter={(value, name) => {
                if (name === 'Doanh thu') return [formatCurrency(value), name];
                return [`${value}%`, name];
              }}
              labelStyle={{ fontWeight: 'bold', color: '#333' }}
              borderRadius={8}
            />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            
            {/* Cột xanh: Doanh thu */}
            <Bar yAxisId="left" dataKey="revenue" name="Doanh thu" fill="#1677ff" radius={[4, 4, 0, 0]} maxBarSize={50} />
            
            {/* Đường đỏ: Tỷ lệ đổi trả */}
            <Line yAxisId="right" type="monotone" dataKey="returnRate" name="Tỷ lệ đổi trả" stroke="#ff4d4f" strokeWidth={3} dot={{ r: 5, fill: '#fff', stroke: '#ff4d4f', strokeWidth: 2 }} activeDot={{ r: 8 }} />
          </ComposedChart>
        </ResponsiveContainer>
      </Card>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="Top 5 Sản phẩm bán chạy" bordered={false} style={{ height: '100%' }}>
            <Table columns={productColumns} dataSource={data?.topSellingProducts || []} rowKey="productId" pagination={false} size="middle" />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Đơn hàng gần đây" bordered={false} style={{ height: '100%' }}>
            <Table columns={orderColumns} dataSource={data?.recentOrders || []} rowKey="orderId" pagination={false} size="middle" />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardPage;