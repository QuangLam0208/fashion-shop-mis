// src/admin/layouts/Sidebar.js
import React from 'react';
import { Layout, Menu } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { MENU_ITEMS } from '../config/menuConfig';

const { Sider } = Layout;

const Sidebar = ({ collapsed }) => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const selected  = MENU_ITEMS.find((m) => location.pathname.startsWith(m.key))?.key || '/admin/dashboard';

  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      width={220}
      style={{ background: '#001529' }}
    >
      {/* Logo */}
      <div style={{
        height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#fff', fontSize: collapsed ? 18 : 20, fontWeight: 700,
        letterSpacing: 2, borderBottom: '1px solid rgba(255,255,255,0.1)',
      }}>
        {collapsed ? 'F' : '✦ FASHION'}
      </div>

      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[selected]}
        items={MENU_ITEMS}
        onClick={({ key }) => navigate(key)}
        style={{ marginTop: 8 }}
      />
    </Sider>
  );
};

export default Sidebar;