import React, { useState, useEffect, useCallback } from 'react';
import { Card, Descriptions, Table, Select, Button, message, Spin, Space, Row, Col, Typography, Timeline, Tag, Divider } from 'antd';
import { ArrowLeftOutlined, ClockCircleOutlined, CheckCircleOutlined, CarOutlined, InboxOutlined, PrinterOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { orderService } from '../../services/orderService';
import { formatCurrency, formatDateTime } from '../../../shared/utils/formatters';
import { STATUS_COLORS, STATUS_MAP } from '../../../shared/constants'; 

const { Title, Text } = Typography;
const { Option } = Select;

// Bổ sung trạng thái CONFIRMED nếu STATUS_MAP dùng chung chưa có
const EXTENDED_STATUS_MAP = {
  ...STATUS_MAP,
  CONFIRMED: 'Đã xác nhận'
};

// AC-US32-01: MA TRẬN CHUYỂN ĐỔI TRẠNG THÁI NGHIÊM NGẶT
const ORDER_TRANSITIONS = {
  PENDING_CONFIRMATION: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PROCESSING'],
  PROCESSING: ['SHIPPING'],
  SHIPPING: ['DELIVERED', 'RETURNED'],
};

const OrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null); 
  const [printing, setPrinting] = useState(false);

  const fetchOrderDetail = useCallback(async () => {
    setLoading(true);
    try {
      const res = await orderService.getOrderDetail(id);
      setOrder(res?.data || res); // Fix an toàn nếu BE bọc trong data
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

  // HÀM XỬ LÝ CHUYỂN ĐỔI TRẠNG THÁI TỔNG (AC-US32)
  const handleTransitionStatus = async (targetStatus) => {
    setActionLoading(targetStatus);
    try {
      await orderService.updateOrderStatus({
        orderId: parseInt(id),
        status: targetStatus
      });
      message.success(`Đã cập nhật trạng thái đơn hàng thành: ${EXTENDED_STATUS_MAP[targetStatus]}`);
      fetchOrderDetail();
    } catch (error) {
      message.error(error?.response?.data?.message || 'Cập nhật trạng thái thất bại');
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdateItemStatus = async (itemId, currentStatus, targetStatus) => {
    if (currentStatus === targetStatus) return;
    try {
      await orderService.updateOrderItemStatus(itemId, targetStatus);
      message.success('Đã cập nhật trạng thái sản phẩm');
      fetchOrderDetail();
    } catch (error) {
      message.error(error?.response?.data?.message || 'Cập nhật trạng thái sản phẩm thất bại');
    }
  };

  // AC-FE-US47-02: Hàm xử lý xuất Hóa đơn PDF
  const handleExportPDF = async () => {
    setPrinting(true);
    message.loading({ content: 'Đang khởi tạo hóa đơn PDF...', key: 'pdfExport' });
    try {
      const blob = await orderService.exportInvoicePDF(id);
      const fileURL = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
      window.open(fileURL, '_blank');
      message.success({ content: 'Xuất hóa đơn thành công!', key: 'pdfExport' });
    } catch (error) {
      message.error({ content: 'Có lỗi xảy ra khi xuất hóa đơn PDF', key: 'pdfExport' });
    } finally {
      setPrinting(false);
    }
  };

  const getTimelineData = () => {
    if (!order?.items) return [];
    let allHistories = [];
    order.items.forEach(item => {
      if (item.histories && item.histories.length > 0) {
        allHistories.push(...item.histories);
      }
    });
    allHistories.sort((a, b) => new Date(a.changeDate).getTime() - new Date(b.changeDate).getTime());

    const uniqueHistories = [];
    allHistories.forEach(h => {
      const last = uniqueHistories[uniqueHistories.length - 1];
      if (last && last.newStatus === h.newStatus && 
          Math.abs(new Date(last.changeDate).getTime() - new Date(h.changeDate).getTime()) < 2000) {
        return; 
      }
      uniqueHistories.push(h);
    });

    if (uniqueHistories.length === 0 && order) {
       uniqueHistories.push({ newStatus: order.status, changeDate: order.orderDate });
    }
    return uniqueHistories;
  };

  if (loading || !order) {
    return <div style={{ textAlign: 'center', padding: '100px' }}><Spin size="large" /></div>;
  }

  // AC-US47-02: Kiểm tra điều kiện hiển thị nút PDF
  const canExportPDF = order.orderType === 'OFFLINE' || order.status === 'COMPLETED';
  const timelineData = getTimelineData();
  const availableTransitions = ORDER_TRANSITIONS[order.status] || [];

  const itemColumns = [
    {
      title: 'Sản phẩm',
      key: 'product',
      render: (_, record) => (
        <Space>
          <img src={record.productImage || 'https://placehold.co/50x50?text=No+Image'} alt="sp" style={{ width: 50, height: 50, borderRadius: 6, objectFit: 'cover', border: '1px solid #eee' }} />
          <div>
            <div style={{ fontWeight: 600, color: '#1a1a1a' }}>{record.productName}</div>
            <div style={{ fontSize: 12, color: '#64748b' }}>
              Phân loại: {record.color || 'N/A'} {record.size ? `- ${record.size}` : ''}
            </div>
          </div>
        </Space>
      )
    },
    { title: 'Đơn giá', dataIndex: 'price', align: 'right', render: (price) => formatCurrency(price) },
    { title: 'Số lượng', dataIndex: 'quantity', align: 'center' },
    { title: 'Thành tiền', key: 'total', align: 'right', render: (_, record) => <strong style={{ color: '#e53935' }}>{formatCurrency(record.price * record.quantity)}</strong> },
    {
      title: 'Trạng thái Item',
      key: 'itemStatus',
      align: 'center',
      render: (_, record) => (
        <Select 
          value={record.status} 
          size="small"
          style={{ width: 140 }}
          onChange={(val) => handleUpdateItemStatus(record.orderItemId, record.status, val)}
          disabled={record.status === 'CANCELLED' || record.status === 'COMPLETED' || record.status === 'RETURNED'}
        >
          {Object.keys(EXTENDED_STATUS_MAP).map(key => (
            <Option key={key} value={key}>{EXTENDED_STATUS_MAP[key]}</Option>
          ))}
        </Select>
      )
    }
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/admin/orders')} />
          <h2 style={{ margin: 0, fontSize: 24, fontWeight: 600 }}>Chi tiết Đơn hàng #{order.orderId}</h2>
          
          {/* NÚT XUẤT HÓA ĐƠN PDF */}
          {canExportPDF ? (
            <Button 
              type="primary" 
              icon={<PrinterOutlined />} 
              onClick={handleExportPDF} 
              loading={printing}
              style={{ background: '#10b981', borderColor: '#10b981', marginLeft: 16 }} 
            >
              Xuất hóa đơn PDF
            </Button>
          ) : (
            <Button disabled icon={<PrinterOutlined />} title="Đơn hàng chưa hoàn thành" style={{ marginLeft: 16 }}>
              Xuất hóa đơn PDF
            </Button>
          )}
        </Space>
        
        {/* KHU VỰC ĐIỀU KHIỂN TRẠNG THÁI THÔNG MINH */}
        <Space style={{ background: '#fff', padding: '12px 24px', borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
          <span style={{ fontWeight: 500, color: '#64748b', marginRight: 8 }}>Hành động:</span>
          
          {availableTransitions.length > 0 ? (
            availableTransitions.map(nextStatus => {
              let btnType = 'primary';
              let btnDanger = false;
              let bgColor = '#1890ff';
              let icon = null;

              if (nextStatus === 'CONFIRMED') { bgColor = '#faad14'; icon = <CheckCircleOutlined />; }
              else if (nextStatus === 'PROCESSING') { bgColor = '#1890ff'; icon = <InboxOutlined />; }
              else if (nextStatus === 'SHIPPING') { bgColor = '#13c2c2'; icon = <CarOutlined />; }
              else if (nextStatus === 'DELIVERED') { bgColor = '#52c41a'; icon = <CheckCircleOutlined />; }
              else if (nextStatus === 'CANCELLED' || nextStatus === 'RETURNED') { btnDanger = true; }

              return (
                <Button 
                  key={nextStatus}
                  type={btnType}
                  danger={btnDanger}
                  icon={icon}
                  style={!btnDanger ? { background: bgColor, borderColor: bgColor } : {}}
                  loading={actionLoading === nextStatus}
                  disabled={actionLoading !== null && actionLoading !== nextStatus}
                  onClick={() => handleTransitionStatus(nextStatus)}
                >
                  {nextStatus === 'CONFIRMED' ? 'Xác nhận đơn' :
                   nextStatus === 'PROCESSING' ? 'Đóng gói (Processing)' : 
                   nextStatus === 'SHIPPING' ? 'Bàn giao vận chuyển' :
                   nextStatus === 'DELIVERED' ? 'Đánh dấu Đã giao' : 
                   nextStatus === 'RETURNED' ? 'Hoàn hàng' : 'Hủy đơn'}
                </Button>
              );
            })
          ) : (
            <Tag color="default" style={{ fontSize: 14, padding: '4px 12px' }}>
               Đơn hàng đã ở trạng thái kết thúc (Không thể thay đổi)
            </Tag>
          )}
        </Space>
      </div>

      <Row gutter={[24, 24]}>
        <Col xs={24} xl={16}>
          <Card title="Thông tin khách hàng & Giao hàng" bordered={false} style={{ borderRadius: 12, marginBottom: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
            <Descriptions column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }} size="small" labelStyle={{ color: '#64748b' }}>
              <Descriptions.Item label="Khách hàng"><Text strong>{order.userInfo?.fullName || 'Khách vãng lai'}</Text></Descriptions.Item>
              <Descriptions.Item label="Số điện thoại"><Text strong>{order.userInfo?.phone || 'N/A'}</Text></Descriptions.Item>
              <Descriptions.Item label="Email"><Text>{order.userInfo?.email || 'N/A'}</Text></Descriptions.Item>
              <Descriptions.Item label="Ngày đặt"><Text>{formatDateTime(order.orderDate)}</Text></Descriptions.Item>
              <Descriptions.Item label="Trạng thái hiện tại"><Tag color={STATUS_COLORS[order.status] || 'blue'}>{EXTENDED_STATUS_MAP[order.status] || order.status}</Tag></Descriptions.Item>
              <Descriptions.Item label="Thanh toán"><Tag color="geekblue">{order.paymentMethod || 'COD'}</Tag></Descriptions.Item>
              <Descriptions.Item label="Kênh bán"><Tag color={order.orderType === 'OFFLINE' ? 'magenta' : 'blue'}>{order.orderType === 'OFFLINE' ? 'Tại quầy (POS)' : 'Trực tuyến'}</Tag></Descriptions.Item>
              <Descriptions.Item label="Địa chỉ" span={2}><Text>{order.shippingAddress || 'N/A'}</Text></Descriptions.Item>
            </Descriptions>
          </Card>

          <Card title={`Danh sách sản phẩm (${order.items?.length || 0})`} bordered={false} style={{ borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
            <Table columns={itemColumns} dataSource={order.items || []} rowKey="orderItemId" pagination={false} bordered />
            <Divider />
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <div style={{ width: 300 }}>
                
                {/* 1. Tiền hàng (Subtotal) */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text type="secondary">Tạm tính (Tiền hàng):</Text>
                  <Text>{formatCurrency(order.subtotalAmount || order.totalAmount)}</Text>
                </div>
                
                {/* 2. Tiền giảm (Discount) */}
                {order.couponCode && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <Text type="secondary">Mã giảm giá ({order.couponCode}):</Text>
                    <Text type="success">- {formatCurrency(order.discountAmount || 0)}</Text>
                  </div>
                )}

                {/* 3. Phí vận chuyển (Shipping) */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text type="secondary">Phí vận chuyển:</Text>
                  <Text>{formatCurrency(order.shippingFee || 0)}</Text>
                </div>

                {/* 4. Tổng tiền (Total) */}
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #eee', paddingTop: 12, marginTop: 4 }}>
                  <Title level={5} style={{ margin: 0 }}>Tổng thanh toán:</Title>
                  <Title level={4} style={{ margin: 0, color: '#e53935' }}>{formatCurrency(order.totalAmount)}</Title>
                </div>
                
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} xl={8}>
          <Card title="Lịch sử trạng thái" bordered={false} style={{ borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.05)', height: '100%' }}>
            <Timeline
              mode="left"
              items={timelineData.map((history, index) => {
                const isLatest = index === timelineData.length - 1;
                return {
                  color: STATUS_COLORS[history.newStatus] || 'blue',
                  dot: isLatest ? <ClockCircleOutlined style={{ fontSize: '16px' }} /> : null,
                  children: (
                    <div style={{ paddingBottom: 16 }}>
                      <Text strong style={{ display: 'block', fontSize: 15, color: isLatest ? '#1a1a1a' : '#64748b' }}>
                        {EXTENDED_STATUS_MAP[history.newStatus] || history.newStatus}
                      </Text>
                      <Text type="secondary" style={{ fontSize: 13 }}>{formatDateTime(history.changeDate)}</Text>
                      <div style={{ marginTop: 4 }}>
                        <Tag style={{ margin: 0, fontSize: 12, border: 'none', background: '#f1f5f9', color: '#64748b' }}>
                           Người cập nhật: Admin hệ thống
                        </Tag>
                      </div>
                    </div>
                  ) 
                };
              })}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default OrderDetailPage;