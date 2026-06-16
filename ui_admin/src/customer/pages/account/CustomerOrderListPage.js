import React, { useState, useEffect, useCallback } from 'react';
import { Card, Tabs, Button, Tag, Space, message, Spin, Typography, Modal, Input } from 'antd';
import { customerOrderService } from '../../services/customerOrderService';
import { formatCurrency } from '../../../shared/utils/formatters';
import { useNavigate } from 'react-router-dom';
import { checkoutService } from '../../services/checkoutService';

const { Text } = Typography;

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
  { key: 'PAID', label: 'Đã thanh toán' },
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

  // === STATE QUẢN LÝ MODAL HỦY ĐƠN THEO AC-US27 ===
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [cancelOrderId, setCancelOrderId] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [canceling, setCanceling] = useState(false);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page: 0, size: 50 }; 
      
      // LOGIC MỚI: Chỉ thêm statuses khi activeTab có giá trị (không phải tab Tất cả)
      if (activeTab) {
        // Đổi từ params.status thành params.statuses cho khớp với Backend
        // Axios sẽ tự động xử lý chuỗi này thành dạng ?statuses=PENDING_CONFIRMATION
        params.statuses = activeTab; 
      }

      const res = await customerOrderService.getOrders(params);
      
      // Lấy dữ liệu từ mảng content theo đúng cấu trúc { content: Array, totalPages: number }
      setOrders(res?.content || res?.items || res || []);
    } catch (error) {
      message.error('Không thể tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Mở Modal Nhập lý do hủy
  const openCancelModal = (orderId) => {
    setCancelOrderId(orderId);
    setCancelReason('');
    setCancelModalVisible(true);
  };

  // Xác nhận Gửi lệnh hủy đơn
  const submitCancelOrder = async () => {
    if (!cancelReason.trim()) {
      message.warning('Vui lòng nhập lý do hủy đơn hàng');
      return;
    }
    setCanceling(true);
    try {
      // SỬA LỖI: Truyền Object Payload có chứa Reason
      await customerOrderService.cancelOrder({
        orderId: cancelOrderId,
        cancellationReason: cancelReason.trim()
      });
      message.success('Hủy đơn hàng thành công!');
      setCancelModalVisible(false);
      
      // AC-FE-US27-02: Cập nhật giao diện thẻ sang Đã Hủy ngay lập tức
      setOrders(prevOrders => prevOrders.map(order => 
        (order.id === cancelOrderId || order.orderId === cancelOrderId)
          ? { ...order, status: 'CANCELLED' } 
          : order
      ));
    } catch (error) {
      message.error(error?.response?.data?.message || 'Hủy đơn hàng thất bại');
    } finally {
      setCanceling(false);
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
              // SỬA LỖI TRẮNG TRANG: Bỏ qua nếu đơn hàng bị Null từ Server
              if (!order) return null; 

              const orderId = order.id || order.orderId;
              const canCancel = order.status === 'PENDING_CONFIRMATION' || order.status === 'PENDING_PAYMENT';

              return (
                <Card key={orderId} type="inner" style={{ border: '1px solid #eaeaea' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f0f0f0', paddingBottom: 12, marginBottom: 16 }}>
                    <Text strong>Mã đơn hàng: #{orderId}</Text>
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
                      <Text style={{ color: '#e53935', fontSize: 18, fontWeight: 700 }}>
                        {formatCurrency(order.totalAmount || order.finalAmount)}
                      </Text>
                    </div>
                    <Space>
                      <Button 
                          type="default" 
                          onClick={() => navigate(`/account/orders/${orderId}`)}
                          >
                          Xem chi tiết
                      </Button>
                      {order.status === 'PENDING_PAYMENT' && (
                        <Button 
                          type="primary" 
                          style={{ background: '#e11b8d', borderColor: '#e11b8d' }}
                          onClick={async () => {
                            try {
                              message.loading('Đang khởi tạo lại phiên thanh toán...', 0);
                              const res = await checkoutService.retryMomoPayment(orderId);
                              
                              // AC-FE-US29-02: Chuyển hướng sang link thanh toán mới
                              if (res.paymentUrl) {
                                window.location.href = res.paymentUrl;
                              } else {
                                message.error('Không lấy được đường dẫn thanh toán!');
                              }
                            } catch (error) {
                              message.error(error?.response?.data?.message || 'Không thể thanh toán lại!');
                            } finally {
                              message.destroy();
                            }
                          }}
                        >
                          Thanh toán ngay
                        </Button>
                      )}
                      
                      {canCancel && (
                        <Button danger onClick={() => openCancelModal(orderId)}>Hủy đơn hàng</Button>
                      )}
                    </Space>
                  </div>
                </Card>
              );
            })}
          </Space>
        )}
      </Card>

      {/* MODAL HỦY ĐƠN HÀNG ĐẠT CHUẨN AC-US27 */}
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
        <p>Bạn có chắc chắn muốn hủy đơn hàng <strong>#{cancelOrderId}</strong> không?</p>
        <div style={{ marginTop: 16 }}>
          <div style={{ marginBottom: 8, fontWeight: 500 }}>Lý do hủy đơn: <span style={{ color: 'red' }}>*</span></div>
          <Input.TextArea 
            rows={3}
            placeholder="Vui lòng nhập lý do (VD: Tôi muốn đổi kích thước, thay đổi địa chỉ...)"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
          />
        </div>
      </Modal>
    </div>
  );
};

export default CustomerOrderListPage;