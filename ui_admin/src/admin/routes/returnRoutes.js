import React from 'react';
import { Route } from 'react-router-dom';
import ReturnListPage   from '../pages/returns/ReturnListPage';
import ReturnDetailPage from '../pages/returns/ReturnDetailPage';
const returnRoutes = (
  <>
    <Route path="returns" element={<ReturnListPage />} />
    <Route path="returns/:id" element={<ReturnDetailPage />} />
  </>
);
export default returnRoutes;