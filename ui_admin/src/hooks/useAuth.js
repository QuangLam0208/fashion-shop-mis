import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

/**
 * Hook tiện ích — thay cho useContext(AuthContext) ở mọi component
 *
 * Sử dụng:
 *   const { currentUser, login, logout, isAuthenticated } = useAuth();
 */
const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth phải được dùng bên trong <AuthProvider>');
  }
  return context;
};

export default useAuth;
