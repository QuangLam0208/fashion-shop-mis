import { HeartFilled, HeartOutlined, ShoppingCartOutlined, StarFilled } from '@ant-design/icons';
import { Tooltip, message } from 'antd';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { formatCurrency } from '../../shared/utils/formatters';
import useCustomerAuth from '../hooks/useCustomerAuth';
import { wishlistService } from '../services/wishlistService';
import '../styles/product.css';

// 🌟 Bổ sung initialWishlisted và onWishlistChange vào tham số (props)
const ProductCard = ({ product, showActions = true, initialWishlisted, onWishlistChange }) => {
  const { isAuthenticated } = useCustomerAuth();
  const navigate  = useNavigate();
  const location = useLocation();

  const requireLogin = () => {
    message.warning('Vui lòng đăng nhập để thực hiện chức năng này!');
    navigate('/login', { state: { from: location } });
  };
  
  // ĐỒNG BỘ CÁC BIẾN VỚI API TRẢ VỀ TỪ SPRING BOOT
  const productId = product.productId ?? product.product_id;
  const price = product.price ?? product.base_price ?? 0;
  const imageUrl = product.primaryImageUrl ?? product.images?.[0] ?? 'https://placehold.co/300x400?text=No+Image';
  const categoryName = product.category ?? product.category_name;
  const rating = product.averageRating ?? product.rating;
  const reviewCount = product.reviewCount ?? product.review_count ?? 0;
  
  // 🌟 SỬA STATE: Ưu tiên lấy trạng thái từ Cha truyền xuống (nếu có), nếu không có mới dùng mặc định
  const [wishlisted, setWishlisted] = useState(
    () => initialWishlisted !== undefined ? initialWishlisted : wishlistService.isWishlisted(productId)
  );

  // Logic tính chiết khấu (nếu API sau này hỗ trợ truyền giá cũ gốc xuống)
  const discount = product.is_sale && product.base_price > product.sale_price
    ? Math.round(((product.base_price - product.sale_price) / product.base_price) * 100)
    : null;

  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (!isAuthenticated) return requireLogin();
    // Chuyển hướng tới trang chi tiết để chọn size/màu
    navigate(`/shop/${productId}`);
  };

  const handleWishlist = async (e) => {
    e.stopPropagation();
    if (!isAuthenticated) return requireLogin();
    try {
      const res = await wishlistService.toggle(productId);
      
      // Xử lý linh hoạt trường hợp Backend không trả về trạng thái mới
      const newStatus = res?.wishlisted !== undefined ? res.wishlisted : !wishlisted;
      
      setWishlisted(newStatus);
      message.success(newStatus ? 'Đã thêm vào yêu thích' : 'Đã xoá khỏi yêu thích');
      
      // 🌟 BÁO CÁO LÊN COMPONENT CHA LÀ TRẠNG THÁI ĐÃ THAY ĐỔI ĐỂ CHA TỰ XÓA KHỎI MÀN HÌNH
      if (onWishlistChange) {
        onWishlistChange(productId, newStatus);
      }
    } catch {
      message.error('Lỗi khi thao tác yêu thích');
    }
  };

  return (
    <div className="product-card" onClick={() => navigate(`/shop/${productId}`)}>
      {discount && <span className="c-badge-sale">-{discount}%</span>}

      <div className="product-card__image-wrap">
        <img
          className="product-card__image"
          src={imageUrl}
          alt={product.name}
          loading="lazy"
        />

        {showActions && (
          <div className="product-card__actions">
            <button className="product-card__add-btn" onClick={handleAddToCart}>
              <ShoppingCartOutlined style={{ marginRight: 6 }} />
              Chọn mua
            </button>
            <Tooltip title={wishlisted ? 'Bỏ yêu thích' : 'Thêm yêu thích'}>
              <button
                onClick={handleWishlist}
                style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: 'rgba(255,255,255,0.9)',
                  border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: wishlisted ? '#e53935' : '#666',
                  fontSize: 16, flexShrink: 0,
                  transition: 'all 0.2s',
                }}
              >
                {wishlisted ? <HeartFilled /> : <HeartOutlined />}
              </button>
            </Tooltip>
          </div>
        )}
      </div>

      <div className="product-card__body">
        {categoryName && (
          <div className="product-card__category">{categoryName}</div>
        )}
        <div className="product-card__name" title={product.name}>
          {product.name}
        </div>
        <div className="product-card__price-row">
          {product.is_sale && product.base_price > product.sale_price && (
            <span className="c-price-original">{formatCurrency(product.base_price)}</span>
          )}
          <span className="c-price">{formatCurrency(price)}</span>
        </div>
        {rating > 0 && (
          <div className="product-card__rating">
            <StarFilled className="product-card__star" />
            <span>{rating}</span>
            <span>({reviewCount})</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;