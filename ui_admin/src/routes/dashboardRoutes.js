import React from 'react';
import { Route } from 'react-router-dom';
import DashboardPage from '../pages/dashboard/DashboardPage';

const dashboardRoutes = (
  <Route path="dashboard" element={<DashboardPage />} />
);

export default dashboardRoutes;
