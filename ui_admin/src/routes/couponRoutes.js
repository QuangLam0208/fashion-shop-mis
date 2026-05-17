import React from 'react';
import { Route } from 'react-router-dom';
import CouponListPage from '../pages/coupons/CouponListPage';
import CouponFormPage from '../pages/coupons/CouponFormPage';

const couponRoutes = (
  <>
    <Route path="coupons"            element={<CouponListPage />} />
    <Route path="coupons/create"     element={<CouponFormPage />} />
    <Route path="coupons/:id/edit"   element={<CouponFormPage />} />
  </>
);

export default couponRoutes;
