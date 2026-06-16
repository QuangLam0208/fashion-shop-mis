import React, { useState, useEffect } from 'react';
import { Drawer, Modal, Descriptions, Table, Tag, Button, Spin, Space, Typography, message, Divider, Avatar } from 'antd';
import { EyeOutlined, UserOutlined } from '@ant-design/icons';
import { userService } from '../../services/userService';
import { formatCurrency, formatDateTime } from '../../../shared/utils/formatters';

const { Text, Title } = Typography;

const CustomerDetailDrawer = ({ customerId, open, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [customer, setCustomer] = useState(null);

  // States cho Deep Order Modal
  const [deepModalOpen, setDeepModalOpen] = useState(false);
  const [deepOrderLoading, setDeepOrderLoading] = useState(false);
  const [deepOrder, setDeepOrder] = useState(null);

  useEffect(() => {
    if (open && customerId) {
      fetchCustomerDetail(customerId);
    } else {
      setCustomer(null);
    }
  }, [open, customerId]);

  const fetchCustomerDetail = async (id) => {
    setLoading(true);
    try {
      const data = await userService.getCustomerDetail(id);
      setCustomer(data?.data || data);
    } catch (error) {
      message.error('Không thể tải chi tiết hồ sơ khách hàng');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDeepOrder = async (orderId) => {
    setDeepModalOpen(true);
    setDeepOrderLoading(true);
    try {
      const data = await userService.getCustomerOrderDeep(customerId, orderId);
      setDeepOrder(data?.data || data);
    } catch (error) {
      message.error('Không thể tải chi tiết đơn hàng sâu');
      setDeepModalOpen(false);
    } finally {
      setDeepOrderLoading(false);
    }
  };

  // CỘT BẢNG TÓM TẮT ĐƠN HÀNG (Mapping đúng theo JSON mới)
  const orderSummaryColumns = [
    { title: 'Mã đơn', dataIndex: 'orderId', width: 90, render: val => <strong>#{val}</strong> },
    { title: 'Ngày đặt', dataIndex: 'orderDate', width: 110, render: val => <span style={{ fontSize: 13 }}>{formatDateTime(val)}</span> },
    { 
      title: 'Sản phẩm mua', 
      key: 'items', 
      render: (_, record) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {record.items && record.items.map((item, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <img 
                src={item.productImage || 'https://placehold.co/30?text=No+Img'} 
                alt="img" 
                style={{ width: 32, height: 32, objectFit: 'cover', borderRadius: 4, border: '1px solid #f0f0f0' }} 
              />
              <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
                <Text style={{ fontSize: 13, maxWidth: 200 }} ellipsis title={item.productName}>
                  {item.productName} (x{item.quantity})
                </Text>
                <Tag color={item.orderItemStatus === 'CANCELLED' ? 'red' : item.orderItemStatus === 'RETURNED' ? 'orange' : 'blue'} style={{ width: 'max-content', marginTop: 2, fontSize: 11, lineHeight: '16px' }}>
                  {item.orderItemStatus}
                </Tag>
              </div>
            </div>
          ))}
        </div>
      ) 
    },
    { title: 'Thanh toán', dataIndex: 'paymentMethod', render: val => <Tag color="geekblue">{val}</Tag> },
    { title: 'Tổng tiền', dataIndex: 'totalAmount', align: 'right', render: val => <strong style={{ color: '#e53935' }}>{formatCurrency(val)}</strong> },
    { 
      title: 'Hành động', 
      key: 'action', 
      align: 'center',
      render: (_, record) => (
        <Button type="primary" size="small" icon={<EyeOutlined />} onClick={() => handleOpenDeepOrder(record.orderId)}>
          Xem sâu
        </Button>
      ) 
    }
  ];

  // CỘT BẢNG CHI TIẾT SÂU (Trong Modal)
  const deepOrderColumns = [
    { 
      title: 'Sản phẩm', 
      key: 'product', 
      render: (_, record) => (
        <Space>
          <img src={record.productImage || 'https://placehold.co/40'} alt="img" style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 4 }} />
          <div>
            <div style={{ fontWeight: 500 }}>{record.productName}</div>
            <div style={{ fontSize: 12, color: '#888' }}>Màu: {record.color} | Size: {record.size}</div>
          </div>
        </Space>
      )
    },
    { title: 'Đơn giá', dataIndex: 'price', align: 'right', render: val => formatCurrency(val) },
    { title: 'SL', dataIndex: 'quantity', align: 'center' },
    { title: 'Thành tiền', key: 'total', align: 'right', render: (_, r) => <strong>{formatCurrency(r.price * r.quantity)}</strong> },
    { title: 'Trạng thái món', dataIndex: 'status', align: 'center', render: val => <Tag>{val}</Tag> }
  ];

  return (
    <>
      <Drawer
        title="Chi tiết Hồ sơ Khách hàng"
        placement="right"
        width={760}
        onClose={onClose}
        open={open}
      >
        {loading || !customer ? (
          <div style={{ textAlign: 'center', padding: 50 }}><Spin size="large" /></div>
        ) : (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
              <Avatar size={64} icon={<UserOutlined />} src={customer.avatarUrl} style={{ marginRight: 16 }} />
              <div>
                <Title level={4} style={{ margin: 0 }}>{customer.fullName}</Title>
                <Text type="secondary">{customer.email} • {customer.phone || 'Chưa cập nhật SĐT'}</Text>
              </div>
            </div>

            <Descriptions title="Thông tin cá nhân" bordered column={1} size="small" style={{ marginBottom: 24 }}>
              <Descriptions.Item label="Trạng thái">
                <Tag color={customer.status === 'ACTIVE' ? 'green' : 'red'}>{customer.status}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Địa chỉ giao hàng">{customer.address || 'Khách hàng chưa thiết lập địa chỉ'}</Descriptions.Item>
            </Descriptions>

            <Title level={5}>Lịch sử Mua hàng ({customer.orderHistory?.length || 0} đơn)</Title>
            <Table 
              columns={orderSummaryColumns} 
              dataSource={customer.orderHistory || []} 
              rowKey="orderId" 
              pagination={{ pageSize: 5 }} 
              size="small"
              bordered
            />
          </div>
        )}
      </Drawer>

      {/* Modal Deep View Order */}
      <Modal
        title={`Chi tiết chuyên sâu đơn hàng #${deepOrder?.orderId || ''}`}
        open={deepModalOpen}
        onCancel={() => setDeepModalOpen(false)}
        footer={null}
        width={800}
      >
        {deepOrderLoading || !deepOrder ? (
          <div style={{ textAlign: 'center', padding: 50 }}><Spin /></div>
        ) : (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <Text strong>Ngày đặt: <Text type="secondary" style={{ fontWeight: 'normal' }}>{formatDateTime(deepOrder.orderDate)}</Text></Text>
              <Text strong>Kênh: <Tag>{deepOrder.orderType}</Tag></Text>
              <Text strong>Thanh toán: <Tag color="geekblue">{deepOrder.paymentMethod}</Tag></Text>
            </div>
            
            <Table columns={deepOrderColumns} dataSource={deepOrder.items || []} rowKey="orderItemId" pagination={false} size="small" bordered />
            
            <Divider style={{ margin: '16px 0' }} />
            <div style={{ textAlign: 'right' }}>
              <div><Text type="secondary">Tạm tính:</Text> <Text strong>{formatCurrency((deepOrder.totalAmount || 0) + (deepOrder.discountAmount || 0))}</Text></div>
              <div><Text type="secondary">Giảm giá voucher:</Text> <Text type="danger">- {formatCurrency(deepOrder.discountAmount || 0)}</Text></div>
              <div style={{ marginTop: 8 }}><Text strong style={{ fontSize: 16 }}>TỔNG THANH TOÁN:</Text> <Title level={4} style={{ color: '#e53935', margin: 0, display: 'inline-block', marginLeft: 8 }}>{formatCurrency(deepOrder.totalAmount)}</Title></div>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};

export default CustomerDetailDrawer;