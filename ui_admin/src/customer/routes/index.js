// src/customer/routes/index.js
import React from 'react';
import { Routes, Route } from 'react-router-dom';

import CustomerLayout       from '../layouts/CustomerLayout';
import CustomerPrivateRoute from '../components/CustomerPrivateRoute';

// ── Auth (không có Navbar/Footer)
import CustomerLoginPage  from '../pages/auth/CustomerLoginPage';
import RegisterPage       from '../pages/auth/RegisterPage';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';
import ResetPasswordPage  from '../pages/auth/ResetPasswordPage';
import VerifyEmailPage    from '../pages/auth/VerifyEmailPage';

// ── Shop (public)
import LandingPage       from '../pages/landing/LandingPage';
import ProductListPage   from '../pages/shop/ProductListPage';
import ProductDetailPage from '../pages/shop/ProductDetailPage';
import CategoryPage      from '../pages/shop/CategoryPage';
import WishlistPage      from '../pages/shop/WishlistPage';

// ── Checkout
import CartPage         from '../pages/checkout/CartPage';
import CheckoutPage     from '../pages/checkout/CheckoutPage';
import OrderConfirmPage from '../pages/checkout/OrderConfirmPage';
import MoMoReturnPage   from '../pages/checkout/MoMoReturnPage';
import MockMoMoPage from '../pages/checkout/MockMoMoPage';

// ── Account (protected)
import ProfilePage     from '../pages/account/ProfilePage';
import CustomerOrder    from '../pages/account/CustomerOrderListPage';
import OrderDetailPage from '../pages/account/OrderDetailPage';

// ── 404
import NotFoundPage from '../pages/NotFoundPage';
import CustomerReturnListPage from '../pages/account/CustomerReturnListPage';
import CustomerReturnDetailPage from '../pages/account/CustomerReturnDetailPage';
import PromotionsPage from '../pages/shop/PromotionsPage';
import CustomerWalletPage from '../pages/account/CustomerWalletPage';
import CustomerMyReviewsPage from '../pages/account/CustomerMyReviewsPage';

const CustomerRoutes = () => (
  <Routes>
    {/* ── Auth — không có layout ── */}
    <Route path="login"           element={<CustomerLoginPage />} />
    <Route path="register"        element={<RegisterPage />} />
    <Route path="forgot-password" element={<ForgotPasswordPage />} />
    <Route path="reset-password"  element={<ResetPasswordPage />} />
    <Route path="verify-email"    element={<VerifyEmailPage />} />

    {/* ── Có Navbar + Footer ── */}
    <Route element={<CustomerLayout />}>
      {/* Public */}
      <Route index              element={<LandingPage />} />
      <Route path="shop"        element={<ProductListPage />} />
      <Route path="shop/:id"    element={<ProductDetailPage />} />
      <Route path="category/:id" element={<CategoryPage />} />
      <Route path="wishlist" element={<WishlistPage />} />
      <Route path="promotions"  element={<PromotionsPage />} />

      {/* Protected */}
      <Route element={<CustomerPrivateRoute />}>
        <Route path="cart"               element={<CartPage />} />
        <Route path="checkout"           element={<CheckoutPage />} />
        <Route path="checkout/confirm"   element={<OrderConfirmPage />} />
        <Route path="checkout/payment-result" element={<MoMoReturnPage />} /> 
        <Route path="mock/momo-payment" element={<MockMoMoPage />} />
        <Route path="account/profile"    element={<ProfilePage />} />
        <Route path="account/orders"     element={<CustomerOrder />} />
        <Route path="account/orders/:id" element={<OrderDetailPage />} />
        <Route path="account/returns"    element={<CustomerReturnListPage />} />
        <Route path="account/returns/:id" element={<CustomerReturnDetailPage />} />
        <Route path="account/wallet" element={<CustomerWalletPage />} />
        <Route path="account/my-reviews" element={<CustomerMyReviewsPage />} />
      </Route>
    </Route>

    <Route path="*" element={<NotFoundPage />} />
  </Routes>
);

export default CustomerRoutes;