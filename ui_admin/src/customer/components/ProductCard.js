// src/customer/components/ProductCard.js
import { HeartFilled, HeartOutlined, ShoppingCartOutlined, StarFilled } from '@ant-design/icons';
import { Tooltip, message } from 'antd';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { formatCurrency } from '../../shared/utils/formatters';
import useCart from '../hooks/useCart';
import useCustomerAuth from '../hooks/useCustomerAuth';
import { wishlistService } from '../services/wishlistService';
import '../styles/product.css';

/**
 * ProductCard — hiển thị 1 sản phẩm trong lưới
 * Props:
 *   product: { product_id, name, images[], base_price, sale_price, is_sale, rating, review_count, category_name }
 *   showActions: bool (default true) — hiển thị nút thêm giỏ / wishlist
 */
const ProductCard = ({ product, showActions = true }) => {
  const { isAuthenticated } = useCustomerAuth();
  const navigate  = useNavigate();
  const { addItem } = useCart();
  const location = useLocation();

  const requireLogin = () => {
    message.warning('Vui lòng đăng nhập để thực hiện chức năng này!');
    // Chuyển hướng tới login, truyền theo state 'from' để đăng nhập xong quay lại đây
    navigate('/login', { state: { from: location } });
  };
  
  const [wishlisted, setWishlisted] = useState(
    () => wishlistService.isWishlisted(product.product_id)
  );

  const price    = product.sale_price || product.base_price;
  const discount = product.is_sale && product.base_price > product.sale_price
    ? Math.round(((product.base_price - product.sale_price) / product.base_price) * 100)
    : null;

  const handleAddToCart = (e) => {
    e.stopPropagation();
    // Thêm vào cart với variant đầu tiên (nếu chưa chọn variant, điều hướng vào detail)
    if (!isAuthenticated) return requireLogin();
    navigate(`/shop/${product.product_id}`);
  };

  const handleWishlist = async (e) => {
    e.stopPropagation();
    if (!isAuthenticated) return requireLogin();
    const res = await wishlistService.toggle(product.product_id);
    setWishlisted(res.wishlisted);
    message.success(res.wishlisted ? 'Đã thêm vào yêu thích' : 'Đã xoá khỏi yêu thích');
  };

  return (
    <div className="product-card" onClick={() => navigate(`/shop/${product.product_id}`)}>
      {/* Badge Sale */}
      {discount && <span className="c-badge-sale">-{discount}%</span>}

      {/* Image */}
      <div className="product-card__image-wrap">
        <img
          className="product-card__image"
          src={product.images?.[0] || 'https://via.placeholder.com/300x400?text=No+Image'}
          alt={product.name}
          loading="lazy"
        />

        {/* Hover actions */}
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

      {/* Info */}
      <div className="product-card__body">
        {product.category_name && (
          <div className="product-card__category">{product.category_name}</div>
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
        {product.rating > 0 && (
          <div className="product-card__rating">
            <StarFilled className="product-card__star" />
            <span>{product.rating}</span>
            <span>({product.review_count || 0})</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;