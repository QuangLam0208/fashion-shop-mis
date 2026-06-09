import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, Button, Typography, Space, message } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { customerOrderService } from '../../services/customerOrderService';
import { formatCurrency, formatDateTime } from '../../../shared/utils/formatters';
import { STATUS_COLORS, STATUS_MAP } from '../../../shared/constants';

const { Title, Text } = Typography;

const CustomerOrderListPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await customerOrderService.getOrders();
      // AC-US28-02: Backend đã sort, nhưng dự phòng sort giảm dần theo thời gian ở Frontend
      const sortedList = (Array.isArray(data) ? data : (data?.data || [])).sort((a, b) => 
        new Date(b.orderDate || b.createdAt) - new Date(a.orderDate || a.createdAt)
      );
      setOrders(sortedList);
    } catch (error) {
      message.error('Không thể tải lịch sử đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Mã ĐH',
      dataIndex: 'orderId',
      key: 'orderId',
      render: (id) => <Text strong>#{id}</Text>,
    },
    {
      title: 'Ngày đặt',
      key: 'orderDate',
      render: (_, record) => formatDateTime(record.orderDate || record.createdAt),
    },
    {
      title: 'Tổng tiền',
      key: 'totalAmount',
      align: 'right',
      render: (_, record) => (
        <Text style={{ color: '#e53935', fontWeight: 600 }}>
          {formatCurrency(record.totalAmount || record.finalAmount)}
        </Text>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={STATUS_COLORS[status] || 'blue'}>
          {STATUS_MAP[status] || status}
        </Tag>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      align: 'center',
      render: (_, record) => (
        <Button 
          type="primary" 
          ghost 
          icon={<EyeOutlined />} 
          onClick={() => navigate(`/account/orders/${record.orderId}`)}
        >
          Xem chi tiết
        </Button>
      ),
    },
  ];

  return (
    <Card 
      title={<Title level={4} style={{ margin: 0 }}>Lịch sử đơn hàng</Title>} 
      bordered={false}
      style={{ borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}
    >
      <Table 
        columns={columns} 
        dataSource={orders} 
        rowKey={(record) => record.orderId || record.id}
        loading={loading}
        pagination={{ pageSize: 10 }}
        locale={{ emptyText: 'Bạn chưa có đơn hàng nào.' }} // Tránh vỡ UI khi rỗng
      />
    </Card>
  );
};

export default CustomerOrderListPage;