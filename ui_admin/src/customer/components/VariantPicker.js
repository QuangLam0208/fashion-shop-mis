// src/customer/components/VariantPicker.js
import React from 'react';
import { Tooltip } from 'antd';
import '../styles/product.css';

/**
 * VariantPicker — chọn màu + size
 * Props:
 *   variants: [{ variant_id, color, size, price, stock_quantity }]
 *   selectedColor: string
 *   selectedSize: string
 *   onColorChange: (color) => void
 *   onSizeChange: (size) => void
 */
const COLOR_MAP = {
  Trắng: '#FFFFFF', Đen: '#1a1a1a', Đỏ: '#E53935', Xanh: '#1E88E5',
  'Xanh lá': '#43A047', Vàng: '#FDD835', Hồng: '#E91E63',
  Xám: '#9E9E9E', Be: '#D7CCC8', Nâu: '#795548', 'Xanh navy': '#1a237e',
  Cam: '#FB8C00',
};

const VariantPicker = ({
  variants = [],
  selectedColor,
  selectedSize,
  onColorChange,
  onSizeChange,
}) => {
  // Lấy danh sách màu unique
  const colors = [...new Set(variants.map((v) => v.color))];

  // Lấy sizes khả dụng theo màu đang chọn
  const sizesForColor = variants
    .filter((v) => !selectedColor || v.color === selectedColor)
    .map((v) => v.size);

  const allSizes = [...new Set(variants.map((v) => v.size))];

  // Variant hiện tại
  const currentVariant = variants.find(
    (v) => v.color === selectedColor && v.size === selectedSize
  );

  return (
    <div>
      {/* Màu sắc */}
      {colors.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div className="variant-picker__label">
            Màu sắc
            {selectedColor && (
              <span style={{ fontWeight: 400, textTransform: 'none', color: '#666', marginLeft: 8 }}>
                — {selectedColor}
              </span>
            )}
          </div>
          <div className="variant-picker__colors">
            {colors.map((color) => {
              const hex = COLOR_MAP[color] || '#ccc';
              const isWhite = hex === '#FFFFFF';
              return (
                <Tooltip key={color} title={color}>
                  <button
                    className={`variant-color-btn ${selectedColor === color ? 'active' : ''}`}
                    style={{
                      background: hex,
                      border: isWhite ? '1.5px solid #ddd' : undefined,
                    }}
                    onClick={() => onColorChange(color)}
                    aria-label={color}
                  />
                </Tooltip>
              );
            })}
          </div>
        </div>
      )}

      {/* Kích thước */}
      {allSizes.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div className="variant-picker__label">Kích thước</div>
          <div className="variant-picker__sizes">
            {allSizes.map((size) => {
              const available = sizesForColor.includes(size);
              const isSelected = selectedSize === size;
              return (
                <button
                  key={size}
                  className={`variant-size-btn ${isSelected ? 'active' : ''} ${!available ? 'disabled' : ''}`}
                  onClick={() => available && onSizeChange(size)}
                  disabled={!available}
                  title={!available ? 'Hết hàng' : ''}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Tồn kho */}
      {currentVariant && (
        <div style={{ fontSize: 13, color: currentVariant.stock_quantity > 0 ? '#52c41a' : '#ff4d4f' }}>
          {currentVariant.stock_quantity > 0
            ? `Còn ${currentVariant.stock_quantity} sản phẩm`
            : 'Hết hàng'}
        </div>
      )}
    </div>
  );
};

export default VariantPicker;