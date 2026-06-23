import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, Button, Input, message, Modal, Space } from 'antd';
import { LockOutlined, UnlockOutlined, EyeOutlined, SearchOutlined } from '@ant-design/icons';
import { userService } from '../../services/userService';
import PageHeader from '../../components/PageHeader';
import CustomerDetailDrawer from './CustomerDetailDrawer';

const UserListPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');
  
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  // Drawer States
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);

  const fetchCustomers = async (page = 1, search = keyword) => {
    setLoading(true);
    try {
      const res = await userService.getCustomers({ page: page - 1, size: pagination.pageSize, keyword: search });
      setData(res?.content || []);
      setPagination({ ...pagination, current: page, total: res?.totalElements || 0 });
    } catch (error) {
      message.error('Lỗi khi tải danh sách khách hàng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers(1, '');
    // eslint-disable-next-line
  }, []);

  const handleSearch = (value) => {
    setKeyword(value);
    fetchCustomers(1, value);
  };

  // AC-FE-US45-04: Xử lý Khóa/Mở khóa có Modal Confirm và Live Update
  const handleToggleLock = (customer) => {
    const isBlocked = customer.status === 'BLOCKED';
    
    Modal.confirm({
      title: isBlocked ? 'Xác nhận Mở khóa tài khoản' : 'Xác nhận Khóa tài khoản',
      content: `Bạn có chắc chắn muốn ${isBlocked ? 'mở khóa' : 'khóa'} tài khoản của khách hàng "${customer.fullName}" không?`,
      okText: 'Xác nhận',
      cancelText: 'Hủy',
      okButtonProps: { danger: !isBlocked },
      onOk: async () => {
        try {
          const newStatus = isBlocked ? 'ACTIVE' : 'BLOCKED';
          
          // SỬA Ở ĐÂY: Dùng customer.userId
          await userService.toggleCustomerStatus(customer.userId, { status: newStatus });
          
          message.success(`${isBlocked ? 'Mở khóa' : 'Khóa'} tài khoản thành công!`);
          
          // Live state update không cần F5
          setData(prev => prev.map(c => 
            (c.userId === customer.userId) ? { ...c, status: newStatus } : c
          ));
        } catch (error) {
          message.error(error?.response?.data?.message || 'Có lỗi xảy ra, không thể thay đổi trạng thái');
        }
      }
    });
  };

  const columns = [
    // SỬA Ở ĐÂY: dataIndex thành 'userId'
    { title: 'Mã KH', dataIndex: 'userId', render: val => <strong>CUS-{val}</strong> },
    { title: 'Họ tên', dataIndex: 'fullName', key: 'fullName' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'SĐT', dataIndex: 'phone', key: 'phone' },
    { 
      title: 'Trạng thái', 
      dataIndex: 'status', 
      render: val => <Tag color={val === 'ACTIVE' ? 'green' : 'red'}>{val === 'BLOCKED' ? 'Bị khóa' : 'Hoạt động'}</Tag> 
    },
    {
      title: 'Hành động',
      key: 'action',
      align: 'center',
      render: (_, record) => {
        const isBlocked = record.status === 'BLOCKED';
        return (
          <Space>
            <Button 
              icon={<EyeOutlined />} 
              // SỬA Ở ĐÂY: Truyền record.userId vào Drawer
              onClick={() => { setSelectedCustomerId(record.userId); setDrawerOpen(true); }}
            >
              Hồ sơ
            </Button>
            
            {/* AC-FE-US45-01: Giao diện nút đổi màu theo trạng thái */}
            {isBlocked ? (
              <Button type="primary" danger ghost icon={<UnlockOutlined />} onClick={() => handleToggleLock(record)}>
                Mở khóa
              </Button>
            ) : (
              <Button type="default" danger icon={<LockOutlined />} onClick={() => handleToggleLock(record)}>
                Khóa tài khoản
              </Button>
            )}
          </Space>
        );
      }
    }
  ];

  return (
    <div>
      <PageHeader title="Quản lý Khách hàng" />

      <Card style={{ borderRadius: 8 }}>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
          <Input.Search 
            placeholder="Tìm theo tên, email, SĐT..." 
            allowClear 
            enterButton={<Button icon={<SearchOutlined />} type="primary">Tìm kiếm</Button>}
            size="large"
            onSearch={handleSearch}
            style={{ width: 400 }}
          />
        </div>

        <Table 
          columns={columns} 
          dataSource={data} 
          // SỬA Ở ĐÂY: rowKey dùng record.userId
          rowKey={(record) => record.userId}
          loading={loading}
          pagination={{ ...pagination, onChange: (page) => fetchCustomers(page) }}
        />
      </Card>

      <CustomerDetailDrawer
        open={drawerOpen} 
        customerId={selectedCustomerId} 
        onClose={() => setDrawerOpen(false)} 
      />
    </div>
  );
};

export default UserListPage;