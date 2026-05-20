// src/customer/layouts/Navbar.js
import React, { useState } from 'react';
import { Badge, Button, Drawer, Avatar, Dropdown } from 'antd';
import { ShoppingCartOutlined, UserOutlined, LogoutOutlined, OrderedListOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import useCart           from '../hooks/useCart';
import useCustomerAuth   from '../hooks/useCustomerAuth';
import CartDrawer        from '../components/CartDrawer';

const Navbar = () => {
  const { totalItems }               = useCart();
  const { isAuthenticated, currentUser, logout } = useCustomerAuth();
  const [cartOpen, setCartOpen]      = useState(false);
  const navigate                     = useNavigate();

  const userMenu = {
    items: [
      { key: 'orders', icon: <OrderedListOutlined />, label: 'Đơn hàng của tôi' },
      { key: 'profile', label: 'Hồ sơ cá nhân' },
      { type: 'divider' },
      { key: 'logout', icon: <LogoutOutlined />, label: 'Đăng xuất', danger: true },
    ],
    onClick: ({ key }) => {
      if (key === 'logout') { logout(); navigate('/'); }
      else navigate(`/account/${key}`);
    },
  };

  return (
    <>
      <header style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: '#fff', borderBottom: '1px solid #f0ede8',
        padding: '0 32px', height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        {/* Logo */}
        <Link to="/" style={{ fontFamily: 'serif', fontSize: 22, fontWeight: 700, letterSpacing: 3, color: '#1a1a1a', textDecoration: 'none' }}>
          ✦ FASHION
        </Link>

        {/* Nav links */}
        <nav style={{ display: 'flex', gap: 28 }}>
          {[['/', 'Trang chủ'], ['/shop', 'Sản phẩm'], ['/shop?sale=true', 'Sale']].map(([href, label]) => (
            <Link key={href} to={href} style={{ color: '#333', textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>{label}</Link>
          ))}
        </nav>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Badge count={totalItems} size="small">
            <Button type="text" icon={<ShoppingCartOutlined style={{ fontSize: 20 }} />} onClick={() => setCartOpen(true)} />
          </Badge>

          {isAuthenticated ? (
            <Dropdown menu={userMenu} placement="bottomRight">
              <Avatar icon={<UserOutlined />} style={{ cursor: 'pointer', background: '#c9a96e' }} />
            </Dropdown>
          ) : (
            <Button type="primary" size="small" onClick={() => navigate('/login')}>Đăng nhập</Button>
          )}
        </div>
      </header>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
};

export default Navbar;