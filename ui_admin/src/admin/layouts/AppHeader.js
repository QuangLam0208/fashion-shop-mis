import React from 'react';
import { Layout, Avatar, Dropdown, Typography, Space, Badge } from 'antd';
import {
  UserOutlined,
  BellOutlined,
  LogoutOutlined,
  SettingOutlined,
  DownOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const { Header } = Layout;
const { Text }   = Typography;

const AppHeader = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const userMenuItems = [
    {
      key:     'profile',
      icon:    <UserOutlined />,
      label:   'Thông tin cá nhân',
    },
    {
      key:     'settings',
      icon:    <SettingOutlined />,
      label:   'Cài đặt',
    },
    { type: 'divider' },
    {
      key:     'logout',
      icon:    <LogoutOutlined />,
      label:   'Đăng xuất',
      danger:  true,
    },
  ];

  const handleMenuClick = ({ key }) => {
    if (key === 'logout') handleLogout();
  };

  return (
    <Header
      style={{
        background:     '#ffffff',
        padding:        '0 24px',
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'space-between',
        borderBottom:   '1px solid #f0f0f0',
        boxShadow:      '0 1px 4px rgba(0,0,0,0.06)',
        position:       'sticky',
        top:            0,
        zIndex:         100,
      }}
    >
      {/* Left — có thể để tên trang hoặc breadcrumb global */}
      <div />

      {/* Right — notification + user */}
      <Space size={16}>
        {/* Notification bell */}
        <Badge count={3} size="small">
          <BellOutlined
            style={{
              fontSize: 18,
              color:    '#64748b',
              cursor:   'pointer',
              padding:  4,
            }}
          />
        </Badge>

        {/* User dropdown */}
        <Dropdown
          menu={{ items: userMenuItems, onClick: handleMenuClick }}
          placement="bottomRight"
          arrow
        >
          <Space
            style={{ cursor: 'pointer', padding: '4px 8px', borderRadius: 8 }}
            className="header-user-trigger"
          >
            <Avatar
              size={34}
              style={{
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                fontWeight: 700,
              }}
            >
              {currentUser?.full_name?.charAt(0)?.toUpperCase() || 'A'}
            </Avatar>
            <div style={{ lineHeight: 1.2 }}>
              <Text
                strong
                style={{ display: 'block', fontSize: 13, color: '#1e293b' }}
              >
                {currentUser?.full_name || 'Admin'}
              </Text>
              <Text
                type="secondary"
                style={{ fontSize: 11 }}
              >
                {currentUser?.role === 'ADMIN' ? 'Quản trị viên' : 'Nhân viên'}
              </Text>
            </div>
            <DownOutlined style={{ fontSize: 11, color: '#94a3b8' }} />
          </Space>
        </Dropdown>
      </Space>
    </Header>
  );
};

export default AppHeader;
