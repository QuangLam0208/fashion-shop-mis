import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Row, Col, Button, InputNumber, Spin, Breadcrumb, message, Divider, Space, Rate, Avatar, List, Typography } from 'antd';
import { HomeOutlined, ShoppingCartOutlined, CreditCardOutlined, UserOutlined } from '@ant-design/icons';
import { shopProductService } from '../../services/shopProductService';
import useCart from '../../hooks/useCart';
import { formatCurrency } from '../../../shared/utils/formatters';
import ProductCard from '../../components/ProductCard'; // Import ProductCard để hiển thị sp liên quan

const { Text, Paragraph } = Typography;

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]); // State lưu sp liên quan
  const [loading, setLoading] = useState(true);
  
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [mainImage, setMainImage] = useState('');

  useEffect(() => {
    // Cuộn lên đầu trang mỗi khi ID thay đổi (đặc biệt khi click từ mục Sản phẩm liên quan)
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const fetchProductAndRelated = async () => {
      setLoading(true);
      try {
        // 1. Tải thông tin sản phẩm chính
        const data = await shopProductService.getById(id);
        const productData = data?.data || data;
        setProduct(productData);
        setMainImage(productData.mainImage || 'https://placehold.co/600x600?text=No+Image');
        
        if (productData.variants && productData.variants.length > 0) {
          setSelectedVariant(productData.variants[0]);
        }

        // 2. Tải danh sách sản phẩm liên quan
        try {
          const relatedData = await shopProductService.getRelated(id, 4);
          setRelatedProducts(relatedData?.data || relatedData || []);
        } catch (relError) {
          console.error('Không thể tải sản phẩm liên quan:', relError);
          setRelatedProducts([]); // Fallback rỗng nếu lỗi
        }

      } catch (error) {
        console.error('Lỗi tải sản phẩm:', error);
        message.error(error.response?.data?.message || 'Không tìm thấy sản phẩm!');
        navigate('/shop');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProductAndRelated();
    
    // Reset lại state số lượng mỗi khi xem sp mới
    setQuantity(1);
  }, [id, navigate]);

  const handleAddToCart = () => {
    if (!product) return;
    
    if (product.variants?.length > 0 && !selectedVariant) {
      message.warning('Vui lòng chọn phân loại hàng!');
      return;
    }

    addItem({
      productId: product.productId,
      variantId: selectedVariant?.variantId,
      quantity: quantity
    });
  };

  const handleBuyNow = () => {
    handleAddToCart();
    setTimeout(() => {
      navigate('/checkout');
    }, 500);
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '100px 0' }}><Spin size="large" /></div>;
  }

  if (!product) return null;

  const displayPrice = selectedVariant?.price || product.price || product.minPrice || 0;
  const displayStock = selectedVariant ? selectedVariant.stockQuantity : (product.variants?.reduce((sum, v) => sum + v.stockQuantity, 0) || 0);
  const isOutOfStock = displayStock <= 0 || product.status === 'OUT_OF_STOCK';

  return (
    <div style={{ backgroundColor: '#f9fafb', minHeight: '100vh', paddingBottom: 60 }}>
      {/* Breadcrumb */}
      <div style={{ backgroundColor: '#fff', borderBottom: '1px solid #eaeaea', padding: '16px 0', marginBottom: 32 }}>
        <div className="c-container">
          <Breadcrumb>
            <Breadcrumb.Item><Link to="/"><HomeOutlined /> Trang chủ</Link></Breadcrumb.Item>
            <Breadcrumb.Item><Link to="/shop">Cửa hàng</Link></Breadcrumb.Item>
            <Breadcrumb.Item>{product.name}</Breadcrumb.Item>
          </Breadcrumb>
        </div>
      </div>

      <div className="c-container">
        {/* KHU VỰC THÔNG TIN CHÍNH */}
        <div style={{ background: '#fff', padding: 32, borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
          <Row gutter={[48, 32]}>
            <Col xs={24} md={10}>
              <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid #eaeaea' }}>
                <img 
                  src={mainImage} 
                  alt={product.name} 
                  style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'cover', aspectRatio: '1/1' }} 
                />
              </div>
              
              {product.images && product.images.length > 1 && (
                <div style={{ display: 'flex', gap: 12, marginTop: 16, overflowX: 'auto' }}>
                  {product.images.map((img) => (
                    <img 
                      key={img.imageId} 
                      src={img.url} 
                      alt={`thumb-${img.imageId}`}
                      style={{ 
                        width: 80, height: 80, objectFit: 'cover', borderRadius: 8, cursor: 'pointer', 
                        border: mainImage === img.url ? '2px solid #1677ff' : '1px solid #eaeaea' 
                      }}
                      onClick={() => setMainImage(img.url)}
                    />
                  ))}
                </div>
              )}
            </Col>

            <Col xs={24} md={14}>
              <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8, color: '#1a1a1a' }}>
                {product.name}
              </h1>
              
              <Space style={{ marginBottom: 16, alignItems: 'center' }}>
                <Rate disabled defaultValue={product.averageRating} allowHalf style={{ fontSize: 16, color: '#fadb14' }} />
                <span style={{ color: '#64748b', fontSize: 15 }}>
                  {product.averageRating?.toFixed(1)} ({product.reviewCount} Đánh giá)
                </span>
              </Space>

              <div style={{ background: '#fafafa', padding: '16px 24px', borderRadius: 8, marginBottom: 24 }}>
                <div style={{ fontSize: 28, fontWeight: 700, color: '#e53935' }}>
                  {formatCurrency(displayPrice)}
                </div>
              </div>

              {product.variants && product.variants.length > 0 && (
                <div style={{ marginBottom: 24 }}>
                  <div style={{ marginBottom: 8, fontWeight: 600 }}>Chọn Phân loại:</div>
                  <Space wrap size={[12, 12]}>
                    {product.variants.map((v) => (
                      <Button 
                        key={v.variantId}
                        type={selectedVariant?.variantId === v.variantId ? 'primary' : 'default'}
                        onClick={() => setSelectedVariant(v)}
                        style={{ height: 'auto', padding: '6px 16px', borderRadius: 6 }}
                      >
                        {v.color} {v.size ? `- ${v.size}` : ''}
                      </Button>
                    ))}
                  </Space>
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
                <div style={{ fontWeight: 600 }}>Số lượng:</div>
                <InputNumber 
                  min={1} 
                  max={displayStock > 0 ? displayStock : 1} 
                  value={quantity} 
                  onChange={(val) => setQuantity(val)}
                  size="large"
                  disabled={isOutOfStock}
                />
                <span style={{ color: '#64748b' }}>{displayStock} sản phẩm có sẵn</span>
              </div>

              <Row gutter={16}>
                <Col span={12}>
                  <Button 
                    size="large" block 
                    icon={<ShoppingCartOutlined />} 
                    onClick={handleAddToCart}
                    disabled={isOutOfStock || (product.variants?.length > 0 && !selectedVariant)}
                    style={{ height: 54, borderRadius: 8, border: '1px solid #1677ff', color: '#1677ff', fontWeight: 600 }}
                  >
                    Thêm vào giỏ hàng
                  </Button>
                </Col>
                <Col span={12}>
                  <Button 
                    type="primary" size="large" block 
                    icon={<CreditCardOutlined />}
                    onClick={handleBuyNow}
                    disabled={isOutOfStock || (product.variants?.length > 0 && !selectedVariant)}
                    style={{ height: 54, borderRadius: 8, background: '#e53935', borderColor: '#e53935', fontWeight: 600 }}
                  >
                    {isOutOfStock ? 'Hết hàng' : 'Mua ngay'}
                  </Button>
                </Col>
              </Row>
            </Col>
          </Row>

          <Divider style={{ margin: '40px 0' }} />

          {/* MÔ TẢ */}
          <div style={{ marginBottom: 48 }}>
            <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>Mô tả sản phẩm</h3>
            <div 
              style={{ fontSize: 15, lineHeight: 1.8, color: '#334155', whiteSpace: 'pre-wrap' }}
              dangerouslySetInnerHTML={{ __html: product.description || 'Chưa có mô tả cho sản phẩm này.' }} 
            />
          </div>

          <Divider style={{ margin: '40px 0' }} />

          {/* DANH SÁCH ĐÁNH GIÁ */}
          <div>
            <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24 }}>
              Đánh giá sản phẩm ({product.reviewCount || 0})
            </h3>
            
            {product.reviews && product.reviews.length > 0 ? (
              <List
                itemLayout="horizontal"
                dataSource={product.reviews}
                renderItem={(item) => (
                  <List.Item style={{ padding: '20px 0' }}>
                    <List.Item.Meta
                      avatar={<Avatar icon={<UserOutlined />} size={40} />}
                      title={
                        <Space direction="vertical" size={2}>
                          <Text strong>{item.reviewerName}</Text>
                          <Rate disabled defaultValue={item.rating} style={{ fontSize: 14 }} />
                        </Space>
                      }
                      description={
                        <div style={{ marginTop: 8 }}>
                          <Space style={{ marginBottom: 8 }}>
                            <Text type="secondary" style={{ fontSize: 13 }}>{item.createdAt}</Text>
                            <Divider type="vertical" />
                            <Text type="secondary" style={{ fontSize: 13 }}>Phân loại: {item.color} - {item.size}</Text>
                          </Space>
                          <Paragraph style={{ color: '#1a1a1a', fontSize: 15, marginBottom: 0 }}>
                            {item.comment}
                          </Paragraph>
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}>
                Sản phẩm này chưa có đánh giá nào.
              </div>
            )}
          </div>
        </div>

        {/* KHU VỰC SẢN PHẨM LIÊN QUAN (MỚI THÊM) */}
        {relatedProducts && relatedProducts.length > 0 && (
          <div style={{ marginTop: 48, marginBottom: 24 }}>
            <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24, textAlign: 'center', color: '#1a1a1a' }}>
              SẢN PHẨM TƯƠNG TỰ
            </h3>
            <Row gutter={[24, 24]}>
              {relatedProducts.map(relProduct => (
                <Col xs={12} sm={12} md={8} lg={6} key={relProduct.productId || relProduct.id}>
                  {/* Tái sử dụng component ProductCard của bạn */}
                  <ProductCard product={relProduct} /> 
                </Col>
              ))}
            </Row>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetailPage;