import React from 'react';
import { Button, InputNumber, Space } from 'antd';
import { MinusOutlined, PlusOutlined } from '@ant-design/icons';

const QuantityInput = ({ 
  value = 1, 
  onChange, 
  min = 1, 
  max, // Có thể truyền tồn kho vào đây
  disabled = false 
}) => {

  const handleDecrease = () => {
    if (value > min) {
      onChange(value - 1);
    }
  };

  const handleIncrease = () => {
    if (max === undefined || value < max) {
      onChange(value + 1);
    }
  };

  return (
    <Space.Compact style={{ display: 'inline-flex' }}>
      <Button 
        icon={<MinusOutlined />} 
        onClick={handleDecrease} 
        disabled={disabled || value <= min}
        style={{ width: 36, display: 'flex', justifyContent: 'center', alignItems: 'center' }}
      />
      <InputNumber
        min={min}
        max={max}
        value={value}
        onChange={(val) => {
          // Xử lý khi người dùng xóa trắng ô input, tự động set về min
          if (val === null || val === '') {
            onChange(min);
          } else {
            onChange(val);
          }
        }}
        controls={false} // Quan trọng: Ẩn 2 mũi tên mặc định của InputNumber
        disabled={disabled}
        style={{ 
          width: 50, 
          textAlign: 'center', // Căn giữa số lượng
          display: 'flex', 
          justifyContent: 'center' 
        }}
        // Dùng CSS nội bộ để ép text ra giữa (nếu InputNumber của antd bị lệch)
        className="custom-quantity-input"
      />
      <Button 
        icon={<PlusOutlined />} 
        onClick={handleIncrease} 
        disabled={disabled || (max !== undefined && value >= max)}
        style={{ width: 36, display: 'flex', justifyContent: 'center', alignItems: 'center' }}
      />
    </Space.Compact>
  );
};

export default QuantityInput;