// src/customer/context/CartContext.js
import React, { createContext, useState, useEffect, useCallback } from 'react';

const CART_KEY = 'fashion_cart';

export const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
    catch { return []; }
  });

  // Persist mỗi khi items thay đổi
  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  }, [items]);

  const totalItems = items.reduce((s, i) => s + i.quantity, 0);
  const totalPrice = items.reduce((s, i) => s + i.price * i.quantity, 0);

  const addItem = useCallback((product) => {
    setItems((prev) => {
      const exist = prev.find((i) => i.variant_id === product.variant_id && i.product_id === product.product_id);
      if (exist) return prev.map((i) => i.variant_id === product.variant_id ? { ...i, quantity: i.quantity + (product.quantity || 1) } : i);
      return [...prev, { ...product, quantity: product.quantity || 1 }];
    });
  }, []);

  const updateQuantity = useCallback((variant_id, quantity) => {
    if (quantity < 1) return;
    setItems((prev) => prev.map((i) => i.variant_id === variant_id ? { ...i, quantity } : i));
  }, []);

  const removeItem = useCallback((variant_id) => {
    setItems((prev) => prev.filter((i) => i.variant_id !== variant_id));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  return (
    <CartContext.Provider value={{ items, totalItems, totalPrice, addItem, updateQuantity, removeItem, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};