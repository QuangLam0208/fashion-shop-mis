import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Descriptions, Table, Steps, Tag, Button, Select, Space, message, Spin } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import PageHeader  from '../../components/PageHeader';
import StatusBadge from '../../components/StatusBadge';
import { adminOrderService }   from '../../services/orderService';
import { formatCurrency, formatDateTime } from '../../../shared/utils/formatters';
import { ORDER_STATUS, PAYMENT_METHOD, ORDER_TYPE } from '../../../shared/constants';

const STATUS_FLOW = ['PENDING_CONFIRMATION','PROCESSING','SHIPPING','DELIVERED','COMPLETED'];

const OrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order,   setOrder]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [nextStatus, setNextStatus] = useState('');
  const [updating, setUpdating]     = useState(false);

  useEffect(() => {
    (async () => {
      try { const o = await adminOrderService.getById(id); setOrder(o); }
      finally { setLoading(false); }
    })();
  }, [id]);

  const handleUpdateStatus = async () => {
    if (!nextStatus) return;
    setUpdating(true);
    try { const updated = await adminOrderService.updateStatus(id, nextStatus); setOrder(o => ({ ...o, status: updated.status })); message.success('Cập nhật trạng thái thành công'); setNextStatus(''); }
    catch { message.error('Cập nhật thất bại'); }
    finally { setUpdating(false); }
  };

  if (loading) return <div style={{ display:'flex', justifyContent:'center', paddingTop:80 }}><Spin size="large" /></div>;
  if (!order)  return <div>Không tìm thấy đơn hàng</div>;

  const currentIdx = STATUS_FLOW.indexOf(order.status);
  const nextOpts   = STATUS_FLOW.slice(currentIdx + 1).map(s => ({ label: ORDER_STATUS[s]?.label, value: s }));

  const itemCols = [
    { title: 'Sản phẩm', dataIndex: 'product_name', render: (n, r) => `${n} (${r.color} / ${r.size})` },
    { title: 'SL', dataIndex: 'quantity', align:'center', width:60 },
    { title: 'Đơn giá', dataIndex: 'price', render: v => formatCurrency(v), align:'right' },
    { title: 'Thành tiền', render: (_, r) => formatCurrency(r.price * r.quantity), align:'right' },
    { title: 'Trạng thái', dataIndex: 'status', render: s => <StatusBadge type="order" status={s} /> },
  ];

  return (
    <div>
      <PageHeader
        title={`Chi tiết đơn #${order.order_id}`}
        breadcrumbs={[{ label:'Đơn hàng', path:'/admin/orders' }, { label:`#${order.order_id}` }]}
        extra={<Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/admin/orders')}>Quay lại</Button>}
      />
      <Row gutter={[16,16]}>
        <Col xs={24} lg={16}>
          {/* Order info */}
          <Card title="Thông tin đơn hàng" style={{ borderRadius:12, border:'none', boxShadow:'0 1px 8px rgba(0,0,0,0.08)', marginBottom:16 }}>
            <Descriptions column={{ xs:1, sm:2 }} size="small">
              <Descriptions.Item label="Khách hàng">{order.customer_name}</Descriptions.Item>
              <Descriptions.Item label="Ngày đặt">{formatDateTime(order.order_date)}</Descriptions.Item>
              <Descriptions.Item label="Phương thức TT">{PAYMENT_METHOD[order.payment_method]}</Descriptions.Item>
              <Descriptions.Item label="Loại đơn"><Tag color={order.type==='OFFLINE'?'purple':'blue'}>{ORDER_TYPE[order.type]}</Tag></Descriptions.Item>
              <Descriptions.Item label="Trạng thái"><StatusBadge type="order" status={order.status} /></Descriptions.Item>
              <Descriptions.Item label="Tổng tiền"><span style={{ fontWeight:700, color:'#6366f1' }}>{formatCurrency(order.total_amount)}</span></Descriptions.Item>
              {order.shipping_address && <Descriptions.Item label="Địa chỉ giao" span={2}>{order.shipping_address}</Descriptions.Item>}
            </Descriptions>
          </Card>

          {/* Items */}
          <Card title="Sản phẩm trong đơn" style={{ borderRadius:12, border:'none', boxShadow:'0 1px 8px rgba(0,0,0,0.08)' }}>
            <Table dataSource={order.items} columns={itemCols} rowKey="order_item_id" pagination={false} size="small"
              summary={() => (
                <Table.Summary.Row>
                  <Table.Summary.Cell colSpan={3} />
                  <Table.Summary.Cell align="right"><strong>{formatCurrency(order.total_amount)}</strong></Table.Summary.Cell>
                  <Table.Summary.Cell />
                </Table.Summary.Row>
              )}
            />
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          {/* Update status */}
          {!['CANCELLED','COMPLETED'].includes(order.status) && nextOpts.length > 0 && (
            <Card title="Cập nhật trạng thái" style={{ borderRadius:12, border:'none', boxShadow:'0 1px 8px rgba(0,0,0,0.08)', marginBottom:16 }}>
              <Space direction="vertical" style={{ width:'100%' }}>
                <Select placeholder="Chọn trạng thái mới" options={nextOpts} value={nextStatus} onChange={setNextStatus} style={{ width:'100%' }} />
                <Button type="primary" block onClick={handleUpdateStatus} loading={updating} disabled={!nextStatus}
                  style={{ background:'linear-gradient(135deg,#6366f1,#8b5cf6)', border:'none' }}>
                  Xác nhận cập nhật
                </Button>
              </Space>
            </Card>
          )}

          {/* Timeline */}
          <Card title="Lịch sử trạng thái" style={{ borderRadius:12, border:'none', boxShadow:'0 1px 8px rgba(0,0,0,0.08)' }}>
            {order.histories?.length > 0 ? (
              <Steps direction="vertical" size="small" current={order.histories.length - 1}
                items={order.histories.map(h => ({
                  title: ORDER_STATUS[h.new_status]?.label || h.new_status,
                  description: formatDateTime(h.change_date),
                  status: 'finish',
                }))}
              />
            ) : <span style={{ color:'#94a3b8' }}>Chưa có lịch sử</span>}
          </Card>
        </Col>
      </Row>
    </div>
  );
};
export default OrderDetailPage;
