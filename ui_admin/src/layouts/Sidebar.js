// ─────────────────────────────────────────────────────────────
//  layouts/Sidebar.js
// ─────────────────────────────────────────────────────────────

import React, { useState, useMemo } from 'react';
import { Layout, Menu } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShopOutlined } from '@ant-design/icons';
import { MENU_ITEMS } from '../config/menuConfig';

const { Sider } = Layout;

/** Chuyển MENU_ITEMS → format antd Menu items */
const buildMenuItems = (items) =>
  items.map((item) => ({
    key:      item.key,
    icon:     item.icon,
    label:    item.label,
    children: item.children ? buildMenuItems(item.children) : undefined,
  }));

/** Tìm key đang active dựa theo pathname */
const findActiveKey = (items, pathname) => {
  for (const item of items) {
    if (item.path && pathname.startsWith(item.path)) return item.key;
    if (item.children) {
      const found = findActiveKey(item.children, pathname);
      if (found) return found;
    }
  }
  return '';
};

/** Tìm tất cả parentKey cần mở để hiển thị item active */
const findOpenKeys = (items, pathname) => {
  for (const item of items) {
    if (item.children) {
      const found = findActiveKey(item.children, pathname);
      if (found) return [item.key];
    }
  }
  return [];
};

const Sidebar = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const menuItems   = useMemo(() => buildMenuItems(MENU_ITEMS), []);
  const selectedKey = useMemo(() => findActiveKey(MENU_ITEMS, location.pathname), [location.pathname]);
  const defaultOpen = useMemo(() => findOpenKeys(MENU_ITEMS, location.pathname), [location.pathname]);

  const handleClick = ({ key }) => {
    // Tìm path tương ứng với key
    const findPath = (items) => {
      for (const item of items) {
        if (item.key === key && item.path) return item.path;
        if (item.children) {
          const p = findPath(item.children);
          if (p) return p;
        }
      }
      return null;
    };
    const path = findPath(MENU_ITEMS);
    if (path) navigate(path);
  };

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={setCollapsed}
      width={240}
      collapsedWidth={72}
      style={{
        background:  '#0f172a',
        overflow:    'auto',
        height:      '100vh',
        position:    'sticky',
        top:         0,
        left:        0,
        boxShadow:   '2px 0 8px rgba(0,0,0,0.15)',
      }}
    >
      {/* Logo */}
      <div
        style={{
          display:        'flex',
          alignItems:     'center',
          gap:            10,
          padding:        collapsed ? '20px 22px' : '20px 24px',
          borderBottom:   '1px solid rgba(255,255,255,0.06)',
          marginBottom:   8,
          transition:     'padding 0.2s',
        }}
      >
        <div
          style={{
            width:          36,
            height:         36,
            borderRadius:   10,
            background:     'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            flexShrink:     0,
          }}
        >
          <ShopOutlined style={{ color: '#fff', fontSize: 18 }} />
        </div>
        {!collapsed && (
          <span
            style={{
              color:       '#fff',
              fontWeight:  700,
              fontSize:    16,
              whiteSpace:  'nowrap',
              letterSpacing: '-0.3px',
            }}
          >
            Fashion Admin
          </span>
        )}
      </div>

      {/* Menu */}
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[selectedKey]}
        defaultOpenKeys={defaultOpen}
        items={menuItems}
        onClick={handleClick}
        style={{
          background:   '#0f172a',
          border:       'none',
          fontSize:     14,
          padding:      '4px 0',
        }}
      />
    </Sider>
  );
};

export default Sidebar;
