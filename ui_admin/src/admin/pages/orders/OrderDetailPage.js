import React, { useState, useEffect, useCallback } from 'react';
import { Card, Descriptions, Table, Tag, Select, Button, message, Spin, Space, Divider, Row, Col } from 'antd';
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { orderService } from '../../services/orderService';
import { formatCurrency } from '../../../shared/utils/formatters';
import { ORDER_STATUS_COLORS } from './OrderListPage';

const { Option } = Select;

const OrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState(null);

  const fetchOrderDetail = useCallback(async () => {
    setLoading(true);
    try {
      const res = await orderService.getOrderDetail(id);
      setOrder(res);
      setNewStatus(res.status); // Gán trạng thái hiện tại lên Select
    } catch (error) {
      message.error(error?.response?.data?.message || 'Không thể tải chi tiết đơn hàng');
      navigate('/admin/orders');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchOrderDetail();
  }, [fetchOrderDetail]);

  // Cập nhật trạng thái Tổng Đơn Hàng
  const handleUpdateOrderStatus = async () => {
    if (!newStatus || newStatus === order.status) return;
    setUpdatingStatus(true);
    try {
      await orderService.updateOrderStatus(id, newStatus);
      message.success('Cập nhật trạng thái đơn hàng thành công');
      fetchOrderDetail(); // Reload lại dữ liệu
    } catch (error) {
      message.error(error?.response?.data?.message || 'Cập nhật trạng thái thất bại');
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Cập nhật trạng thái Từng Sản Phẩm (OrderItem)
  const handleUpdateItemStatus = async (itemId, currentStatus, targetStatus) => {
    if (currentStatus === targetStatus) return;
    try {
      await orderService.updateOrderItemStatus(itemId, targetStatus);
      message.success('Đã cập nhật trạng thái sản phẩm');
      fetchOrderDetail(); // Reload lại dữ liệu
    } catch (error) {
      message.error(error?.response?.data?.message || 'Cập nhật trạng thái sản phẩm thất bại');
    }
  };

  if (loading || !order) {
    return <div style={{ textAlign: 'center', padding: '100px' }}><Spin size="large" /></div>;
  }

  const itemColumns = [
    {
      title: 'Sản phẩm',
      key: 'product',
      render: (_, record) => (
        <Space>
          <img src={record.imageUrl || record.primaryImageUrl || 'https://placehold.co/50x50'} alt="sp" style={{ width: 50, height: 50, borderRadius: 4, objectFit: 'cover' }} />
          <div>
            <div style={{ fontWeight: 600 }}>{record.productName}</div>
            <div style={{ fontSize: 12, color: '#888' }}>Màu: {record.color} - Size: {record.size}</div>
          </div>
        </Space>
      )
    },
    {
      title: 'Đơn giá',
      dataIndex: 'price',
      align: 'right',
      render: (price) => formatCurrency(price)
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      align: 'center'
    },
    {
      title: 'Thành tiền',
      key: 'total',
      align: 'right',
      render: (_, record) => <strong style={{ color: '#e53935' }}>{formatCurrency(record.price * record.quantity)}</strong>
    },
    {
      title: 'Trạng thái Item',
      key: 'itemStatus',
      align: 'center',
      render: (_, record) => (
        <Select 
          value={record.status || 'PENDING'} 
          size="small"
          style={{ width: 140 }}
          onChange={(val) => handleUpdateItemStatus(record.id || record.orderItemId, record.status, val)}
        >
          <Option value="PENDING">Chờ xử lý</Option>
          <Option value="PREPARED">Đã chuẩn bị</Option>
          <Option value="CANCELLED">Đã hủy</Option>
          <Option value="RETURNED">Đã trả hàng</Option>
        </Select>
      )
    }
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/admin/orders')} />
          <h2 style={{ margin: 0, fontSize: 24, fontWeight: 600 }}>Chi tiết đơn hàng #{order.id}</h2>
        </Space>
        
        {/* Cập nhật trạng thái tổng thể */}
        <Space>
          <span style={{ fontWeight: 500 }}>Trạng thái Đơn hàng:</span>
          <Select value={newStatus} onChange={setNewStatus} style={{ width: 180 }}>
            <Option value="PENDING_CONFIRMATION">Chờ xác nhận</Option>
            <Option value="PENDING_PAYMENT">Chờ thanh toán</Option>
            <Option value="PAID">Đã thanh toán</Option>
            <Option value="PROCESSING">Đang xử lý</Option>
            <Option value="SHIPPING">Đang giao hàng</Option>
            <Option value="DELIVERED">Đã giao hàng</Option>
            <Option value="COMPLETED">Hoàn thành</Option>
            <Option value="CANCELLED">Đã hủy</Option>
          </Select>
          <Button 
            type="primary" 
            icon={<SaveOutlined />} 
            onClick={handleUpdateOrderStatus}
            loading={updatingStatus}
            disabled={newStatus === order.status}
          >
            Lưu
          </Button>
        </Space>
      </div>

      <Row gutter={[24, 24]}>
        <Col span={24}>
          <Card title="Thông tin khách hàng & Giao hàng" bordered={false} style={{ borderRadius: 8 }}>
            <Descriptions column={{ xxl: 3, xl: 3, lg: 2, md: 1, sm: 1, xs: 1 }} bordered size="small">
              <Descriptions.Item label="Khách hàng">
                <strong>{order.user?.fullName || order.fullName || 'N/A'}</strong>
              </Descriptions.Item>
              <Descriptions.Item label="Số điện thoại">
                {order.user?.phone || order.phone || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                {order.user?.email || order.email || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Địa chỉ giao hàng" span={3}>
                {order.shippingAddress || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Thanh toán">
                {order.paymentMethod || 'COD'}
              </Descriptions.Item>
              <Descriptions.Item label="Tổng tiền" span={2}>
                <strong style={{ color: '#e53935', fontSize: 16 }}>{formatCurrency(order.totalAmount)}</strong>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        <Col span={24}>
          <Card title="Danh sách sản phẩm" bordered={false} style={{ borderRadius: 8 }}>
            <Table 
              columns={itemColumns} 
              dataSource={order.items || []} 
              rowKey={(record) => record.id || record.orderItemId}
              pagination={false}
              bordered
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default OrderDetailPage;