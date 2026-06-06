import React, { useState, useEffect, useCallback } from 'react';
import { Card, Tabs, Button, Tag, Space, message, Spin, Typography, Popconfirm } from 'antd';
import { customerOrderService } from '../../services/customerOrderService';
import { formatCurrency } from '../../../shared/utils/formatters';
import { useNavigate } from 'react-router-dom';

const { Text } = Typography;

// 1. Cập nhật Map tiếng Việt
const STATUS_MAP = {
  PENDING_CONFIRMATION: 'Chờ xác nhận',
  PENDING_PAYMENT: 'Chờ thanh toán',
  PAID: 'Đã thanh toán',
  PROCESSING: 'Đang xử lý',
  SHIPPING: 'Đang giao hàng',
  DELIVERED: 'Đã giao hàng',
  COMPLETED: 'Hoàn thành',
  CANCELLED: 'Đã hủy',
  PAYMENT_FAILED: 'Thanh toán thất bại',
  PAYMENT_EXPIRED: 'Hết hạn thanh toán'
};

// 2. Cập nhật bảng màu chuẩn
const STATUS_COLORS = {
  PENDING_CONFIRMATION: 'orange',
  PENDING_PAYMENT: 'gold',
  PAID: 'lime',
  PROCESSING: 'blue',
  SHIPPING: 'cyan',
  DELIVERED: 'geekblue',
  COMPLETED: 'green',
  CANCELLED: 'red',
  PAYMENT_FAILED: 'volcano',
  PAYMENT_EXPIRED: 'magenta'
};

const ORDER_TABS = [
  { key: '', label: 'Tất cả' },
  { key: 'PENDING_CONFIRMATION', label: 'Chờ xác nhận' },
  { key: 'PENDING_PAYMENT', label: 'Chờ thanh toán' },
  { key: 'PROCESSING', label: 'Đang xử lý' },
  { key: 'SHIPPING', label: 'Đang giao hàng' },
  { key: 'DELIVERED', label: 'Đã giao hàng' },
  { key: 'COMPLETED', label: 'Hoàn thành' },
  { key: 'CANCELLED', label: 'Đã hủy' },
];

const CustomerOrderListPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('');
  const navigate = useNavigate();

  // ĐÃ XÓA dòng khai báo canCancel bị lỗi ở đây

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page: 0, size: 50 }; // Demo load nhanh 50 đơn
      if (activeTab) {
        params.statuses = activeTab; 
      }
      const res = await customerOrderService.getMyOrders(params);
      setOrders(res.content || []);
    } catch (error) {
      message.error('Không thể tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleCancelOrder = async (orderId) => {
    try {
      await customerOrderService.cancelOrder(orderId, 'Tôi muốn thay đổi đơn hàng');
      message.success('Hủy đơn hàng thành công!');
      fetchOrders();
    } catch (error) {
      message.error(error?.response?.data?.message || 'Hủy đơn hàng thất bại');
    }
  };

  return (
    <div className="c-container" style={{ padding: '32px 0', minHeight: '80vh' }}>
      <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>Đơn mua của tôi</h2>
      
      <Card bordered={false} style={{ borderRadius: 12 }}>
        <Tabs activeKey={activeTab} onChange={setActiveTab} items={ORDER_TABS} />
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px 0' }}><Spin /></div>
        ) : orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px 0', color: '#888' }}>Chưa có đơn hàng nào.</div>
        ) : (
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            {orders.map(order => {
              // CHUYỂN LOGIC KIỂM TRA HỦY VÀO TRONG VÒNG LẶP
              const canCancel = order.status === 'PENDING_CONFIRMATION' || order.status === 'PENDING_PAYMENT';

              return (
                <Card key={order.id || order.orderId} type="inner" style={{ border: '1px solid #eaeaea' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f0f0f0', paddingBottom: 12, marginBottom: 16 }}>
                    <Text strong>Mã đơn hàng: #{order.id || order.orderId}</Text>
                    {/* Hiển thị Trạng thái tiếng Việt */}
                    <Tag color={STATUS_COLORS[order.status] || 'default'}>
                      {STATUS_MAP[order.status] || order.status}
                    </Tag>
                  </div>
                  
                  <div style={{ marginBottom: 16 }}>
                     <Text type="secondary">Thanh toán bằng: {order.paymentMethod || 'COD'}</Text>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <Text>Tổng tiền: </Text>
                      <Text style={{ color: '#e53935', fontSize: 18, fontWeight: 700 }}>{formatCurrency(order.totalAmount)}</Text>
                    </div>
                    <Space>
                      <Button 
                          type="default" 
                          onClick={() => navigate(`/account/orders/${order.id || order.orderId}`)}
                          >
                          Xem chi tiết
                      </Button>
                      
                      {canCancel && (
                        <Popconfirm
                          title="Bạn có chắc chắn muốn hủy đơn hàng này?"
                          onConfirm={() => handleCancelOrder(order.id || order.orderId)}
                          okText="Có, Hủy"
                          cancelText="Không"
                        >
                          <Button danger>Hủy đơn hàng</Button>
                        </Popconfirm>
                      )}
                    </Space>
                  </div>
                </Card>
              );
            })}
          </Space>
        )}
      </Card>
    </div>
  );
};

export default CustomerOrderListPage;