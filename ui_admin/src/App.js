import React from 'react';
import { AuthProvider } from './context/AuthContext';
import AppRoutes from './routes';

/**
 * App — root component
 *
 * Chỉ có 2 việc:
 *  1. Bọc toàn app trong AuthProvider
 *  2. Render AppRoutes (toàn bộ routing nằm trong routes/index.js)
 */
const App = () => {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
};

export default App;
