import { ArrowLeftOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { Alert, Button, Card, Col, Descriptions, Input, message, Modal, Row, Space, Spin, Table, Tag, Typography, Select } from 'antd';
import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import { adminReturnService } from '../../services/returnService';
import { formatCurrency, formatDateTime } from '../../../shared/utils/formatters';

const { Text } = Typography;
const { Option } = Select;

const ReturnDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  const [updatingRefundItem, setUpdatingRefundItem] = useState(null); // State khóa dropdown khi đang gọi API

  // States: Modal Reject
  const [rejectModal, setRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectError, setRejectError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try { 
      setData(await adminReturnService.getById(id)); 
    } catch (error) {
      message.error("Lỗi tải chi tiết yêu cầu hoàn trả!");
      navigate('/admin/returns');
    } finally { 
      setLoading(false); 
    }
  }, [id, navigate]);

  useEffect(() => { load(); }, [load]);

  // Xử lý Approve / Reject phiếu trả hàng
  const processRequest = async (newStatus, reason = null) => {
    setActing(true);
    try {
      const payload = { newStatus };
      if (reason) payload.rejectionReason = reason;

      const res = await adminReturnService.processRequest(id, payload);
      message.success(res.message || `Đã ${newStatus === 'APPROVED' ? 'Duyệt' : 'Từ chối'} yêu cầu thành công!`);
      if (newStatus === 'REJECTED') {
        setRejectModal(false);
        setRejectReason('');
      }
      load(); 
    } catch (error) {
      message.error(error?.response?.data?.message || 'Thao tác thất bại!');
    } finally {
      setActing(false);
    }
  };

  const handleApprove = () => {
    Modal.confirm({
      title: 'Xác nhận Duyệt yêu cầu',
      content: 'Bạn có chắc chắn muốn CHẤP NHẬN yêu cầu trả hàng này?',
      okText: 'Duyệt',
      cancelText: 'Hủy',
      onOk: () => processRequest('APPROVED')
    });
  };

  const handleRejectSubmit = () => {
    if (!rejectReason.trim()) {
      setRejectError('Vui lòng nhập lý do từ chối yêu cầu hoàn trả');
      return;
    }
    setRejectError('');
    processRequest('REJECTED', rejectReason.trim());
  };

  // AC-US36: Cập nhật trạng thái hoàn tiền cho từng món hàng (Item)
  const handleUpdateRefundStatus = async (itemId, newStatus) => {
    setUpdatingRefundItem(itemId);
    try {
      await adminReturnService.updateRefundStatus(itemId, newStatus);
      message.success(`Cập nhật trạng thái hoàn tiền thành [${newStatus}] thành công!`);
      load(); // Tải lại dữ liệu để đồng bộ trạng thái phiếu (Backend tự nhảy sang COMPLETED nếu mọi Item xong)
    } catch (error) {
      message.error(error?.response?.data?.message || 'Lỗi cập nhật trạng thái hoàn tiền!');
    } finally {
      setUpdatingRefundItem(null);
    }
  };

  if (loading) return <div style={{ display:'flex', justifyContent:'center', paddingTop:80 }}><Spin size="large" /></div>;
  if (!data) return <div>Không tìm thấy yêu cầu hoàn trả</div>;

  // Cấu hình cột sản phẩm
  const itemColumns = [
    {
      title: 'Sản phẩm',
      key: 'product',
      render: (_, r) => (
        <Space>
          <img src={r.productImage || 'https://placehold.co/50x50'} alt={r.productName} style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 4 }} />
          <div>
            <div style={{ fontWeight: 600 }}>{r.productName}</div>
            <div style={{ fontSize: 12, color: '#888' }}>{r.color} - {r.size}</div>
          </div>
        </Space>
      )
    },
    { title: 'Số lượng', dataIndex: 'quantity', align: 'center' },
    { title: 'Đơn giá', dataIndex: 'price', align: 'right', render: v => formatCurrency(v) },
    { 
      title: 'Trạng thái Hoàn tiền', 
      key: 'refundStatus',
      align: 'center',
      render: (_, r) => {
        const s = r.refundStatus;
        const isUpdating = updatingRefundItem === r.orderItemId;

        // AC-FE-US36-01 & 03: Hiển thị Dropdown Cập nhật nếu Phiếu đã APPROVED và Món hàng này đang PENDING
        if (data.status === 'APPROVED' && s === 'PENDING') {
          return (
            <Select
              size="small"
              value={s}
              style={{ width: 130, fontWeight: 600, color: '#faad14' }}
              loading={isUpdating}
              disabled={isUpdating} // Khóa nút khi đang cập nhật (AC-FE-US36-05)
              onChange={(val) => handleUpdateRefundStatus(r.orderItemId, val)}
            >
              <Option value="PENDING" disabled>PENDING</Option>
              <Option value="COMPLETED"><span style={{ color: '#52c41a' }}>COMPLETED</span></Option>
              <Option value="FAILED"><span style={{ color: '#ff4d4f' }}>FAILED</span></Option>
              <Option value="REJECTED"><span style={{ color: '#ff4d4f' }}>REJECTED</span></Option>
            </Select>
          );
        }

        // Với các trạng thái đã hoàn tất (hoặc Phiếu chưa duyệt) thì hiển thị dạng Tag nhãn cứng
        let color = 'default';
        if (s === 'PENDING') color = 'gold';
        if (s === 'COMPLETED') color = 'green';
        if (s === 'FAILED' || s === 'REJECTED') color = 'red';
        return <Tag color={color} style={{ fontWeight: 600 }}>{s}</Tag>;
      } 
    }
  ];

  return (
    <div>
      <PageHeader 
        title={`Chi tiết YC trả hàng #${data.requestId}`}
        breadcrumbs={[{ label:'Trả hàng', path:'/admin/returns' }, { label:`#${data.requestId}` }]}
        extra={<Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/admin/returns')}>Quay lại</Button>}
      />
      <Row gutter={[16,16]}>
        <Col xs={24} lg={16}>
          {/* Thông tin phiếu và Khách hàng */}
          <Card title="Thông tin chung & Theo dõi Hoàn tiền" style={{ borderRadius:12, border:'none', boxShadow:'0 1px 8px rgba(0,0,0,0.08)', marginBottom:16 }}>
            <Descriptions column={{ xs:1, sm:2 }} size="small" labelStyle={{ color: '#64748b' }}>
              <Descriptions.Item label="Khách hàng"><strong style={{ color: '#1677ff' }}>{data.customerName}</strong></Descriptions.Item>
              <Descriptions.Item label="SĐT">{data.customerPhone}</Descriptions.Item>
              <Descriptions.Item label="Email">{data.customerEmail}</Descriptions.Item>
              
              {/* AC-FE-US36-04: Hiển thị phương thức TT gốc & Cho phép Copy dễ dàng */}
              <Descriptions.Item label="Nguồn thanh toán gốc">
                <Text copyable style={{ fontWeight: 600, color: '#722ed1' }}>{data.paymentMethod}</Text>
              </Descriptions.Item>
              
              <Descriptions.Item label="Đơn hàng gốc">#{data.orderId}</Descriptions.Item>
              <Descriptions.Item label="Ngày tạo YC">{formatDateTime(data.requestDate)}</Descriptions.Item>
              
              <Descriptions.Item label="Trạng thái Phiếu">
                <Tag color={data.status === 'PENDING' ? 'orange' : data.status === 'COMPLETED' ? 'blue' : data.status === 'APPROVED' ? 'green' : 'red'}>
                  {data.status}
                </Tag>
              </Descriptions.Item>
              
              <Descriptions.Item label="Lý do trả hàng" span={2}>
                <span style={{ fontWeight: 500, color: '#d4380d' }}>{data.reason}</span>
              </Descriptions.Item>
              {data.description && <Descriptions.Item label="Mô tả lỗi chi tiết" span={2}>{data.description}</Descriptions.Item>}
              {data.rejectionReason && <Descriptions.Item label="Lý do từ chối (Admin)" span={2}><span style={{ color:'#ef4444', fontWeight: 600 }}>{data.rejectionReason}</span></Descriptions.Item>}
            </Descriptions>
          </Card>

          {/* Danh sách mặt hàng & Chọn Trạng thái Refund */}
          <Card title="Sản phẩm hoàn trả & Xử lý Hoàn tiền" style={{ borderRadius:12, border:'none', boxShadow:'0 1px 8px rgba(0,0,0,0.08)', marginBottom: 16 }}>
            <Table dataSource={data.items} columns={itemColumns} rowKey="orderItemId" pagination={false} size="small" bordered />
          </Card>

          {/* Ảnh chứng cứ */}
          {data.imageUrls?.length > 0 && (
            <Card title="Ảnh minh chứng (Khách tải lên)" style={{ borderRadius:12, border:'none', boxShadow:'0 1px 8px rgba(0,0,0,0.08)' }}>
              <Space wrap>
                {data.imageUrls.map((url, idx) => (
                  <a key={idx} href={url} target="_blank" rel="noopener noreferrer" style={{ display: 'block', overflow: 'hidden', borderRadius: 8, border: '1px solid #d9d9d9' }}>
                    <img 
                      src={url} 
                      alt={`evidence-${idx}`} 
                      style={{ width: 120, height: 120, objectFit: 'cover', transition: 'transform 0.2s' }} 
                      onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
                      onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                    />
                  </a>
                ))}
              </Space>
            </Card>
          )}
        </Col>

        {/* Khung Tác vụ Phiếu */}
        <Col xs={24} lg={8}>
          <Card title="Bảng điều khiển tác vụ" style={{ borderRadius:12, border:'none', boxShadow:'0 1px 8px rgba(0,0,0,0.08)' }}>
            {data.status === 'PENDING' ? (
              <Space direction="vertical" style={{ width:'100%' }}>
                <Alert message="Yêu cầu đang chờ xét duyệt" type="warning" showIcon style={{ marginBottom: 12 }} />
                <Button type="primary" icon={<CheckOutlined />} block size="large" loading={acting}
                  style={{ background:'#22c55e', borderColor:'#22c55e', fontWeight: 600 }}
                  onClick={handleApprove}>Phê Duyệt Yêu Cầu</Button>
                <Button danger type="primary" icon={<CloseOutlined />} block size="large" 
                  style={{ fontWeight: 600 }}
                  onClick={() => setRejectModal(true)}>Từ Chối Yêu Cầu</Button>
              </Space>
            ) : data.status === 'APPROVED' ? (
              <Alert 
                message="Phiếu đã được duyệt" 
                description="Bạn có thể cập nhật trạng thái hoàn tiền cho từng sản phẩm ở bảng bên trái. Phiếu sẽ tự động hoàn tất (COMPLETED) khi tất cả sản phẩm đều được cập nhật hoàn tiền xong." 
                type="info" 
                showIcon 
              />
            ) : (
              <Alert 
                message="Phiếu đã Đóng" 
                description={`Yêu cầu này đã hoàn tất quá trình xử lý và được chuyển sang trạng thái ${data.status}.`} 
                type={data.status === 'COMPLETED' ? 'success' : 'error'} 
                showIcon 
              />
            )}
          </Card>
        </Col>
      </Row>

      {/* Modal Từ chối */}
      <Modal 
        open={rejectModal} 
        title="Từ chối yêu cầu hoàn trả" 
        onOk={handleRejectSubmit} 
        onCancel={() => { setRejectModal(false); setRejectReason(''); setRejectError(''); }} 
        okText="Xác nhận Từ chối" 
        cancelText="Đóng" 
        okButtonProps={{ danger: true, disabled: !rejectReason.trim(), loading: acting }}
      >
        <p>Vui lòng ghi rõ lý do từ chối để thông báo tới khách hàng:</p>
        <Input.TextArea rows={4} value={rejectReason} onChange={e => { setRejectReason(e.target.value); setRejectError(''); }} status={rejectError ? 'error' : ''} />
        {rejectError && <div style={{ color: '#ff4d4f', fontSize: 13, marginTop: 6 }}>{rejectError}</div>}
      </Modal>
    </div>
  );
};

export default ReturnDetailPage;