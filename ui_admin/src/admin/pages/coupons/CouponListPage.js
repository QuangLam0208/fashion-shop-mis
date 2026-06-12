import React, { useState, useEffect, useCallback } from 'react';
import { Card, Table, Button, Tag, Space, message, Typography, Switch, Tooltip } from 'antd';
import { PlusOutlined, ReloadOutlined, EditOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { couponService } from '../../services/couponService';
import { formatCurrency, formatDateTime } from '../../../shared/utils/formatters';
import CouponEditModal from './CouponEditModal';

const { Title } = Typography;

const CouponListPage = () => {
  const navigate = useNavigate();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // State: Quản lý loading của riêng từng nút Toggle Switch (AC-FE-US38-01)
  const [toggling, setToggling] = useState({});
  
  // State: Modal Edit
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);

  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  const fetchCoupons = useCallback(async (page = 1, size = 10) => {
    setLoading(true);
    try {
      const res = await couponService.getCoupons({ page: page - 1, size });
      setCoupons(res?.content || res?.data || res || []);
      setPagination({ current: page, pageSize: size, total: res?.totalElements || res?.total || 0 });
    } catch (error) {
      message.error('Không thể tải danh sách mã giảm giá!');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCoupons(pagination.current, pagination.pageSize);
  }, [fetchCoupons]);

  // AC-US38-01: Hàm xử lý Bật/Tắt trạng thái
  const handleToggleStatus = async (couponId, currentActive) => {
    const newStatus = !currentActive;
    
    // Bật hiệu ứng loading cho đúng dòng đang tương tác
    setToggling(prev => ({ ...prev, [couponId]: true }));
    
    try {
      await couponService.toggleCouponStatus(couponId);
      
      // AC-FE-US38-03: Cập nhật giao diện lập tức mà không cần fetch lại toàn bộ bảng
      setCoupons(prevCoupons => prevCoupons.map(c => 
        c.couponId === couponId ? { ...c, active: newStatus } : c
      ));
      message.success(`Đã ${newStatus ? 'KÍCH HOẠT' : 'VÔ HIỆU HÓA'} mã giảm giá`);
    } catch (error) {
      // AC-FE-US38-05: Lỗi thì báo và tự động lùi về state cũ (vì không update setCoupons)
      message.error(error?.response?.data?.message || 'Không thể thay đổi trạng thái!');
    } finally {
      setToggling(prev => ({ ...prev, [couponId]: false }));
    }
  };

  const handleEditClick = (record) => {
    setEditingCoupon(record);
    setEditModalOpen(true);
  };

  const columns = [
    { title: 'Mã Coupon', dataIndex: 'code', key: 'code', render: (text) => <strong style={{ fontSize: 15, color: '#1890ff' }}>{text}</strong> },
    {
      title: 'Mức giảm',
      key: 'discount',
      render: (_, record) => (
        record.discountType === 'PERCENTAGE' 
          ? <Tag color="blue">Giảm {record.discountValue}%</Tag> 
          : <Tag color="green">Giảm {formatCurrency(record.discountValue)}</Tag>
      )
    },
    { title: 'Đơn tối thiểu', dataIndex: 'minOrderAmount', align: 'right', render: (val) => formatCurrency(val || 0) },
    { title: 'Phát hành', dataIndex: 'usageLimit', align: 'center', render: (limit) => <strong>{limit}</strong> },
    {
      title: 'Hiệu lực',
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
        const isExpired = new Date(record.expiryDate) < new Date();
        if (isExpired) return <Tag color="default">Đã hết hạn</Tag>;
        
        // AC-FE-US38-01: Toggle Switch có hiển thị Loading
        return (
          <Switch 
            checked={record.active} 
            loading={toggling[record.couponId]}
            onChange={() => handleToggleStatus(record.couponId, record.active)}
            checkedChildren="Bật"
            unCheckedChildren="Tắt"
          />
        );
      },
    },
    {
      title: 'Thao tác',
      key: 'action',
      align: 'center',
      render: (_, record) => (
        <Tooltip title="Chỉnh sửa">
          <Button type="primary" ghost size="small" icon={<EditOutlined />} onClick={() => handleEditClick(record)} />
        </Tooltip>
      )
    }
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>Quản lý Mã Giảm Giá</Title>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={() => fetchCoupons(1, pagination.pageSize)}>Làm mới</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/admin/coupons/create')}>Thêm mới</Button>
        </Space>
      </div>

      <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
        <Table
          columns={columns}
          dataSource={coupons}
          rowKey="couponId"
          loading={loading}
          pagination={{ ...pagination, showSizeChanger: true }}
          onChange={(newPag) => fetchCoupons(newPag.current, newPag.pageSize)}
          bordered
        />
      </Card>

      {/* Gọi Edit Modal */}
      <CouponEditModal
        open={editModalOpen}
        onCancel={() => { setEditModalOpen(false); setEditingCoupon(null); }}
        couponData={editingCoupon}
        onSuccess={() => {
          setEditModalOpen(false);
          fetchCoupons(pagination.current, pagination.pageSize);
        }}
      />
    </div>
  );
};

export default CouponListPage;