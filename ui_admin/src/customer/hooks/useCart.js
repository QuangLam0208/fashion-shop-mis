// src/customer/hooks/useCart.js
import { useContext } from 'react';
import { CartContext } from '../context/CartContext';

const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart phải dùng trong CartProvider');
  return ctx;
};

export default useCart;