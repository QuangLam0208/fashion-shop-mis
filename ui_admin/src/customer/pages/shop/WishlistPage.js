import React, { useEffect, useState, useCallback } from 'react';
import { Row, Col, Spin, Empty, Breadcrumb, message, Button, Card, Typography, Tag } from 'antd';
import { HomeOutlined, HeartOutlined, ShoppingCartOutlined, DeleteOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { wishlistService } from '../../services/wishlistService';
import useCustomerAuth from '../../hooks/useCustomerAuth';
import { formatCurrency } from '../../../shared/utils/formatters';

const { Text } = Typography;

const WishlistPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const { isAuthenticated } = useCustomerAuth() || {};
  const navigate = useNavigate();

  const loadWishlist = useCallback(async () => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    try {
      const res = await wishlistService.getWishlist();
      const data = Array.isArray(res) ? res : (res?.content || res?.data || []);
      setItems(data);
    } catch (error) {
      if (error?.response?.status === 401) {
        navigate('/login');
      } else {
        message.error(error?.response?.data?.message || 'Không thể tải danh sách sản phẩm yêu thích');
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (!isAuthenticated) {
      message.warning('Vui lòng đăng nhập để xem danh sách yêu thích!');
      navigate('/login');
    } else {
      loadWishlist();
    }
  }, [isAuthenticated, navigate, loadWishlist]);

  // Xóa item bằng wishlistItemId
  const handleRemove = async (wishlistItemId) => {
    try {
      await wishlistService.removeItem(wishlistItemId);
      setItems(prevItems => prevItems.filter(i => i.wishlistItemId !== wishlistItemId));
      message.success('Đã xóa sản phẩm khỏi mục yêu thích.');
    } catch (error) {
      message.error(error?.response?.data?.message || 'Lỗi khi xóa sản phẩm yêu thích.');
    }
  };

  // Chuyển đến trang chi tiết nếu còn hàng
  const handleNavigateToDetail = (productId, inStock) => {
    if (inStock) {
      navigate(`/shop/${productId}`);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '100px 0' }}><Spin size="large" /></div>;
  }

  return (
    <div style={{ backgroundColor: '#f9fafb', minHeight: '100vh', paddingBottom: 60 }}>
      {/* Breadcrumb */}
      <div style={{ backgroundColor: '#fff', borderBottom: '1px solid #eaeaea', padding: '16px 0', marginBottom: 32 }}>
        <div className="c-container">
          <Breadcrumb>
            <Breadcrumb.Item><Link to="/"><HomeOutlined /> Trang chủ</Link></Breadcrumb.Item>
            <Breadcrumb.Item>Sản phẩm yêu thích</Breadcrumb.Item>
          </Breadcrumb>
        </div>
      </div>

      <div className="c-container">
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
          <HeartOutlined style={{ fontSize: 24, color: '#e53935', marginRight: 12 }} />
          <h2 style={{ fontSize: 24, fontWeight: 700, margin: 0, color: '#1a1a1a' }}>
            Sản phẩm yêu thích của tôi
          </h2>
        </div>

        {items.length > 0 ? (
          <Row gutter={[24, 24]}>
            {items.map((item) => (
              <Col xs={24} sm={12} md={8} lg={6} key={item.wishlistItemId}>
                <Card
                  hoverable
                  bodyStyle={{ padding: 16 }}
                  style={{ borderRadius: 12, overflow: 'hidden', height: '100%' }}
                >
                  <div 
                    style={{ position: 'relative', cursor: item.inStock ? 'pointer' : 'not-allowed' }}
                    onClick={() => handleNavigateToDetail(item.productId, item.inStock)}
                  >
                    <img 
                      alt={item.productName} 
                      src={item.primaryImageUrl || 'https://placehold.co/400x400?text=No+Image'} 
                      style={{ 
                        width: '100%', height: 280, objectFit: 'cover', 
                        borderRadius: 8, opacity: item.inStock ? 1 : 0.5 
                      }} 
                    />
                    
                    {/* AC-US22-02: Unavailable display (Hiển thị nhãn Hết hàng) */}
                    {!item.inStock && (
                      <div style={{ position: 'absolute', top: 10, left: 10 }}>
                        <Tag color="error" style={{ margin: 0, fontWeight: 'bold' }}>Hết hàng</Tag>
                      </div>
                    )}
                  </div>

                  <div style={{ marginTop: 16 }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>{item.categoryName}</Text>
                    <div 
                      style={{ 
                        fontWeight: 600, fontSize: 15, marginTop: 4, marginBottom: 8, 
                        cursor: item.inStock ? 'pointer' : 'default',
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                      }}
                      onClick={() => handleNavigateToDetail(item.productId, item.inStock)}
                      title={item.productName}
                    >
                      {item.productName}
                    </div>
                    <div style={{ color: '#e53935', fontWeight: 700, fontSize: 16 }}>
                      {formatCurrency(item.productPrice)}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                    <Button 
                      type="primary" 
                      icon={<ShoppingCartOutlined />} 
                      style={{ flex: 1, borderRadius: 6, background: '#1a1a1a' }}
                      disabled={!item.inStock} // Khóa nút chọn mua nếu hết hàng
                      onClick={() => handleNavigateToDetail(item.productId, item.inStock)}
                    >
                      Chọn mua
                    </Button>
                    <Button 
                      danger 
                      icon={<DeleteOutlined />} 
                      style={{ borderRadius: 6 }}
                      onClick={() => handleRemove(item.wishlistItemId)}
                    />
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        ) : (
          <div style={{ background: '#fff', padding: '60px 0', borderRadius: 12, textAlign: 'center' }}>
            <Empty 
              image={Empty.PRESENTED_IMAGE_SIMPLE} 
              description={<span style={{ color: '#94a3b8' }}>Bạn chưa có sản phẩm yêu thích nào.</span>}
            />
            <Button 
              type="primary" 
              style={{ marginTop: 16, background: '#1a1a1a', borderColor: '#1a1a1a' }}
              onClick={() => navigate('/shop')}
            >
              Khám phá sản phẩm
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;