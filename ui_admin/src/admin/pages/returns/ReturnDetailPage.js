import { ArrowLeftOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { Alert, Button, Card, Col, Descriptions, Image, Input, message, Modal, Row, Space, Spin } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import StatusBadge from '../../components/StatusBadge';
import { adminReturnService } from '../../services/returnService';
import { formatDateTime } from '../../../shared/utils/formatters';

const ReturnDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [rejectModal, setRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [acting, setActing] = useState(false);

  const load = async () => { try { setData(await adminReturnService.getById(id)); } finally { setLoading(false); } };
  useEffect(() => { load(); }, [id]);

  const act = async (fn, successMsg) => {
    setActing(true);
    try { await fn(); message.success(successMsg); load(); }
    catch { message.error('Thao tác thất bại'); }
    finally { setActing(false); }
  };

  if (loading) return <div style={{ display:'flex', justifyContent:'center', paddingTop:80 }}><Spin size="large" /></div>;
  if (!data)   return <div>Không tìm thấy yêu cầu</div>;

  return (
    <div>
      <PageHeader title={`Chi tiết YC trả hàng #${data.return_request_id}`}
        breadcrumbs={[{ label:'Trả hàng', path:'/admin/returns' }, { label:`#${data.return_request_id}` }]}
        extra={<Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/admin/returns')}>Quay lại</Button>}
      />
      <Row gutter={[16,16]}>
        <Col xs={24} lg={16}>
          <Card title="Thông tin yêu cầu" style={{ borderRadius:12, border:'none', boxShadow:'0 1px 8px rgba(0,0,0,0.08)', marginBottom:16 }}>
            <Descriptions column={{ xs:1, sm:2 }} size="small">
              <Descriptions.Item label="Khách hàng">{data.customer_name}</Descriptions.Item>
              <Descriptions.Item label="Mã đơn hàng">#{data.order_id}</Descriptions.Item>
              <Descriptions.Item label="Ngày yêu cầu">{formatDateTime(data.request_date)}</Descriptions.Item>
              <Descriptions.Item label="Trạng thái"><StatusBadge type="return" status={data.status} /></Descriptions.Item>
              <Descriptions.Item label="Lý do" span={2}>{data.reason}</Descriptions.Item>
              {data.description && <Descriptions.Item label="Mô tả chi tiết" span={2}>{data.description}</Descriptions.Item>}
              {data.rejection_reason && <Descriptions.Item label="Lý do từ chối" span={2}><span style={{ color:'#ef4444' }}>{data.rejection_reason}</span></Descriptions.Item>}
            </Descriptions>
          </Card>
          {data.images?.length > 0 && (
            <Card title="Ảnh minh chứng" style={{ borderRadius:12, border:'none', boxShadow:'0 1px 8px rgba(0,0,0,0.08)' }}>
              <Image.PreviewGroup>
                <Space wrap>
                  {data.images.map(img => <Image key={img.id} src={img.url} width={120} height={120} style={{ objectFit:'cover', borderRadius:8 }} />)}
                </Space>
              </Image.PreviewGroup>
            </Card>
          )}
        </Col>
        <Col xs={24} lg={8}>
          {data.status === 'PENDING' && (
            <Card title="Xét duyệt" style={{ borderRadius:12, border:'none', boxShadow:'0 1px 8px rgba(0,0,0,0.08)' }}>
              <Space direction="vertical" style={{ width:'100%' }}>
                <Alert message="Yêu cầu đang chờ xét duyệt" type="warning" showIcon />
                <Button type="primary" icon={<CheckOutlined />} block loading={acting}
                  style={{ background:'#22c55e', border:'none' }}
                  onClick={() => act(() => adminReturnService.approve(id), 'Đã duyệt yêu cầu')}>
                  Duyệt yêu cầu
                </Button>
                <Button danger icon={<CloseOutlined />} block onClick={() => setRejectModal(true)}>
                  Từ chối
                </Button>
              </Space>
            </Card>
          )}
          {data.status === 'APPROVED' && (
            <Card title="Hoàn tất xử lý" style={{ borderRadius:12, border:'none', boxShadow:'0 1px 8px rgba(0,0,0,0.08)' }}>
              <Space direction="vertical" style={{ width:'100%' }}>
                <Alert message="Đã duyệt — Xác nhận đã nhận lại hàng?" type="info" showIcon />
                <Button type="primary" block loading={acting}
                  onClick={() => act(() => adminReturnService.complete(id), 'Đã hoàn tất xử lý')}>
                  Xác nhận đã nhận hàng
                </Button>
              </Space>
            </Card>
          )}
        </Col>
      </Row>

      <Modal open={rejectModal} title="Từ chối yêu cầu" onOk={async () => { if (!rejectReason.trim()) { message.warning('Vui lòng nhập lý do'); return; } await act(() => adminReturnService.reject(id, rejectReason), 'Đã từ chối yêu cầu'); setRejectModal(false); setRejectReason(''); }} onCancel={() => { setRejectModal(false); setRejectReason(''); }} okText="Xác nhận từ chối" okType="danger">
        <Input.TextArea rows={4} placeholder="Nhập lý do từ chối..." value={rejectReason} onChange={e => setRejectReason(e.target.value)} style={{ marginTop:16 }} />
      </Modal>
    </div>
  );
};
export default ReturnDetailPage;
