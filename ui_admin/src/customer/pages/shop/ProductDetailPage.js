import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Row, Col, Button, InputNumber, Spin, Breadcrumb, message, Divider, Tag, Space } from 'antd';
import { HomeOutlined, ShoppingCartOutlined, CreditCardOutlined } from '@ant-design/icons';
import { shopProductService } from '../../services/shopProductService';
import useCart from '../../hooks/useCart';
import { formatCurrency } from '../../../shared/utils/formatters';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Trạng thái chọn mua
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [mainImage, setMainImage] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const data = await shopProductService.getById(id);
        
        // Chuẩn hóa dữ liệu trả về (hỗ trợ cả format cũ và mới)
        const productData = data?.data || data;
        setProduct(productData);
        
        // Cài đặt ảnh mặc định
        setMainImage(productData.primaryImageUrl || productData.image || 'https://placehold.co/600x600?text=No+Image');
        
        // Mặc định chọn biến thể đầu tiên nếu có
        if (productData.variants && productData.variants.length > 0) {
          setSelectedVariant(productData.variants[0]);
        }
      } catch (error) {
        console.error('Lỗi tải sản phẩm:', error);
        message.error('Không tìm thấy sản phẩm!');
        navigate('/shop');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, navigate]);

  const handleAddToCart = () => {
    if (!product) return;
    
    // Nếu sản phẩm có phân loại, bắt buộc phải chọn
    if (product.variants?.length > 0 && !selectedVariant) {
      message.warning('Vui lòng chọn phân loại hàng!');
      return;
    }

    // Gửi payload xuống Context Giỏ hàng
    addItem({
      productId: product.productId || product.id,
      variantId: selectedVariant?.variantId || selectedVariant?.id, // Gửi kèm variantId nếu BE hỗ trợ
      quantity: quantity
    });
  };

  const handleBuyNow = () => {
    handleAddToCart();
    // Đợi một chút để giỏ hàng cập nhật rồi chuyển sang trang Checkout
    setTimeout(() => {
      navigate('/checkout');
    }, 500);
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '100px 0' }}><Spin size="large" /></div>;
  }

  if (!product) return null;

  // Tính toán giá và kho hiển thị dựa trên biến thể đang chọn
  const displayPrice = selectedVariant?.price || product.price || 0;
  const displayStock = selectedVariant?.stockQuantity ?? product.totalStock ?? 0;
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
        <div style={{ background: '#fff', padding: 32, borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
          <Row gutter={[48, 32]}>
            {/* CỘT TRÁI: HÌNH ẢNH */}
            <Col xs={24} md={10}>
              <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid #eaeaea' }}>
                <img 
                  src={mainImage} 
                  alt={product.name} 
                  style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'cover', aspectRatio: '1/1' }} 
                />
              </div>
              {/* Nếu có nhiều ảnh, render danh sách thumbnail ở đây */}
              {product.imageUrls && product.imageUrls.length > 1 && (
                <div style={{ display: 'flex', gap: 12, marginTop: 16, overflowX: 'auto' }}>
                  {product.imageUrls.map((img, idx) => (
                    <img 
                      key={idx} src={img} alt={`thumb-${idx}`}
                      style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8, cursor: 'pointer', border: mainImage === img ? '2px solid #1677ff' : '1px solid #eaeaea' }}
                      onClick={() => setMainImage(img)}
                    />
                  ))}
                </div>
              )}
            </Col>

            {/* CỘT PHẢI: THÔNG TIN VÀ NÚT MUA */}
            <Col xs={24} md={14}>
              <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8, color: '#1a1a1a' }}>
                {product.name}
              </h1>
              
              <Space style={{ marginBottom: 16 }}>
                <span style={{ color: '#64748b' }}>Đã bán: <strong>{product.soldQuantity || 0}</strong></span>
                <Divider type="vertical" />
                <span style={{ color: '#64748b' }}>Đánh giá: ⭐ <strong>{product.averageRating || 'Chưa có'}</strong> ({product.reviewCount || 0})</span>
              </Space>

              <div style={{ background: '#fafafa', padding: '16px 24px', borderRadius: 8, marginBottom: 24 }}>
                <div style={{ fontSize: 28, fontWeight: 700, color: '#e53935' }}>
                  {formatCurrency(displayPrice)}
                </div>
              </div>

              {/* CHỌN BIẾN THỂ (MÀU SẮC / KÍCH THƯỚC) */}
              {product.variants && product.variants.length > 0 && (
                <div style={{ marginBottom: 24 }}>
                  <div style={{ marginBottom: 8, fontWeight: 600 }}>Chọn Phân loại:</div>
                  <Space wrap size={[12, 12]}>
                    {product.variants.map((v) => (
                      <Button 
                        key={v.variantId || v.id}
                        type={selectedVariant?.variantId === (v.variantId || v.id) ? 'primary' : 'default'}
                        onClick={() => setSelectedVariant(v)}
                        style={{ height: 'auto', padding: '6px 16px', borderRadius: 6 }}
                      >
                        {v.color} {v.size ? `- ${v.size}` : ''}
                      </Button>
                    ))}
                  </Space>
                </div>
              )}

              {/* CHỌN SỐ LƯỢNG */}
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

              {/* NÚT MUA HÀNG */}
              <Row gutter={16}>
                <Col span={12}>
                  <Button 
                    size="large" block 
                    icon={<ShoppingCartOutlined />} 
                    onClick={handleAddToCart}
                    disabled={isOutOfStock}
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
                    disabled={isOutOfStock}
                    style={{ height: 54, borderRadius: 8, background: '#e53935', borderColor: '#e53935', fontWeight: 600 }}
                  >
                    {isOutOfStock ? 'Hết hàng' : 'Mua ngay'}
                  </Button>
                </Col>
              </Row>
            </Col>
          </Row>

          <Divider style={{ margin: '40px 0' }} />

          {/* MÔ TẢ CHI TIẾT */}
          <div>
            <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>Mô tả sản phẩm</h3>
            <div 
              style={{ fontSize: 15, lineHeight: 1.8, color: '#334155', whiteSpace: 'pre-wrap' }}
              dangerouslySetInnerHTML={{ __html: product.description || 'Chưa có mô tả cho sản phẩm này.' }} 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;