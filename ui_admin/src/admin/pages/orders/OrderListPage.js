import React, { useState, useEffect, useCallback } from 'react';
import { Card, Table, Tag, Button, Select, Space, message, DatePicker } from 'antd';
import { EyeOutlined, ReloadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { orderService } from '../../services/orderService';
import { formatCurrency } from '../../../shared/utils/formatters';
import { STATUS_COLORS, STATUS_MAP } from '../../../shared/constants';

const { Option } = Select;
const { RangePicker } = DatePicker;

export const ORDER_STATUS_COLORS = {
  PENDING_CONFIRMATION: 'orange',
  PROCESSING: 'blue',
  SHIPPING: 'cyan',
  COMPLETED: 'green',
  CANCELLED: 'red',
  RETURNED: 'volcano'
};

const OrderListPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [dateRange, setDateRange] = useState([]);

  // Filters
  const [statusFilter, setStatusFilter] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: page - 1, // Spring Boot page starts at 0
        size: pageSize,
      };
      if (statusFilter) params.status = statusFilter;
      if (dateRange && dateRange.length === 2) {
        params.startDate = dateRange[0].format('YYYY-MM-DD');
        params.endDate = dateRange[1].format('YYYY-MM-DD');
      }

      const res = await orderService.getOrders(params);
      
      setOrders(res.content || []);
      setTotal(res.totalElements || 0);
    } catch (error) {
      message.error(error?.response?.data?.message || 'Lỗi khi tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, statusFilter, dateRange]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const columns = [
    {
      title: 'Mã ĐH',
      dataIndex: 'id',
      key: 'id',
      render: (id) => <strong>#{id}</strong>,
    },
    {
      title: 'Khách hàng',
      key: 'customerName',
      render: (_, record) => record.customerName || 'Khách vãng lai'
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      align: 'right',
      render: (amount) => <strong style={{ color: '#e53935' }}>{formatCurrency(amount)}</strong>
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={STATUS_COLORS[status] || 'default'}>
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
          icon={<EyeOutlined />} 
          size="small"
          onClick={() => navigate(`/admin/orders/${record.orderId}`)}
        >
          Chi tiết
        </Button>
      )
    }
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ margin: 0, fontSize: 24, fontWeight: 600 }}>Quản lý Đơn hàng</h2>
      </div>

      <Card bordered={false} style={{ borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
        <Space style={{ marginBottom: 16 }}>
          <Select 
            placeholder="Lọc theo trạng thái" 
            style={{ width: 200 }} 
            allowClear
            value={statusFilter}
            onChange={(val) => { setStatusFilter(val); setPage(1); }}
          >
            <Option value="PENDING_CONFIRMATION">Chờ xác nhận</Option>
            <Option value="PENDING_PAYMENT">Chờ thanh toán</Option>
            <Option value="PAID">Đã thanh toán</Option>
            <Option value="PROCESSING">Đang xử lý</Option>
            <Option value="SHIPPING">Đang giao hàng</Option>
            <Option value="DELIVERED">Đã giao hàng</Option>
            <Option value="COMPLETED">Hoàn thành</Option>
            <Option value="CANCELLED">Đã hủy</Option>
            <Option value="PAYMENT_FAILED">Thanh toán thất bại</Option>
            <Option value="PAYMENT_EXPIRED">Hết hạn thanh toán</Option>
          </Select>
          <RangePicker 
            onChange={(dates) => { setDateRange(dates); setPage(1); }} 
            placeholder={['Từ ngày', 'Đến ngày']}
          />
          <Button icon={<ReloadOutlined />} onClick={fetchOrders}>Làm mới</Button>
        </Space>

        <Table 
          columns={columns} 
          dataSource={orders} 
          rowKey="id"
          loading={loading}
          pagination={{
            current: page,
            pageSize: pageSize,
            total: total,
            showSizeChanger: true,
            onChange: (p, s) => {
              setPage(p);
              setPageSize(s);
            }
          }}
        />
      </Card>
    </div>
  );
};

export default OrderListPage;