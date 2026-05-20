import React from 'react';
import { Route } from 'react-router-dom';
import ProductListPage from '../pages/products/ProductListPage';
import ProductFormPage from '../pages/products/ProductFormPage';
const productRoutes = (
  <>
    <Route path="products" element={<ProductListPage />} />
    <Route path="products/new" element={<ProductFormPage />} />
    <Route path="products/:id/edit" element={<ProductFormPage />} />
  </>
);
export default productRoutes;