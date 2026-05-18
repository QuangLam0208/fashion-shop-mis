// src/admin/layouts/AppHeader.js
import React from 'react';
import { Layout, Button, Avatar, Dropdown, Space, Typography } from 'antd';
import { MenuFoldOutlined, MenuUnfoldOutlined, UserOutlined, LogoutOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const { Header } = Layout;

const AppHeader = ({ collapsed, onCollapse }) => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const menuItems = [
    { key: 'logout', icon: <LogoutOutlined />, label: 'Đăng xuất', danger: true },
  ];
  
  const handleMenu = ({ key }) => {
    if (key === 'logout') { logout(); navigate('/admin/login'); }
  };

  return (
    <Header style={{ padding: '0 24px', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
      <Button
        type="text"
        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        onClick={onCollapse}
        style={{ fontSize: 18 }}
      />
      <Dropdown menu={{ items: menuItems, onClick: handleMenu }} placement="bottomRight">
        <Space style={{ cursor: 'pointer' }}>
          <Avatar icon={<UserOutlined />} style={{ background: '#1890ff' }} />
          <Typography.Text strong>{currentUser?.full_name || 'Admin'}</Typography.Text>
        </Space>
      </Dropdown>
    </Header>
  );
};

export default AppHeader;