import React, { createContext, useState, useEffect, useCallback } from 'react';
import { cartService } from '../services/cartService';
import useCustomerAuth from '../hooks/useCustomerAuth';
import { message } from 'antd';

export const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalPrice, setTotalPrice] = useState(0);
  
  // Lấy trạng thái đăng nhập từ Hook
  const { isAuthenticated } = useCustomerAuth() || {}; 

  // 1. HÀM TẢI GIỎ HÀNG TỪ SERVER BACKEND
  const loadCart = useCallback(async () => {
    if (!isAuthenticated) {
      setItems([]);
      setTotalPrice(0);
      return;
    }
    setLoading(true);
    try {
      const data = await cartService.getCart();
      
      // Lấy danh sách items
      setItems(Array.isArray(data) ? data : (data?.content || data?.items || []));
      
      // SỬA LỖI 1: Lấy trực tiếp totalAmount từ Backend thay vì tự tính
      if (data && data.totalAmount !== undefined) {
         setTotalPrice(data.totalAmount);
      } else {
         // Fallback nếu backend chưa trả totalAmount thì mới tự tính
         const fallbackItems = Array.isArray(data) ? data : (data?.content || data?.items || []);
         setTotalPrice(fallbackItems.reduce((s, i) => s + ((i.price || 0) * (i.quantity || 0)), 0));
      }
    } catch (error) {
      message.error("Lỗi tải giỏ hàng: " + (error?.response?.data?.message || 'Vui lòng thử lại!'));
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  // 2. TỰ ĐỘNG TÍNH TOÁN TỔNG SỐ LƯỢNG VÀ TỔNG TIỀN
  const totalItems = items.reduce((s, i) => s + (i.quantity || 0), 0);

  // 3. HÀM THÊM SẢN PHẨM VÀO GIỎ HÀNG 
  const addItem = useCallback(async (productProps) => {
    if (!isAuthenticated) {
      message.warning('Vui lòng đăng nhập để mua hàng!');
      return;
    }
    try {
      const variantId = productProps.variantId ?? productProps.variant_id;
      const quantity = productProps.quantity ?? 1;
      
      if (!variantId) {
        message.warning("Vui lòng chọn phân loại (Size/Màu) trước khi thêm!");
        return;
      }

      await cartService.addItem({ variantId, quantity });
      
      message.success('Đã thêm sản phẩm vào giỏ hàng thành công 🛒');
      await loadCart(); 
    } catch (error) {
      const errorMsg = error?.response?.data?.errors?.variantId 
                    || error?.response?.data?.message 
                    || 'Không thể thêm sản phẩm vào giỏ hàng';
      message.error(`Lỗi: ${errorMsg}`);
    }
  }, [isAuthenticated, loadCart]);

  // 4. HÀM CẬP NHẬT SỐ LƯỢNG SẢN PHẨM 
  const updateQuantity = useCallback(async (cartItemId, quantity) => {
    if (quantity < 1) return;
    try {
      await cartService.updateQuantity(cartItemId, quantity);
      await loadCart(); 
    } catch (error) {
      const errorMsg = error?.response?.data?.message || 'Cập nhật số lượng thất bại';
      message.error(errorMsg);
    }
  }, [loadCart]);

  // 5. HÀM XÓA SẢN PHẨM KHỎI GIỎ HÀNG
  const removeItem = useCallback(async (itemId) => {
    try {
      await cartService.removeItem(itemId);
      message.success('Đã xóa sản phẩm khỏi giỏ hàng');
      await loadCart(); 
    } catch (error) {
      message.error('Không thể xóa sản phẩm này');
    }
  }, [loadCart]);

  // 6. HÀM LÀM SẠCH GIỎ HÀNG
  const clearCart = useCallback(async () => {
    try {
      if (cartService.clearCart) {
        await cartService.clearCart();
      }
    } catch (error) {
      console.warn("API clear giỏ hàng gặp sự cố hoặc chưa hoàn thiện");
    } finally {
      setItems([]); 
    }
  }, []);

  return (
    <CartContext.Provider 
      value={{ 
        items, totalItems, totalPrice, loading,
        loadCart, addItem, updateQuantity, removeItem, clearCart 
      }}
    >
      {children}
    </CartContext.Provider>
  );
};