import React from 'react';
import { Route } from 'react-router-dom';
import CategoryListPage from '../pages/categories/CategoryListPage';

const categoryRoutes = (
  <Route path="categories" element={<CategoryListPage />} />
);

export default categoryRoutes;
