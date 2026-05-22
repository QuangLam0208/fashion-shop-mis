import { HeartFilled, HeartOutlined, ShoppingCartOutlined, StarFilled } from '@ant-design/icons';
import { Tooltip, message } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import { formatCurrency } from '../../shared/utils/formatters';
import useCustomerAuth from '../hooks/useCustomerAuth';
import { useWishlist } from '../context/WishlistContext'; // 🌟 KẾT NỐI VỚI BỘ NHỚ WISHLIST
import '../styles/product.css';

const ProductCard = ({ product, showActions = true, initialWishlisted, onWishlistChange }) => {
  const { isAuthenticated } = useCustomerAuth();
  const navigate  = useNavigate();
  const location = useLocation();
  
  // Lấy hàm kiểm tra và thả tim từ Context
  const { isWishlisted, toggleWishlist } = useWishlist() || {};

  const requireLogin = () => {
    message.warning('Vui lòng đăng nhập để thực hiện chức năng này!');
    navigate('/login', { state: { from: location } });
  };
  
  const productId = product.productId ?? product.product_id;
  const price = product.price ?? product.base_price ?? 0;
  const imageUrl = product.primaryImageUrl ?? product.images?.[0] ?? 'https://placehold.co/300x400?text=No+Image';
  const categoryName = product.category ?? product.category_name;
  const rating = product.averageRating ?? product.rating;
  const reviewCount = product.reviewCount ?? product.review_count ?? 0;
  
  // 🌟 TRẠNG THÁI TIM (Tự động đỏ nếu ID sản phẩm nằm trong bộ nhớ Context)
  const currentWishlistState = initialWishlisted !== undefined 
    ? initialWishlisted 
    : (isWishlisted ? isWishlisted(productId) : false);

  const discount = product.is_sale && product.base_price > product.sale_price
    ? Math.round(((product.base_price - product.sale_price) / product.base_price) * 100)
    : null;

  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (!isAuthenticated) return requireLogin();
    navigate(`/shop/${productId}`);
  };

  const handleWishlist = async (e) => {
    e.stopPropagation();
    if (!isAuthenticated) return requireLogin();
    try {
      let newStatus = false;
      if (toggleWishlist) {
        newStatus = await toggleWishlist(productId); // Gửi API qua Context
      }
      message.success(newStatus ? 'Đã thêm vào yêu thích' : 'Đã xoá khỏi yêu thích');
      
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
        <img className="product-card__image" src={imageUrl} alt={product.name} loading="lazy" />

        {showActions && (
          <div className="product-card__actions">
            <button className="product-card__add-btn" onClick={handleAddToCart}>
              <ShoppingCartOutlined style={{ marginRight: 6 }} /> Chọn mua
            </button>
            <Tooltip title={currentWishlistState ? 'Bỏ yêu thích' : 'Thêm yêu thích'}>
              <button
                onClick={handleWishlist}
                style={{
                  width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.9)',
                  border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: currentWishlistState ? '#e53935' : '#666', fontSize: 16, flexShrink: 0, transition: 'all 0.2s',
                }}
              >
                {currentWishlistState ? <HeartFilled /> : <HeartOutlined />}
              </button>
            </Tooltip>
          </div>
        )}
      </div>

      <div className="product-card__body">
        {categoryName && <div className="product-card__category">{categoryName}</div>}
        <div className="product-card__name" title={product.name}>{product.name}</div>
        <div className="product-card__price-row">
          {product.is_sale && product.base_price > product.sale_price && (
            <span className="c-price-original">{formatCurrency(product.base_price)}</span>
          )}
          <span className="c-price">{formatCurrency(price)}</span>
        </div>
        {rating > 0 && (
          <div className="product-card__rating">
            <StarFilled className="product-card__star" />
            <span>{rating} ({reviewCount})</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;