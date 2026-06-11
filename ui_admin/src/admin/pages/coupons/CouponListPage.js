import React, { useState, useEffect, useCallback } from 'react';
import { Card, Table, Button, Tag, Space, message, Typography } from 'antd';
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { couponService } from '../../services/couponService';
import { formatCurrency, formatDateTime } from '../../../shared/utils/formatters';

const { Title } = Typography;

const CouponListPage = () => {
  const navigate = useNavigate();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // State phân trang
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const fetchCoupons = useCallback(async (page = 1, size = 10) => {
    setLoading(true);
    try {
      const res = await couponService.getCoupons({ page: page - 1, size });
      
      setCoupons(res?.content || res?.data || res || []);
      setPagination({
        current: page,
        pageSize: size,
        total: res?.totalElements || res?.total || 0,
      });
    } catch (error) {
        console.error("LỖI THỰC SỰ LÀ:", error); // Bổ sung dòng này
      message.error('Không thể tải danh sách mã giảm giá!');    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCoupons(pagination.current, pagination.pageSize);
  }, [ fetchCoupons ]);

  const handleTableChange = (newPagination) => {
    fetchCoupons(newPagination.current, newPagination.pageSize);
  };

  const columns = [
    {
      title: 'Mã Coupon',
      dataIndex: 'code',
      key: 'code',
      render: (text) => <strong style={{ fontSize: 16, color: '#1890ff' }}>{text}</strong>,
    },
    {
      title: 'Mức giảm',
      key: 'discount',
      render: (_, record) => {
        if (record.discountType === 'PERCENTAGE') {
          return <Tag color="blue">Giảm {record.discountValue}%</Tag>;
        }
        return <Tag color="green">Giảm {formatCurrency(record.discountValue)}</Tag>;
      }
    },
    {
      title: 'Đơn tối thiểu',
      dataIndex: 'minOrderAmount',
      key: 'minOrderAmount',
      align: 'right',
      render: (amount) => formatCurrency(amount || 0),
    },
    {
      title: 'Phát hành',
      dataIndex: 'usageLimit',
      key: 'usageLimit',
      align: 'center',
      render: (limit) => <strong>{limit}</strong>,
    },
    {
      title: 'Thời gian hiệu lực',
      key: 'validity',
      render: (_, record) => (
        <div style={{ fontSize: 13 }}>
          <div>Từ: {formatDateTime(record.startDate)}</div>
          <div style={{ color: '#d4380d' }}>Đến: {formatDateTime(record.expiryDate)}</div>
        </div>
      ),
    },
    {
      title: 'Trạng thái',
      key: 'status',
      align: 'center',
      render: (_, record) => {
        // Kiểm tra xem đã quá ngày hết hạn chưa
        const isExpired = new Date(record.expiryDate) < new Date();
        if (isExpired) return <Tag color="default">Đã hết hạn</Tag>;
        
        // Dựa vào trường active của DTO
        return <Tag color={record.active ? 'success' : 'error'}>
          {record.active ? 'Đang hoạt động' : 'Tạm khóa'}
        </Tag>;
      },
    }
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>Quản lý Mã Giảm Giá</Title>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={() => fetchCoupons(1, pagination.pageSize)}>
            Làm mới
          </Button>
          
          <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/admin/coupons/create')}>
            Thêm mới Voucher
          </Button>
        </Space>
      </div>

      <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
        <Table
          columns={columns}
          dataSource={coupons}
          rowKey="couponId" // Đã đổi thành couponId theo đúng DTO
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
          }}
          onChange={handleTableChange}
          bordered
        />
      </Card>
    </div>
  );
};

export default CouponListPage;