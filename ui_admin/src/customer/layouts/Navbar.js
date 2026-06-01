// src/customer/layouts/Navbar.js
import React, { useState } from 'react';
import { Badge, Button, Drawer, Avatar, Dropdown } from 'antd';
import { ShoppingCartOutlined, UserOutlined, LogoutOutlined, OrderedListOutlined, HeartOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import useCart           from '../hooks/useCart';
import useCustomerAuth   from '../hooks/useCustomerAuth';
import CartDrawer        from '../components/CartDrawer';

const Navbar = () => {
  const { totalItems }               = useCart();
  const { isAuthenticated, currentUser, logout } = useCustomerAuth();
  const [cartOpen, setCartOpen]      = useState(false);
  const navigate                     = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/'); // Đăng xuất xong về trang chủ
  };

  const userMenu = [
    {
      key: 'profile',
      label: 'Tài khoản của tôi',
      icon: <UserOutlined />,
      onClick: () => navigate('/profile')
    },
    {
      key: 'orders',
      label: 'Đơn mua',
      icon: <ShoppingCartOutlined />,
      onClick: () => navigate('/orders')
    },
    {
      key: 'wishlist',
      label: 'Yêu thích',
      icon: <HeartOutlined />,
      onClick: () => navigate('/wishlist')
    },
    { type: 'divider' },
    {
      key: 'logout',
      label: 'Đăng xuất',
      icon: <LogoutOutlined />,
      danger: true, // Chữ màu đỏ
      onClick: handleLogout
    }
  ];

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
          <Dropdown menu={{ items: userMenu }} placement="bottomRight" arrow>
            <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '8px' }}>
              <Avatar 
                style={{ backgroundColor: '#1a1a1a' }} 
                icon={<UserOutlined />} 
                src={currentUser?.avatar} // Nếu user có link avatar thì sẽ tự hiện
              />
              {/* Tên khách hàng (tuỳ chọn, có thể ẩn trên mobile cho gọn) */}
              <span className="navbar-username" style={{ fontWeight: 500 }}>
                {currentUser?.full_name || 'Khách hàng'}
              </span>
            </div>
          </Dropdown>
        ) : (
          <button className="login-btn" onClick={() => navigate('/login')}>
            Đăng nhập
          </button>
        )}
        </div>
      </header>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
};

export default Navbar;