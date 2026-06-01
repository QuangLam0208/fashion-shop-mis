import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar     from './Navbar';
import ShopFooter from './ShopFooter';

const CustomerLayout = () => (
  <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
    <Navbar />
    <main style={{ flex: 1 }}>
      <Outlet />
    </main>
    <ShopFooter />
  </div>
);

export default CustomerLayout;