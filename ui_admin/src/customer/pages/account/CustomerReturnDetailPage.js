import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, Typography, message, Breadcrumb, Steps, Alert, Space, Button, Spin, Row, Col } from 'antd';
import { HomeOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { customerReturnService } from '../../services/customerReturnService';
import { formatCurrency, formatDateTime } from '../../../shared/utils/formatters';

const { Title, Text } = Typography;

const CustomerReturnDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await customerReturnService.getReturnRequestById(id);
        setData(res?.data || res);
      } catch (error) {
        message.error('Không thể tải chi tiết yêu cầu trả hàng');
        navigate('/account/returns');
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id, navigate]);

  if (loading) return <div style={{ textAlign: 'center', padding: 80 }}><Spin size="large" /></div>;
  if (!data) return null;

  // Xây dựng các bước Timeline (AC-FE-US34-01)
  let currentStep = 0;
  let statusStep = 'process';
  if (data.status === 'APPROVED' || data.status === 'COMPLETED') { currentStep = 1; statusStep = 'finish'; }
  else if (data.status === 'REJECTED') { currentStep = 1; statusStep = 'error'; }

  const itemsColumns = [
    {
      title: 'Sản phẩm',
      key: 'product',
      render: (_, record) => (
        <Space>
          <img src={record.productImage || 'https://placehold.co/50'} alt="img" style={{ width: 50, height: 50, borderRadius: 6, objectFit: 'cover' }} />
          <div>
            <div style={{ fontWeight: 500 }}>{record.productName}</div>
            <div style={{ fontSize: 12, color: '#888' }}>{record.color} {record.size ? `/ ${record.size}` : ''}</div>
          </div>
        </Space>
      )
    },
    { title: 'Giá', dataIndex: 'price', align: 'right', render: p => formatCurrency(p) },
    { title: 'SL', dataIndex: 'quantity', align: 'center' },
    { 
      title: 'Trạng thái hoàn tiền', 
      dataIndex: 'refundStatus', 
      align: 'center',
      // AC-FE-US34-02: Itemized Refund Status Display
      render: (status) => {
        let color = 'default';
        if (status === 'PENDING') color = 'gold';
        if (status === 'COMPLETED') color = 'green';
        if (status === 'FAILED' || status === 'REJECTED') color = 'red';
        return <Tag color={color}>{status || 'NONE'}</Tag>;
      } 
    }
  ];

  return (
    <div style={{ backgroundColor: '#f9fafb', minHeight: '100vh', paddingBottom: 60 }}>
      <div style={{ backgroundColor: '#fff', borderBottom: '1px solid #eaeaea', padding: '16px 0', marginBottom: 24 }}>
        <div className="c-container">
          <Breadcrumb>
            <Breadcrumb.Item><Link to="/"><HomeOutlined /> Trang chủ</Link></Breadcrumb.Item>
            <Breadcrumb.Item><Link to="/account/returns">Yêu cầu trả hàng</Link></Breadcrumb.Item>
            <Breadcrumb.Item>Chi tiết Yêu cầu</Breadcrumb.Item>
          </Breadcrumb>
        </div>
      </div>

      <div className="c-container">
        <Space style={{ marginBottom: 16 }}>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/account/returns')} type="text">Quay lại</Button>
          <Title level={4} style={{ margin: 0 }}>Chi tiết Yêu cầu Trả hàng #{data.requestId}</Title>
        </Space>

        <Row gutter={[24, 24]}>
          <Col xs={24} lg={16}>
            <Card title="Sản phẩm yêu cầu" bordered={false} style={{ borderRadius: 12, marginBottom: 24 }}>
              <Table 
                columns={itemsColumns} 
                dataSource={data.items} 
                rowKey="orderItemId" 
                pagination={false} 
                bordered 
              />
            </Card>

            <Card title="Lý do & Chứng cứ" bordered={false} style={{ borderRadius: 12 }}>
              <div style={{ marginBottom: 16 }}>
                <Text strong>Lý do:</Text> <Text style={{ color: '#d4380d' }}>{data.reason}</Text>
              </div>
              {data.description && (
                <div style={{ marginBottom: 16, backgroundColor: '#f5f5f5', padding: 12, borderRadius: 6 }}>
                  {data.description}
                </div>
              )}
              {data.imageUrls?.length > 0 && (
                <div>
                  <Text strong>Hình ảnh đính kèm:</Text>
                  <Space wrap style={{ marginTop: 8 }}>
                    {data.imageUrls.map((url, idx) => (
                      <a key={idx} href={url} target="_blank" rel="noopener noreferrer">
                        <img src={url} alt={`proof-${idx}`} style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8, border: '1px solid #ddd' }} />
                      </a>
                    ))}
                  </Space>
                </div>
              )}
            </Card>
          </Col>

          <Col xs={24} lg={8}>
            <Card title="Tiến trình xử lý" bordered={false} style={{ borderRadius: 12, height: '100%' }}>
              <Steps
                direction="vertical"
                current={currentStep}
                status={statusStep}
                items={[
                  {
                    title: 'Đã gửi yêu cầu',
                    description: formatDateTime(data.requestDate),
                  },
                  {
                    title: data.status === 'PENDING' ? 'Đang xét duyệt' : (data.status === 'REJECTED' ? 'Đã từ chối' : 'Đã phê duyệt'),
                    description: data.processedAt ? formatDateTime(data.processedAt) : 'Admin đang xử lý phiếu của bạn',
                  }
                ]}
              />

              {data.status === 'REJECTED' && data.rejectionReason && (
                <Alert 
                  type="error" 
                  showIcon 
                  message="Lý do từ chối" 
                  description={data.rejectionReason} 
                  style={{ marginTop: 24 }}
                />
              )}
              
              {data.status === 'APPROVED' && (
                <Alert 
                  type="success" 
                  showIcon 
                  message="Đã chấp nhận trả hàng" 
                  description="Hệ thống đang tiến hành hoàn tiền cho các sản phẩm hợp lệ." 
                  style={{ marginTop: 24 }}
                />
              )}
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default CustomerReturnDetailPage;