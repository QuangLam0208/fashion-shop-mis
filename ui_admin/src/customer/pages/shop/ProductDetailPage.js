import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Row, Col, Button, InputNumber, Spin, Breadcrumb, message, Divider, Space, Rate, Avatar, List, Typography, Image, Pagination } from 'antd';
import { HomeOutlined, ShoppingCartOutlined, CreditCardOutlined, UserOutlined } from '@ant-design/icons';
import { shopProductService } from '../../services/shopProductService';
import { reviewService } from '../../services/reviewService';
import useCart from '../../hooks/useCart';
import { formatCurrency, formatDateTime } from '../../../shared/utils/formatters';
import ProductCard from '../../components/ProductCard';
import QuantityInput from '../../components/QuantityInput';

const { Text, Paragraph } = Typography;

// Hàm ẩn danh tên người dùng (VD: Kim Triệu -> K***u)
const maskUsername = (name) => {
  if (!name) return 'A***n';
  if (name.length <= 2) return name + '***';
  return name.charAt(0) + '***' + name.charAt(name.length - 1);
};

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [mainImage, setMainImage] = useState('');

  // === REVIEW STATES (US-41) ===
  const [reviewsData, setReviewsData] = useState([]);
  const [reviewPage, setReviewPage] = useState(1);
  const [reviewTotal, setReviewTotal] = useState(0);
  const [reviewSummary, setReviewSummary] = useState({ averageRating: 0, totalReviews: 0 });
  const [loadingReviews, setLoadingReviews] = useState(false);
  const reviewsRef = useRef(null); // Ref để scroll

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const fetchProductAndRelated = async () => {
      setLoading(true);
      try {
        const data = await shopProductService.getById(id);
        const productData = data?.data || data;
        setProduct(productData);
        setMainImage(productData.mainImage || 'https://placehold.co/600x600?text=No+Image');
        
        if (productData.variants && productData.variants.length > 0) {
          setSelectedVariant(productData.variants[0]);
        }

        try {
          const relatedData = await shopProductService.getRelated(id, 4);
          setRelatedProducts(relatedData?.data || relatedData || []);
        } catch (relError) {
          setRelatedProducts([]);
        }

      } catch (error) {
        message.error(error.response?.data?.message || 'Không tìm thấy sản phẩm!');
        navigate('/shop');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProductAndRelated();
    setQuantity(1);
  }, [id, navigate]);

  // === EFFECT: FETCH REVIEWS KHI ID HOẶC PAGE THAY ĐỔI ===
  useEffect(() => {
    fetchReviews(reviewPage);
  }, [id, reviewPage]);

  const fetchReviews = async (page) => {
    setLoadingReviews(true);
    try {
      // AC-US41-01 & AC-US41-02
      const res = await reviewService.getByProduct(id, {
        page: page - 1,
        size: 5,
        sort: 'createdAt,desc'
      });
      
      const responseData = res?.data || res;
      setReviewsData(responseData.reviews?.content || []); 
      setReviewTotal(responseData.reviews?.totalElements || 0); 
      
      setReviewSummary({
        averageRating: responseData.averageRating || 0,
        totalReviews: responseData.totalReviews || 0
      });
    } catch (error) {
      console.error('Không tải được đánh giá', error);
    } finally {
      setLoadingReviews(false);
    }
  };

  const handleReviewPageChange = (page) => {
    setReviewPage(page);
    // AC-FE-US41-02: Cuộn mượt mà về đầu khu vực đánh giá
    if (reviewsRef.current) {
      const offsetTop = reviewsRef.current.offsetTop - 80; // Trừ hao header
      window.scrollTo({ top: offsetTop, behavior: 'smooth' });
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    if (product.variants?.length > 0 && !selectedVariant) {
      message.warning('Vui lòng chọn phân loại hàng!');
      return;
    }
    const finalQuantity = quantity || 1;
    if (finalQuantity > displayStock) {
      message.error(`Số lượng vượt quá tồn kho! Phân loại này chỉ còn ${displayStock} sản phẩm.`);
      return;
    }
    addItem({ variantId: selectedVariant?.variantId, quantity: finalQuantity });
  };

  const handleBuyNow = () => {
    handleAddToCart();
    setTimeout(() => navigate('/checkout'), 500);
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '100px 0' }}><Spin size="large" /></div>;
  if (!product) return null;

  const displayPrice = selectedVariant?.price || product.price || product.minPrice || 0;
  const displayStock = selectedVariant ? selectedVariant.stockQuantity : (product.variants?.reduce((sum, v) => sum + v.stockQuantity, 0) || 0);
  const isOutOfStock = displayStock <= 0 || product.status === 'OUT_OF_STOCK';

  return (
    <div style={{ backgroundColor: '#f9fafb', minHeight: '100vh', paddingBottom: 60 }}>
      {/* ... (Phần Breadcrumb và Header giữ nguyên) ... */}
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
          {/* ... (Phần Thông tin SP chính giữ nguyên) ... */}
          <Row gutter={[48, 32]}>
            <Col xs={24} md={10}>
              <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid #eaeaea' }}>
                <img src={mainImage} alt={product.name} style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'cover', aspectRatio: '1/1' }} />
              </div>
              {product.images && product.images.length > 1 && (
                <div style={{ display: 'flex', gap: 12, marginTop: 16, overflowX: 'auto' }}>
                  {product.images.map((img) => (
                    <img key={img.imageId} src={img.url} alt="thumb"
                      style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8, cursor: 'pointer', border: mainImage === img.url ? '2px solid #1677ff' : '1px solid #eaeaea' }}
                      onClick={() => setMainImage(img.url)}
                    />
                  ))}
                </div>
              )}
            </Col>

            <Col xs={24} md={14}>
              <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8, color: '#1a1a1a' }}>{product.name}</h1>
              
              <Space style={{ marginBottom: 16, alignItems: 'center' }}>
                <Rate disabled value={reviewSummary.averageRating} allowHalf style={{ fontSize: 16, color: '#fadb14' }} />
                <span style={{ color: '#64748b', fontSize: 15 }}>
                  {reviewSummary.averageRating?.toFixed(1)} ({reviewSummary.totalReviews} Đánh giá)
                </span>
              </Space>

              <div style={{ background: '#fafafa', padding: '16px 24px', borderRadius: 8, marginBottom: 24 }}>
                <div style={{ fontSize: 28, fontWeight: 700, color: '#e53935' }}>{formatCurrency(displayPrice)}</div>
              </div>

              {product.variants && product.variants.length > 0 && (
                <div style={{ marginBottom: 24 }}>
                  <div style={{ marginBottom: 8, fontWeight: 600 }}>Chọn Phân loại:</div>
                  <Space wrap size={[12, 12]}>
                    {product.variants.map((v) => (
                      <Button key={v.variantId} type={selectedVariant?.variantId === v.variantId ? 'primary' : 'default'} onClick={() => setSelectedVariant(v)} style={{ height: 'auto', padding: '6px 16px', borderRadius: 6 }}>
                        {v.color} {v.size ? `- ${v.size}` : ''}
                      </Button>
                    ))}
                  </Space>
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
                <div style={{ fontWeight: 600 }}>Số lượng:</div>
                <QuantityInput value={quantity} onChange={(val) => setQuantity(val)} min={1} max={selectedVariant.stockQuantity} />
                <span style={{ color: '#64748b' }}>{displayStock} sản phẩm có sẵn</span>
              </div>

              <Row gutter={16}>
                <Col span={12}>
                  <Button size="large" block icon={<ShoppingCartOutlined />} onClick={handleAddToCart} disabled={isOutOfStock || (product.variants?.length > 0 && !selectedVariant)} style={{ height: 54, borderRadius: 8, border: '1px solid #1677ff', color: '#1677ff', fontWeight: 600 }}>
                    Thêm vào giỏ hàng
                  </Button>
                </Col>
                <Col span={12}>
                  <Button type="primary" size="large" block icon={<CreditCardOutlined />} onClick={handleBuyNow} disabled={isOutOfStock || (product.variants?.length > 0 && !selectedVariant)} style={{ height: 54, borderRadius: 8, background: '#e53935', borderColor: '#e53935', fontWeight: 600 }}>
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
            <div style={{ fontSize: 15, lineHeight: 1.8, color: '#334155', whiteSpace: 'pre-wrap' }} dangerouslySetInnerHTML={{ __html: product.description || 'Chưa có mô tả cho sản phẩm này.' }} />
          </div>

          <Divider style={{ margin: '40px 0' }} />

          {/* === DANH SÁCH ĐÁNH GIÁ TỪ API (US-41) === */}
          <div ref={reviewsRef}>
            <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24 }}>Đánh giá từ khách hàng</h3>
            
            {/* AC-US41-02: Khối thống kê tổng quát */}
            <div style={{ display: 'flex', alignItems: 'center', background: '#fffbf0', padding: 24, borderRadius: 8, marginBottom: 24, border: '1px solid #ffe58f' }}>
              <div style={{ textAlign: 'center', marginRight: 48 }}>
                <div style={{ fontSize: 36, color: '#fadb14', fontWeight: 700, lineHeight: 1 }}>
                  {reviewSummary.averageRating?.toFixed(1)} <span style={{ fontSize: 20, color: '#1a1a1a' }}>/ 5</span>
                </div>
                <Rate disabled allowHalf value={reviewSummary.averageRating} style={{ fontSize: 20, color: '#fadb14', marginTop: 8 }} />
                <div style={{ marginTop: 8, color: '#666' }}>{reviewSummary.totalReviews} Lượt đánh giá</div>
              </div>
            </div>

            {loadingReviews ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}><Spin /></div>
            ) : reviewsData.length > 0 ? (
              <>
                <List
                  itemLayout="horizontal"
                  dataSource={reviewsData}
                  renderItem={(item) => (
                    <List.Item style={{ padding: '24px 0', borderBottom: '1px solid #f0f0f0' }}>
                      <List.Item.Meta
                        avatar={<Avatar icon={<UserOutlined />} size={44} style={{ backgroundColor: '#bfbfbf' }} />}
                        title={
                          <Space direction="vertical" size={2}>
                            <Text strong>{maskUsername(item.customerName || item.reviewerName)}</Text>
                            <Rate disabled value={item.rating} style={{ fontSize: 13, color: '#fadb14' }} />
                          </Space>
                        }
                        description={
                          <div style={{ marginTop: 12 }}>
                            <Space style={{ marginBottom: 12 }}>
                              <Text type="secondary" style={{ fontSize: 13 }}>{item.createdAt}</Text>
                            </Space>
                            <Paragraph style={{ color: '#1a1a1a', fontSize: 15, marginBottom: 16 }}>
                              {item.comment}
                            </Paragraph>

                            {/* AC-US41-03: Render ảnh đính kèm có Popup */}
                            {item.imageUrls && item.imageUrls.length > 0 && (
                              <Image.PreviewGroup>
                                <Space wrap>
                                  {item.imageUrls.map((url, idx) => (
                                    <Image
                                      key={idx}
                                      width={72}
                                      height={72}
                                      src={url}
                                      style={{ objectFit: 'cover', borderRadius: 8, cursor: 'zoom-in', border: '1px solid #f0f0f0' }}
                                    />
                                  ))}
                                </Space>
                              </Image.PreviewGroup>
                            )}
                          </div>
                        }
                      />
                    </List.Item>
                  )}
                />
                
                {/* AC-FE-US41-02: Phân trang */}
                <div style={{ textAlign: 'center', marginTop: 32 }}>
                  <Pagination 
                    current={reviewPage} 
                    pageSize={5} 
                    total={reviewTotal} 
                    onChange={handleReviewPageChange} 
                    showSizeChanger={false}
                  />
                </div>
              </>
            ) : (
              // AC-FE-US41-01: Empty State
              <div style={{ textAlign: 'center', padding: '60px 0', background: '#fafafa', borderRadius: 8 }}>
                <Text style={{ fontSize: 16, color: '#888' }}>
                  Sản phẩm này chưa có đánh giá. Hãy là người đầu tiên mua và chia sẻ trải nghiệm!
                </Text>
              </div>
            )}
          </div>
        </div>

        {/* SẢN PHẨM LIÊN QUAN */}
        {relatedProducts && relatedProducts.length > 0 && (
          <div style={{ marginTop: 48, marginBottom: 24 }}>
            <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24, textAlign: 'center', color: '#1a1a1a' }}>
              SẢN PHẨM TƯƠNG TỰ
            </h3>
            <Row gutter={[24, 24]}>
              {relatedProducts.map(relProduct => (
                <Col xs={12} sm={12} md={8} lg={6} key={relProduct.productId || relProduct.id}>
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