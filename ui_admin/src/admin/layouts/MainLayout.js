// src/admin/layouts/MainLayout.js
import React, { useState } from 'react';
import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';
import Sidebar   from './Sidebar';
import AppHeader from './AppHeader';
import AppFooter from './AppFooter';

const { Content } = Layout;

const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sidebar collapsed={collapsed} />
      <Layout>
        <AppHeader collapsed={collapsed} onCollapse={() => setCollapsed(!collapsed)} />
        <Content style={{ margin: '16px', padding: '16px', background: '#fff', borderRadius: 8, minHeight: 360 }}>
          <Outlet />
        </Content>
        <AppFooter />
      </Layout>
    </Layout>
  );
};

export default MainLayout;