// src/customer/hooks/useCustomerAuth.js
import { useContext } from 'react';
import { CustomerAuthContext } from '../context/CustomerAuthContext';

/**
 * Hook tiện dụng để truy cập CustomerAuthContext
 *
 * Sử dụng:
 *   const { currentUser, isAuthenticated, login, logout } = useCustomerAuth();
 */
export const useCustomerAuth = () => {
  const context = useContext(CustomerAuthContext);
  if (!context) {
    throw new Error('useCustomerAuth phải được dùng trong CustomerAuthProvider');
  }
  return context;
};

export default useCustomerAuth;