import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * CategoryCard — Thiết kế tối giản, thanh lịch chỉ hiển thị chữ và icon tượng trưng.
 * Phù hợp với dữ liệu không chứa liên kết hình ảnh.
 */
const CategoryCard = ({ category, onClick }) => {
  const navigate = useNavigate();
  
  // Hỗ trợ linh hoạt cả id (API thật) lẫn category_id (Mock)
  const categoryId = category.id ?? category.category_id;

  const handleClick = () => {
    if (onClick) onClick(category);
    else navigate(`/shop?category_id=${categoryId}`);
  };

  // Ánh xạ từ khóa trong tên để tự động hiển thị Emoji tương ứng cho sinh động
  const FALLBACK_EMOJIS = { 
    'Áo': '👕', 
    'Quần': '👖', 
    'Váy': '👗', 
    'Đầm': '👗', 
    'Phụ kiện': '👜', 
    'Giày': '👟', 
    'Túi': '👜' 
  };
  
  // Hàm tìm emoji phù hợp (ví dụ tên "Áo Sơ Mi" chứa chữ "Áo" -> lấy 👕)
  const getEmoji = (name = '') => {
    for (const key in FALLBACK_EMOJIS) {
      if (name.toLowerCase().includes(key.toLowerCase())) {
        return FALLBACK_EMOJIS[key];
      }
    }
    return '🛍️'; // Mặc định nếu không tìm thấy từ khóa
  };

  return (
    <div
      // onClick={handleClick}
      role="button"
      tabIndex={0}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        padding: '14px 24px',
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '10px',
        cursor: 'pointer',
        transition: 'all 0.2s ease-in-out',
        boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
        userSelect: 'none'
      }}
      // Hiệu ứng Hover tương tác đổi màu đen quý phái phong cách Fashion
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = '#1a1a1a';
        e.currentTarget.style.background = '#1a1a1a';
        e.currentTarget.style.color = '#ffffff';
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = '#e2e8f0';
        e.currentTarget.style.background = '#ffffff';
        e.currentTarget.style.color = 'inherit';
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.02)';
      }}
    >
      <span style={{ fontSize: '18px' }}>{getEmoji(category.name)}</span>
      <span style={{ fontWeight: '600', fontSize: '14px', letterSpacing: '0.3px' }}>
        {category.name}
      </span>
    </div>
  );
};

export default CategoryCard;