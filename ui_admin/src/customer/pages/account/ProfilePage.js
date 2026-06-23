import React, { useState, useEffect } from 'react';
import { 
  Tabs, Form, Input, Button, Card, Row, Col, message, List, 
  Tag, Modal, Popconfirm, Spin, Alert, Checkbox 
} from 'antd';
import { 
  UserOutlined, EditOutlined, DeleteOutlined, 
  EnvironmentOutlined, LockOutlined, CheckCircleOutlined 
} from '@ant-design/icons';
import { customerProfileService } from '../../services/customerProfileService';
import useCustomerAuth from '../../hooks/useCustomerAuth';
import { useNavigate } from 'react-router-dom';

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // States cho modal địa chỉ
  const [isAddressModalVisible, setIsAddressModalVisible] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  
  const [formProfile] = Form.useForm();
  const [formPassword] = Form.useForm();
  const [formAddress] = Form.useForm();
  
  const { logout, updateProfile: updateLocalProfile } = useCustomerAuth();
  const navigate = useNavigate();

  const loadData = async () => {
    setLoading(true);
    try {
      const [profileData, addressData] = await Promise.all([
        customerProfileService.getProfile(),
        customerProfileService.getAddresses()
      ]);
      setProfile(profileData);
      setAddresses(addressData);
      
      formProfile.setFieldsValue({
        fullName: profileData.fullName,
        phone: profileData.phone,
        email: profileData.email
      });
    } catch (error) {
      message.error('Không thể tải thông tin. Vui lòng đăng nhập lại.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // --- HANDLERS CHO PROFILE ---
  const handleUpdateProfile = async (values) => {
    try {
      const updated = await customerProfileService.updateProfile(values);
      setProfile(updated);
      updateLocalProfile(updated); // Cập nhật state ở Context nếu cần
      message.success('Cập nhật thông tin thành công!');
    } catch (error) {
      message.error(error.response?.data?.message || 'Cập nhật thất bại.');
    }
  };

  const handleResendVerification = async () => {
    try {
      await customerProfileService.resendVerification();
      message.success('Đã gửi lại email xác thực. Vui lòng kiểm tra hộp thư!');
    } catch (error) {
      message.error(error.response?.data?.message || 'Không thể gửi email.');
    }
  };

  // --- HANDLERS CHO ĐỔI MẬT KHẨU ---
  const handleChangePassword = async (values) => {
    try {
      await customerProfileService.changePassword(values);
      message.success('Đổi mật khẩu thành công!');
      formPassword.resetFields();
    } catch (error) {
      message.error(error.response?.data?.message || 'Đổi mật khẩu thất bại.');
    }
  };

  // --- HANDLERS CHO ĐỊA CHỈ ---
  const openAddressModal = (address = null) => {
    setEditingAddress(address);
    if (address) {
      formAddress.setFieldsValue(address);
    } else {
      formAddress.resetFields();
      formAddress.setFieldsValue({ isDefault: false });
    }
    setIsAddressModalVisible(true);
  };

  const handleSaveAddress = async (values) => {
    try {
      if (editingAddress) {
        await customerProfileService.updateAddress(editingAddress.id, values);
        message.success('Cập nhật địa chỉ thành công!');
      } else {
        await customerProfileService.createAddress(values);
        message.success('Thêm địa chỉ mới thành công!');
      }
      setIsAddressModalVisible(false);
      loadData(); // Tải lại danh sách
    } catch (error) {
      message.error(error.response?.data?.message || 'Lỗi khi lưu địa chỉ.');
    }
  };

  const handleDeleteAddress = async (id) => {
    try {
      await customerProfileService.deleteAddress(id);
      message.success('Đã xóa địa chỉ!');
      loadData();
    } catch (error) {
      message.error(error.response?.data?.message || 'Không thể xóa địa chỉ này.');
    }
  };

  const handleSetDefaultAddress = async (id) => {
    try {
      await customerProfileService.setDefaultAddress(id);
      message.success('Đã đặt làm địa chỉ mặc định!');
      loadData();
    } catch (error) {
      message.error('Lỗi khi thiết lập mặc định.');
    }
  };

  // --- HANDLER CHO XÓA TÀI KHOẢN ---
  const handleDeleteAccount = async () => {
    try {
      await customerProfileService.deleteAccount();
      message.success('Tài khoản đã được khóa/xóa.');
      logout();
      navigate('/');
    } catch (error) {
      message.error('Không thể xóa tài khoản lúc này.');
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '100px 0' }}><Spin size="large" /></div>;

  // Cấu hình Tabs
  const tabItems = [
    {
      key: '1',
      label: <span><UserOutlined /> Thông tin cá nhân</span>,
      children: (
        <Form layout="vertical" form={formProfile} onFinish={handleUpdateProfile}>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item name="fullName" label="Họ và tên" rules={[{ required: true }]}>
                <Input size="large" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="phone" label="Số điện thoại" rules={[{ required: true }]}>
                <Input size="large" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
                <Input size="large" />
              </Form.Item>
              {profile && (
                <div style={{ marginTop: -15, marginBottom: 20, fontSize: 13 }}>
                  {profile.emailVerified ? (
                    <span style={{ color: '#52c41a' }}><CheckCircleOutlined /> Đã xác thực</span>
                  ) : (
                    <span style={{ color: '#faad14' }}>
                      Chưa xác thực. <a onClick={handleResendVerification}>Gửi lại email</a>
                    </span>
                  )}
                  {profile.pendingEmail && (
                     <div style={{ color: '#1890ff', marginTop: 4 }}>
                       Đang chờ xác thực email mới: {profile.pendingEmail}
                     </div>
                  )}
                </div>
              )}
            </Col>
          </Row>
          <Button type="primary" htmlType="submit" size="large" style={{ background: '#1a1a1a', borderColor: '#1a1a1a' }}>
            Lưu thay đổi
          </Button>
        </Form>
      )
    },
    {
      key: '2',
      label: <span><EnvironmentOutlined /> Sổ địa chỉ</span>,
      children: (
        <div>
          <Button type="dashed" block onClick={() => openAddressModal()} style={{ marginBottom: 24, height: 40 }}>
            + Thêm địa chỉ mới
          </Button>
          <List
            grid={{ gutter: 16, column: 1 }}
            dataSource={addresses}
            renderItem={addr => (
              <List.Item>
                <Card size="small" style={{ borderColor: addr.isDefault ? '#c9a96e' : '#e8e8e8' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 16 }}>
                        {addr.receiverName} | {addr.receiverPhone} 
                        {addr.isDefault && <Tag color="gold" style={{ marginLeft: 8 }}>Mặc định</Tag>}
                      </div>
                      <div style={{ color: '#666', marginTop: 8 }}>{addr.fullAddress}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexDirection: 'column', alignItems: 'flex-end' }}>
                      <div>
                        <Button type="link" onClick={() => openAddressModal(addr)} icon={<EditOutlined />}>Sửa</Button>
                        {!addr.isDefault && (
                          <Popconfirm title="Xóa địa chỉ này?" onConfirm={() => handleDeleteAddress(addr.id)}>
                            <Button type="link" danger icon={<DeleteOutlined />}>Xóa</Button>
                          </Popconfirm>
                        )}
                      </div>
                      {!addr.isDefault && (
                        <Button size="small" onClick={() => handleSetDefaultAddress(addr.id)}>
                          Thiết lập mặc định
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              </List.Item>
            )}
          />
        </div>
      )
    },
    {
      key: '3',
      label: <span><LockOutlined /> Đổi mật khẩu</span>,
      children: (
        <Form layout="vertical" form={formPassword} onFinish={handleChangePassword} style={{ maxWidth: 400 }}>
          <Form.Item name="currentPassword" label="Mật khẩu hiện tại" rules={[{ required: true }]}>
            <Input.Password size="large" />
          </Form.Item>
          <Form.Item name="newPassword" label="Mật khẩu mới" rules={[{ required: true, min: 6 }]}>
            <Input.Password size="large" />
          </Form.Item>
          <Form.Item 
            name="confirmNewPassword" 
            label="Xác nhận mật khẩu mới" 
            dependencies={['newPassword']}
            rules={[
              { required: true },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) return Promise.resolve();
                  return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                },
              }),
            ]}
          >
            <Input.Password size="large" />
          </Form.Item>
          <Button type="primary" htmlType="submit" size="large" style={{ background: '#1a1a1a' }}>
            Cập nhật mật khẩu
          </Button>
        </Form>
      )
    },
    {
      key: '4',
      label: <span>Cài đặt nâng cao</span>,
      children: (
        <div>
          <Alert
            message="Xóa / Khóa tài khoản"
            description="Hành động này sẽ vô hiệu hóa tài khoản của bạn. Bạn sẽ không thể đăng nhập lại. Vui lòng cân nhắc kỹ."
            type="error"
            showIcon
            style={{ marginBottom: 16 }}
          />
          <Popconfirm
            title="CẢNH BÁO"
            description="Bạn có chắc chắn muốn xóa/khóa tài khoản này vĩnh viễn không?"
            onConfirm={handleDeleteAccount}
            okText="Xóa tài khoản"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button danger>Xóa tài khoản</Button>
          </Popconfirm>
        </div>
      )
    }
  ];

  return (
    <div style={{ backgroundColor: '#f9fafb', minHeight: '100vh', paddingBottom: 60, paddingTop: 40 }}>
      <div className="c-container">
        <Card style={{ borderRadius: 12, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: 'none' }}>
          <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 24, marginBottom: 24 }}>
            Quản lý tài khoản
          </h2>
          <Tabs defaultActiveKey="1" items={tabItems} tabPosition="left" />
        </Card>
      </div>

      {/* Modal Thêm/Sửa Địa chỉ */}
      <Modal
        title={editingAddress ? "Sửa địa chỉ" : "Thêm địa chỉ mới"}
        open={isAddressModalVisible}
        onCancel={() => setIsAddressModalVisible(false)}
        footer={null}
        destroyOnClose
      >
        <Form layout="vertical" form={formAddress} onFinish={handleSaveAddress} style={{ marginTop: 16 }}>
          <Form.Item name="receiverName" label="Tên người nhận" rules={[{ required: true }]}>
            <Input size="large" />
          </Form.Item>
          <Form.Item name="receiverPhone" label="Số điện thoại" rules={[{ required: true }]}>
            <Input size="large" />
          </Form.Item>
          <Form.Item name="fullAddress" label="Địa chỉ chi tiết (Số nhà, Phường, Quận, Tỉnh/TP)" rules={[{ required: true }]}>
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="isDefault" valuePropName="checked">
            <Checkbox>Đặt làm địa chỉ mặc định</Checkbox>
          </Form.Item>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button onClick={() => setIsAddressModalVisible(false)}>Hủy</Button>
            <Button type="primary" htmlType="submit" style={{ background: '#1a1a1a' }}>
              Lưu địa chỉ
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default ProfilePage;