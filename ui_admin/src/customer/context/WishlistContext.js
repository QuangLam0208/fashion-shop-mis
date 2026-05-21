import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import { wishlistService } from '../services/wishlistService';
import useCustomerAuth from '../hooks/useCustomerAuth';

const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
  const [wishlistIds, setWishlistIds] = useState([]);
  const { isAuthenticated } = useCustomerAuth() || {};

  // Hàm tự động tải danh sách Yêu thích từ Backend
  const loadWishlist = useCallback(async () => {
    if (!isAuthenticated) {
      setWishlistIds([]);
      return;
    }
    try {
      const res = await wishlistService.getWishlist();
      const data = Array.isArray(res) ? res : (res?.content || res?.data || []);
      
      // Rút trích ra một mảng chỉ chứa ID của các sản phẩm đã thả tim
      const ids = data.map(item => {
         const prod = item.product || item;
         return prod.productId ?? prod.id ?? prod.product_id ?? item.itemId;
      });
      setWishlistIds(ids);
    } catch (error) {
      console.error("Lỗi tải wishlist:", error);
    }
  }, [isAuthenticated]);

  // Tự động chạy khi mở web hoặc đăng nhập
  useEffect(() => {
    loadWishlist();
  }, [loadWishlist]);

  // Hàm xử lý khi bấm thả/bỏ tim
  const toggleWishlist = async (productId) => {
    try {
      const res = await wishlistService.toggle(productId);
      
      // Cập nhật lại mảng ID trên giao diện ngay lập tức
      const newStatus = res?.wishlisted !== undefined ? res.wishlisted : !wishlistIds.includes(productId);
      setWishlistIds(prev => 
        newStatus ? [...prev, productId] : prev.filter(id => id !== productId)
      );
      
      return newStatus;
    } catch (error) {
      throw error;
    }
  };

  // Hàm kiểm tra 1 sản phẩm có được thả tim không
  const isWishlisted = (productId) => wishlistIds.includes(productId);

  return (
    <WishlistContext.Provider value={{ wishlistIds, toggleWishlist, isWishlisted, loadWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

// Hook tiện ích để gọi nhanh
export const useWishlist = () => useContext(WishlistContext);