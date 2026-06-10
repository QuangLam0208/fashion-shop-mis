import React, { useState, useEffect } from 'react';
import { Card, Descriptions, Tag, Table, Space, Button, Modal, Input, message, Typography } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { customerOrderService } from '../../services/customerOrderService';
import { formatCurrency } from '../../../shared/utils/formatters';
import { checkoutService } from '../../services/checkoutService';

const { Title, Text } = Typography;

const OrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  // === STATE CHO MODAL HỦY ĐƠN ===
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [canceling, setCanceling] = useState(false);

  useEffect(() => {
    fetchOrderDetail();
    // eslint-disable-next-line
  }, [id]);

  const fetchOrderDetail = async () => {
    setLoading(true);
    try {
      const data = await customerOrderService.getOrderDetail(id);
      setOrder(data);
    } catch (error) {
      message.error('Không thể tải chi tiết đơn hàng');
      navigate('/account/orders');
    } finally {
      setLoading(false);
    }
  };

  const submitCancelOrder = async () => {
    if (!cancelReason.trim()) {
      message.warning('Vui lòng nhập lý do hủy đơn hàng');
      return;
    }
    setCanceling(true);
    try {
      await customerOrderService.cancelOrder({
        orderId: id,
        cancellationReason: cancelReason.trim()
      });
      message.success('Hủy đơn hàng thành công!');
      setCancelModalVisible(false);
      
      // AC-FE-US27-02: Cập nhật UI ngay lập tức
      setOrder(prev => ({ ...prev, status: 'CANCELLED' }));
    } catch (error) {
      const errorMsg = error?.response?.data?.message || 'Có lỗi xảy ra khi hủy đơn hàng';
      message.error(errorMsg);
    } finally {
      setCanceling(false);
    }
  };

  const handleRetryPayment = async () => {
    try {
        message.loading('Đang khởi tạo lại phiên thanh toán...', 0);
        const res = await checkoutService.retryMomoPayment(order.id || order.orderId);
        if (res.paymentUrl) {
        window.location.href = res.paymentUrl;
        }
    } catch (error) {
        message.error(error?.response?.data?.message || 'Lỗi thanh toán lại');
    } finally {
        message.destroy();
    }
    };

  if (loading) return <div>Đang tải...</div>;
  if (!order) return null;

  const canCancel = order.status === 'PENDING_PAYMENT' || order.status === 'PENDING_CONFIRMATION';

  const columns = [
    { title: 'Sản phẩm', key: 'product', render: (_, record) => (
        <Space>
          <img src={record.imageUrl || record.productImage || 'https://placehold.co/50x50'} alt="img" style={{ width: 50, height: 50, borderRadius: 4, objectFit: 'cover' }} />
          <div>
            <div>{record.productName}</div>
            <div style={{ fontSize: 12, color: '#888' }}>Phân loại: {record.color} / {record.size}</div>
          </div>
        </Space>
      )
    },
    { title: 'Đơn giá', dataIndex: 'price', align: 'right', render: (price) => formatCurrency(price) },
    { title: 'Số lượng', dataIndex: 'quantity', align: 'center' },
    { title: 'Thành tiền', key: 'total', align: 'right', render: (_, record) => <strong style={{ color: '#e53935' }}>{formatCurrency(record.price * record.quantity)}</strong> }
  ];

  return (
    <Card 
      title={<Space><Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate('/account/orders')} />Chi tiết đơn hàng #{order.id || order.orderId}</Space>} 
      bordered={false} 
      style={{ borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}
      extra={
        <Space>
            {/* Nút Hủy đơn (chỉ hiện khi đang chờ) */}
            {canCancel && (
            <Button danger onClick={() => setCancelModalVisible(true)}>
                Hủy đơn hàng
            </Button>
            )}
            
            {/* BỔ SUNG: Nút Thanh toán lại (chỉ hiện khi PENDING_PAYMENT) */}
            {order.status === 'PENDING_PAYMENT' && order.paymentMethod === 'MOMO' && (
            <Button 
                type="primary" 
                style={{ background: '#e11b8d', borderColor: '#e11b8d' }}
                onClick={handleRetryPayment}
            >
                Thanh toán ngay
            </Button>
            )}
        </Space>
        }
    >
      <Descriptions bordered column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }} style={{ marginBottom: 24 }}>
        <Descriptions.Item label="Trạng thái">
           <Tag color={order.status === 'CANCELLED' ? 'error' : 'blue'}>{order.status}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Ngày đặt hàng">{new Date(order.createdAt).toLocaleString('vi-VN')}</Descriptions.Item>
        <Descriptions.Item label="Phương thức thanh toán">{order.paymentMethod}</Descriptions.Item>
        <Descriptions.Item label="Địa chỉ giao hàng">{order.shippingAddress}</Descriptions.Item>
      </Descriptions>

      <Title level={5}>Sản phẩm đã đặt</Title>
      <Table 
        columns={columns} 
        dataSource={order.items || order.orderItems || []} 
        rowKey={(record) => record.id || record.orderItemId}
        pagination={false}
      />
      
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
        <div style={{ width: 300 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
             <Text>Tổng tiền hàng:</Text>
             <Text>{formatCurrency((order.totalAmount || order.finalAmount) + (order.discount || 0))}</Text>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
             <Text>Giảm giá:</Text>
             <Text style={{ color: '#389e0d' }}>- {formatCurrency(order.discount || 0)}</Text>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #eee', paddingTop: 8 }}>
             <Title level={4}>Tổng thanh toán:</Title>
             <Title level={4} style={{ color: '#e53935' }}>{formatCurrency(order.totalAmount || order.finalAmount)}</Title>
          </div>
        </div>
      </div>

      {/* MODAL HỦY ĐƠN HÀNG */}
      <Modal
        title="Xác nhận hủy đơn hàng"
        open={cancelModalVisible}
        onOk={submitCancelOrder}
        confirmLoading={canceling}
        onCancel={() => setCancelModalVisible(false)}
        okText="Xác nhận hủy"
        cancelText="Đóng"
        okButtonProps={{ danger: true }}
      >
        <p>Bạn có chắc chắn muốn hủy đơn hàng này không?</p>
        <div style={{ marginTop: 16 }}>
          <div style={{ marginBottom: 8, fontWeight: 500 }}>Lý do hủy đơn: <span style={{ color: 'red' }}>*</span></div>
          <Input.TextArea 
            rows={3}
            placeholder="Vui lòng nhập lý do (VD: Tôi muốn đổi kích thước...)"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
          />
        </div>
      </Modal>
    </Card>
  );
};

export default OrderDetailPage;