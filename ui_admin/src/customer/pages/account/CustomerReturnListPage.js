import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, message, Breadcrumb } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { customerReturnService } from '../../services/customerReturnService';
import { formatDateTime } from '../../../shared/utils/formatters';

const CustomerReturnListPage = () => {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReturns = async () => {
      try {
        const data = await customerReturnService.getMyReturnRequests();
        // Xử lý lấy mảng Array chuẩn
        setReturns(Array.isArray(data) ? data : (data?.content || data?.data || []));
      } catch (error) {
        message.error('Không thể tải lịch sử trả hàng');
      } finally {
        setLoading(false);
      }
    };
    fetchReturns();
  }, []);

  const columns = [
    { title: 'Mã Yêu cầu', dataIndex: 'requestId', key: 'requestId', render: (id) => <strong style={{ color: '#1677ff' }}>#{id}</strong> },
    { title: 'Mã Đơn hàng', dataIndex: 'orderId', key: 'orderId', render: (id) => <span>#{id}</span> },
    { title: 'Ngày gửi', dataIndex: 'requestDate', key: 'requestDate', render: (date) => formatDateTime(date) },
    { title: 'Lý do', dataIndex: 'reason', key: 'reason' },
    { title: 'Số SP trả', dataIndex: 'totalItems', key: 'totalItems', align: 'center' },
    { 
      title: 'Trạng thái', 
      dataIndex: 'status', 
      key: 'status', 
      render: (status) => {
        let color = 'orange'; // PENDING
        if (status === 'APPROVED' || status === 'COMPLETED') color = 'green';
        if (status === 'REJECTED') color = 'red';
        return <Tag color={color} style={{ fontWeight: 600 }}>{status || 'PENDING'}</Tag>;
      } 
    }
  ];

  return (
    <div style={{ backgroundColor: '#f9fafb', minHeight: '100vh', paddingBottom: 60 }}>
      {/* Breadcrumb */}
      <div style={{ backgroundColor: '#fff', borderBottom: '1px solid #eaeaea', padding: '16px 0', marginBottom: 32 }}>
        <div className="c-container">
          <Breadcrumb>
            <Breadcrumb.Item><Link to="/"><HomeOutlined /> Trang chủ</Link></Breadcrumb.Item>
            <Breadcrumb.Item><Link to="/account/profile">Tài khoản</Link></Breadcrumb.Item>
            <Breadcrumb.Item>Yêu cầu trả hàng</Breadcrumb.Item>
          </Breadcrumb>
        </div>
      </div>

      <div className="c-container">
        <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24, color: '#1a1a1a' }}>Yêu cầu Trả hàng / Hoàn tiền</h2>
        <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
          <Table 
            columns={columns} 
            dataSource={returns} 
            rowKey="requestId" 
            loading={loading} 
            locale={{ emptyText: 'Bạn chưa có yêu cầu trả hàng nào.' }}
          />
        </Card>
      </div>
    </div>
  );
};

export default CustomerReturnListPage;