// src/customer/layouts/Navbar.js
import React, { useEffect, useState } from 'react';
import { Badge, Button, Drawer, Avatar, Dropdown, message, Typography, Spin, List, Popover } from 'antd';
import { ShoppingCartOutlined, UserOutlined, LogoutOutlined, OrderedListOutlined, HeartOutlined, HistoryOutlined, WalletOutlined, StarOutlined, CheckOutlined, BellOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import useCart           from '../hooks/useCart';
import useCustomerAuth   from '../hooks/useCustomerAuth';
import CartDrawer        from '../components/CartDrawer';
import { notificationService } from '../services/notificationService';
import { formatDateTime } from '../../shared/utils/formatters';
const { Text } = Typography;

const Navbar = () => {
  const { totalItems }               = useCart();
  const { isAuthenticated, currentUser, logout } = useCustomerAuth();
  const [cartOpen, setCartOpen]      = useState(false);
  const navigate                     = useNavigate();

  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifs, setLoadingNotifs] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);

  // AC-US42-04 & AC-FE-US42-01: Lấy số lượng chưa đọc khi vừa load trang nếu đã đăng nhập
  useEffect(() => {
    if (isAuthenticated) {
      const fetchUnreadCount = async () => {
        try {
          const res = await notificationService.getUnreadCount();
          // Backend có thể trả về kiểu số trực tiếp hoặc Object { count: x }
          const count = typeof res === 'number' ? res : (res?.count || res?.data || 0);
          setUnreadCount(count);
        } catch (error) {
          console.error("Không thể tải số lượng thông báo", error);
        }
      };
      fetchUnreadCount();
    }
  }, [isAuthenticated]);

  // Hành vi khi bấm mở Popover Chuông thông báo
  const handlePopoverChange = (open) => {
    setPopoverOpen(open);
    if (open) {
      fetchNotifications();
    }
  };

  const fetchNotifications = async () => {
    setLoadingNotifs(true);
    try {
      const res = await notificationService.getNotifications({ page: 0, size: 5, sort: 'createdAt,desc' });
      const dataList = res?.content || res?.data?.content || res || [];
      setNotifications(dataList);
    } catch (error) {
      message.error("Không thể tải danh sách thông báo");
    } finally {
      setLoadingNotifs(false);
    }
  };

  // AC-US42-02: Đánh dấu 1 mục đã đọc
  const handleMarkAsRead = async (id, isRead) => {
    if (isRead) return; // Nếu đã đọc rồi thì không gọi API nữa
    try {
      await notificationService.markAsRead(id);
      // Cập nhật UI ngay lập tức: Đổi màu nền, giảm số Badge
      setNotifications(prev => prev.map(n => 
        (n.id === id || n.notificationId === id) ? { ...n, isRead: true, read: true } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Lỗi cập nhật trạng thái đọc", error);
    }
  };

  // AC-US42-03 & AC-FE-US42-02: Đánh dấu tất cả
  const handleMarkAllAsRead = async () => {
    setMarkingAll(true);
    try {
      await notificationService.markAllAsRead();
      // Chuyển toàn bộ màu nền thông báo sang trắng đồng bộ
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true, read: true })));
      // Auto-reset số trên Badge Counter về 0
      setUnreadCount(0);
    } catch (error) {
      message.error("Có lỗi xảy ra khi cập nhật");
    } finally {
      setMarkingAll(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/'); // Đăng xuất xong về trang chủ
  };

  const userMenu = [
    {
      key: 'profile',
      label: 'Tài khoản của tôi',
      icon: <UserOutlined />,
      onClick: () => navigate('/account/profile')
    },
    {
      key: 'orders',
      label: 'Đơn mua',
      icon: <ShoppingCartOutlined />,
      onClick: () => navigate('/account/orders')
    },
    {
      key: 'returns',
      label: 'Yêu cầu trả hàng',
      icon: <HistoryOutlined />,
      onClick: () => navigate('/account/returns')
    },
    {
      key: 'wallet',
      label: 'Ví Voucher',
      icon: <WalletOutlined />,
      onClick: () => navigate('/account/wallet')
    },
    {
      key: 'my-reviews',
      label: 'Đánh giá của tôi',
      icon: <StarOutlined />,
      onClick: () => navigate('/account/my-reviews')
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

  const notificationContent = (
    <div style={{ width: 340, padding: '0 8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 12, borderBottom: '1px solid #f0f0f0', marginBottom: 8 }}>
        <Text strong style={{ fontSize: 16 }}>Thông báo mới</Text>
        {unreadCount > 0 && (
          <Button type="link" size="small" onClick={handleMarkAllAsRead} loading={markingAll} style={{ fontSize: 13, padding: 0 }}>
            <CheckOutlined /> Đánh dấu tất cả đã đọc
          </Button>
        )}
      </div>

      {loadingNotifs && notifications.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '30px 0' }}><Spin /></div>
      ) : notifications.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
          <BellOutlined style={{ fontSize: 32, color: '#e2e8f0', marginBottom: 8 }} />
          <div>Bạn chưa có thông báo nào</div>
        </div>
      ) : (
        <div style={{ maxHeight: 400, overflowY: 'auto', margin: '0 -8px' }}>
          <List
            itemLayout="horizontal"
            dataSource={notifications}
            renderItem={item => {
              const isItemRead = item.isRead || item.read;
              const notifId = item.id || item.notificationId;
              
              return (
                <List.Item 
                  style={{ 
                    padding: '12px 16px', 
                    cursor: 'pointer', 
                    backgroundColor: isItemRead ? '#fff' : '#f0f5ff', // Nền xanh nhạt nếu chưa đọc
                    borderBottom: '1px solid #f0f0f0',
                    transition: 'background-color 0.3s ease'
                  }}
                  onClick={() => handleMarkAsRead(notifId, isItemRead)}
                >
                  <List.Item.Meta
                    avatar={
                      <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#e6f4ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <BellOutlined style={{ color: '#1677ff', fontSize: 18 }} />
                      </div>
                    }
                    title={
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Text style={{ fontSize: 14, fontWeight: isItemRead ? 500 : 700, color: isItemRead ? '#333' : '#000' }}>
                          {item.title}
                        </Text>
                        {!isItemRead && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ff4d4f', marginTop: 6 }} />}
                      </div>
                    }
                    description={
                      <div>
                        <div style={{ fontSize: 13, color: '#666', marginBottom: 6, lineHeight: 1.4 }}>{item.message || item.content}</div>
                        <div style={{ fontSize: 11, color: '#94a3b8' }}>{formatDateTime(item.createdAt)}</div>
                      </div>
                    }
                  />
                </List.Item>
              );
            }}
          />
        </div>
      )}
    </div>
  );

  return (
    <>
      <header style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: '#fff', borderBottom: '1px solid #f0ede8',
        padding: '0 32px', height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        {/* Nav links */}
        <nav style={{ display: 'flex', gap: 28 }}>
          {[['/', 'Danh mục'], ['/shop', 'Sản phẩm'], ['/shop?sale=true', 'Sale']].map(([href, label]) => (
            <Link key={href} to={href} style={{ color: '#333', textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>{label}</Link>
          ))}
        </nav>

        <Link to="/" style={{ fontFamily: 'serif', fontSize: 22, fontWeight: 700, letterSpacing: 3, color: '#1a1a1a', textDecoration: 'none' }}>
          ✦ FASHION ✦
        </Link>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {/* Nút Giỏ hàng */}
          <Badge count={totalItems} size="small" offset={[-4, 4]}>
            <Button type="text" icon={<ShoppingCartOutlined style={{ fontSize: 20 }} />} onClick={() => setCartOpen(true)} />
          </Badge>

          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              {/* Nút Chuông Thông báo (US-42) */}
              <Popover 
                content={notificationContent} 
                trigger="click" 
                placement="bottomRight"
                open={popoverOpen}
                onOpenChange={handlePopoverChange}
                overlayInnerStyle={{ padding: '12px 0 0 0', borderRadius: 12, overflow: 'hidden' }}
              >
                <Badge count={unreadCount} size="small" offset={[-4, 4]}>
                  <Button type="text" icon={<BellOutlined style={{ fontSize: 20 }} />} />
                </Badge>
              </Popover>

              <Dropdown menu={{ items: userMenu }} placement="bottomRight" arrow>
                <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '8px' }}>
                  <Avatar style={{ backgroundColor: '#1a1a1a' }} icon={<UserOutlined />} src={currentUser?.avatar} />
                  <span className="navbar-username" style={{ fontWeight: 500 }}>
                    {currentUser?.full_name || 'Khách hàng'}
                  </span>
                </div>
              </Dropdown>
            </div>
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