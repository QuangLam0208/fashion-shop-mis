// src/customer/components/CategoryCard.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/landing.css';

/**
 * CategoryCard — card ảnh nền + tên overlay
 * Props:
 *   category: { category_id, name, image }
 *   onClick: optional override
 */
const CategoryCard = ({ category, onClick }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) onClick(category);
    else navigate(`/shop?category_id=${category.category_id}`);
  };

  const FALLBACK_EMOJIS = { 'Áo': '👕', 'Quần': '👖', 'Váy': '👗', 'Đầm': '👗' };
  const emoji = FALLBACK_EMOJIS[category.name] || '🛍️';

  return (
    <div className="category-card" onClick={handleClick} role="button" tabIndex={0}>
      {category.image ? (
        <img className="category-card__image" src={category.image} alt={category.name} loading="lazy" />
      ) : (
        <div
          className="category-card__image"
          style={{
            background: 'linear-gradient(135deg, #f5f0ea, #ede8e0)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 64,
          }}
        >
          {emoji}
        </div>
      )}
      <div className="category-card__overlay" />
      <div className="category-card__name">{category.name}</div>
    </div>
  );
};

export default CategoryCard;