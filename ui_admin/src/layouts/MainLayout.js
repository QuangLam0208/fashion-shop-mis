// ─────────────────────────────────────────────────────────────
//  layouts/MainLayout.js
//  Khung chính: Sider + Header + Content(<Outlet/>) + Footer
// ─────────────────────────────────────────────────────────────

import React from 'react';
import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';
import Sidebar   from './Sidebar';
import AppHeader from './AppHeader';
import AppFooter from './AppFooter';

const { Content } = Layout;

const MainLayout = () => (
  <Layout style={{ minHeight: '100vh' }}>
    {/* Sidebar bên trái */}
    <Sidebar />

    {/* Phần còn lại bên phải */}
    <Layout>
      {/* Header sticky trên cùng */}
      <AppHeader />

      {/* Content — nơi các page render vào */}
      <Content
        style={{
          padding:    24,
          minHeight:  'calc(100vh - 64px - 49px)',
          background: '#f0f2f5',
        }}
      >
        <Outlet />
      </Content>

      {/* Footer */}
      <AppFooter />
    </Layout>
  </Layout>
);

export default MainLayout;
