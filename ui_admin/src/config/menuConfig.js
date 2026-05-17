// ─────────────────────────────────────────────────────────────
//  config/menuConfig.js
//  Cấu hình menu sidebar — Sidebar.js đọc từ đây để render
// ─────────────────────────────────────────────────────────────

import React from 'react';
import {
  DashboardOutlined,
  ShoppingOutlined,
  TagsOutlined,
  OrderedListOutlined,
  RollbackOutlined,
  UserOutlined,
  GiftOutlined,
} from '@ant-design/icons';

/**
 * MENU_ITEMS — mảng cấu hình menu antd
 * Mỗi item: { key, label, icon, path }
 * Item có children sẽ hiển thị dạng SubMenu (không có path)
 */
export const MENU_ITEMS = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    icon: <DashboardOutlined />,
    path: '/admin/dashboard',
  },
  {
    key: 'products-group',
    label: 'Sản phẩm',
    icon: <ShoppingOutlined />,
    children: [
      {
        key: 'products',
        label: 'Danh sách sản phẩm',
        icon: <ShoppingOutlined />,
        path: '/admin/products',
      },
      {
        key: 'categories',
        label: 'Danh mục',
        icon: <TagsOutlined />,
        path: '/admin/categories',
      },
    ],
  },
  {
    key: 'orders-group',
    label: 'Đơn hàng',
    icon: <OrderedListOutlined />,
    children: [
      {
        key: 'orders',
        label: 'Danh sách đơn',
        icon: <OrderedListOutlined />,
        path: '/admin/orders',
      },
      {
        key: 'orders-create',
        label: 'Tạo đơn (POS)',
        icon: <OrderedListOutlined />,
        path: '/admin/orders/create',
      },
    ],
  },
  {
    key: 'returns',
    label: 'Trả hàng',
    icon: <RollbackOutlined />,
    path: '/admin/returns',
  },
  {
    key: 'users',
    label: 'Người dùng',
    icon: <UserOutlined />,
    path: '/admin/users',
  },
  {
    key: 'coupons',
    label: 'Khuyến mãi',
    icon: <GiftOutlined />,
    path: '/admin/coupons',
  },
];
