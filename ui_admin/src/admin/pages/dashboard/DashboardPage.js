import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Table, Typography, Spin } from 'antd';
import { DollarOutlined, ShoppingCartOutlined, UserOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import StatCard   from '../../components/StatCard';
import PageHeader from '../../components/PageHeader';
import { dashboardService } from '../../services/dashboardService';
import { formatCurrency }   from '../../../shared/utils/formatters';
import { ORDER_STATUS }     from '../../../shared/constants';

const { Text } = Typography;
const PIE_COLORS = ['#6366f1','#f59e0b','#3b82f6','#22c55e','#ef4444','#8b5cf6'];

const DashboardPage = () => {
  const [stats, setStats]             = useState(null);
  const [revenue, setRevenue]         = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [orderStatus, setOrderStatus] = useState([]);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [s, r, t, o] = await Promise.all([
          dashboardService.getStats(), dashboardService.getRevenue(),
          dashboardService.getTopProducts(), dashboardService.getOrderStatusStats(),
        ]);
        setStats(s); setRevenue(r); setTopProducts(t);
        setOrderStatus(o.map(x => ({ ...x, name: ORDER_STATUS[x.status]?.label || x.status })));
      } finally { setLoading(false); }
    })();
  }, []);

  if (loading) return <div style={{ display:'flex', justifyContent:'center', paddingTop:80 }}><Spin size="large" /></div>;

  const topCols = [
    { title: '#', render: (_, __, i) => i + 1, width: 48 },
    { title: 'Sản phẩm', dataIndex: 'name' },
    { title: 'Đã bán', dataIndex: 'sold', align: 'right' },
    { title: 'Doanh thu', dataIndex: 'revenue', align: 'right', render: v => formatCurrency(v) },
  ];

  return (
    <div>
      <PageHeader title="Dashboard" breadcrumbs={[{ label: 'Dashboard' }]} />
      <Row gutter={[16,16]}>
        <Col xs={24} sm={12} xl={6}><StatCard title="Tổng doanh thu"  value={stats?.total_revenue}   icon={<DollarOutlined />}       formatter={v => formatCurrency(v)} color="#6366f1" growth={12} /></Col>
        <Col xs={24} sm={12} xl={6}><StatCard title="Tổng đơn hàng"   value={stats?.total_orders}    icon={<ShoppingCartOutlined />}  color="#f59e0b" growth={8}  /></Col>
        <Col xs={24} sm={12} xl={6}><StatCard title="Khách hàng"       value={stats?.total_customers} icon={<UserOutlined />}          color="#22c55e" growth={5}  /></Col>
        <Col xs={24} sm={12} xl={6}><StatCard title="Đơn chờ xử lý"   value={stats?.pending_orders}  icon={<ClockCircleOutlined />}   color="#ef4444" /></Col>
      </Row>
      <Row gutter={[16,16]} style={{ marginTop:16 }}>
        <Col xs={24} xl={16}>
          <Card title="Doanh thu theo tháng" style={{ borderRadius:12, border:'none', boxShadow:'0 1px 8px rgba(0,0,0,0.08)' }}>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={revenue} margin={{ top:5, right:20, left:10, bottom:5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize:12 }} />
                <YAxis tickFormatter={v => `${(v/1e6).toFixed(0)}tr`} tick={{ fontSize:12 }} />
                <Tooltip formatter={v => [formatCurrency(v), 'Doanh thu']} />
                <Bar dataKey="revenue" fill="#6366f1" radius={[6,6,0,0]} name="Doanh thu" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col xs={24} xl={8}>
          <Card title="Trạng thái đơn hàng" style={{ borderRadius:12, border:'none', boxShadow:'0 1px 8px rgba(0,0,0,0.08)' }}>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={orderStatus} dataKey="count" nameKey="name" cx="50%" cy="45%" outerRadius={90} label={({ percent }) => `${(percent*100).toFixed(0)}%`}>
                  {orderStatus.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Legend iconType="circle" iconSize={10} formatter={v => <Text style={{ fontSize:11 }}>{v}</Text>} />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>
      <Row style={{ marginTop:16 }}>
        <Col span={24}>
          <Card title="Top 5 sản phẩm bán chạy" style={{ borderRadius:12, border:'none', boxShadow:'0 1px 8px rgba(0,0,0,0.08)' }}>
            <Table dataSource={topProducts} columns={topCols} rowKey="product_id" pagination={false} size="middle" />
          </Card>
        </Col>
      </Row>
    </div>
  );
};
export default DashboardPage;