import React from 'react';
import { Route } from 'react-router-dom';
import OrderListPage   from '../pages/orders/OrderListPage';
import OrderDetailPage from '../pages/orders/OrderDetailPage';
import OrderCreatePage from '../pages/orders/OrderCreatePage';
const orderRoutes = (
  <>
    <Route path="orders" element={<OrderListPage />} />
    <Route path="orders/:id" element={<OrderDetailPage />} />
    <Route path="orders/create" element={<OrderCreatePage />} />
  </>
);
export default orderRoutes;