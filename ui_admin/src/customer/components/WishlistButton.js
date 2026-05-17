// src/customer/components/WishlistButton.js
import React, { useState } from 'react';
import { Button, Tooltip, message } from 'antd';
import { HeartOutlined, HeartFilled } from '@ant-design/icons';
import { wishlistService } from '../services/wishlistService';
import useCustomerAuth from '../hooks/useCustomerAuth';
import { useNavigate } from 'react-router-dom';

/**
 * WishlistButton — toggle tim ❤️ yêu thích
 * Props:
 *   productId: number
 *   size: 'small' | 'middle' | 'large'
 *   showText: bool (hiển thị text cạnh icon)
 */
const WishlistButton = ({ productId, size = 'middle', showText = false }) => {
  const { isAuthenticated } = useCustomerAuth();
  const navigate = useNavigate();
  const [wishlisted, setWishlisted] = useState(
    () => wishlistService.isWishlisted(productId)
  );
  const [loading, setLoading] = useState(false);

  const handleToggle = async (e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      message.info('Vui lòng đăng nhập để thêm yêu thích');
      navigate('/login');
      return;
    }
    setLoading(true);
    try {
      const res = await wishlistService.toggle(productId);
      setWishlisted(res.wishlisted);
      message.success(res.wishlisted ? '❤️ Đã thêm vào yêu thích' : 'Đã xoá khỏi yêu thích');
    } catch {
      message.error('Có lỗi xảy ra, vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Tooltip title={wishlisted ? 'Bỏ yêu thích' : 'Thêm yêu thích'}>
      <Button
        type={wishlisted ? 'primary' : 'default'}
        size={size}
        loading={loading}
        icon={wishlisted ? <HeartFilled /> : <HeartOutlined />}
        onClick={handleToggle}
        danger={wishlisted}
        style={wishlisted ? { borderColor: '#ff4d4f' } : {}}
      >
        {showText && (wishlisted ? 'Đã yêu thích' : 'Yêu thích')}
      </Button>
    </Tooltip>
  );
};

export default WishlistButton;