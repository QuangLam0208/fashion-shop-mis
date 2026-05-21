    import React, { useEffect, useState, useCallback } from 'react';
import { Row, Col, Spin, Empty, Breadcrumb, message, Button } from 'antd';
import { HomeOutlined, HeartOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import ProductCard from '../../components/ProductCard';
import { wishlistService } from '../../services/wishlistService';
import useCustomerAuth from '../../hooks/useCustomerAuth';

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
      message.error('Không thể tải danh sách sản phẩm yêu thích');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Kiểm tra đăng nhập trước khi tải trang
  useEffect(() => {
    if (!isAuthenticated) {
      message.warning('Vui lòng đăng nhập để xem danh sách yêu thích!');
      navigate('/login');
    } else {
      loadWishlist();
    }
  }, [isAuthenticated, navigate, loadWishlist]);

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
            {items.map((item) => {
              const productData = {
                ...item,
                productId: item.productId,
                name: item.productName || item.name,
                price: item.productPrice || item.price,
              };
              
              const rowKey = item.wishlistItemId ?? item.productId;

              return (
                <Col xs={12} sm={12} md={8} xl={6} key={rowKey}>
                  <ProductCard 
                    product={productData} 
                    initialWishlisted={true} 
                    onWishlistChange={(pId, isNowWishlisted) => {
                      if (!isNowWishlisted) {
                         setItems(prevItems => prevItems.filter(i => i.productId !== pId));
                      }
                    }}
                  />
                </Col>
              );
            })}
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