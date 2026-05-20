import React from 'react';
import { Route } from 'react-router-dom';
import UserListPage   from '../pages/users/UserListPage';
import UserDetailPage from '../pages/users/UserDetailPage';
const userRoutes = (
  <>
    <Route path="users" element={<UserListPage />} />
    <Route path="users/:id" element={<UserDetailPage />} />
  </>
);
export default userRoutes;