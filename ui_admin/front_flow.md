# 📋 Fashion App — Tài Liệu Dự Án Frontend (Admin + Customer)

> **Stack:** ReactJS (CRA) · Ant Design + Custom CSS · React Router v6 · Recharts  
> **Khởi chạy:** `npm start`  
> **Mock data:** `USE_MOCK = true` trong `shared/config/apiConfig.js`  
> **Cấu trúc:** 1 project · chia `admin/` + `customer/` + `shared/`

---

## 1. Cây Thư Mục Tổng Hợp

```
fashion-app/
├── .env                                    # REACT_APP_API_BASE_URL=http://localhost:8080
├── .gitignore
├── package.json
├── public/
│   ├── index.html
│   └── favicon.ico
└── src/
    ├── index.js                            # ConfigProvider antd (2 theme) + render App
    ├── App.js                              # /admin/* → AdminRoutes | /* → CustomerRoutes
    ├── index.css                           # global reset
    │
    ├── shared/                             # ★ DÙNG CHUNG cả admin & customer
    │   ├── config/
    │   │   ├── apiConfig.js               # USE_MOCK flag + tất cả API_ENDPOINTS
    │   │   └── axiosInstance.js           # Axios base + JWT interceptor + xử lý 401
    │   ├── constants/
    │   │   ├── orderConstants.js
    │   │   ├── userConstants.js
    │   │   ├── returnConstants.js
    │   │   ├── couponConstants.js
    │   │   └── appConstants.js
    │   ├── utils/
    │   │   ├── formatters.js              # formatCurrency, formatDate, formatPhone
    │   │   ├── storageHelper.js           # get/set/clear token localStorage
    │   │   └── exportExcel.js
    │   ├── hooks/
    │   │   └── useDebounce.js
    │   └── mocks/                         # data giả theo DB schema
    │       ├── dashboardMock.js
    │       ├── productMock.js
    │       ├── categoryMock.js
    │       ├── orderMock.js
    │       ├── returnMock.js
    │       ├── userMock.js
    │       ├── couponMock.js
    │       ├── reviewMock.js              # customer
    │       └── cartMock.js               # customer
    │
    ├── admin/                             # ★ ADMIN — quản trị viên
    │   ├── config/
    │   │   └── menuConfig.js             # MENU_ITEMS sidebar
    │   ├── context/
    │   │   └── AuthContext.js            # admin auth state
    │   ├── hooks/
    │   │   └── useAuth.js
    │   ├── services/
    │   │   ├── authService.js
    │   │   ├── productService.js
    │   │   ├── categoryService.js
    │   │   ├── orderService.js
    │   │   ├── returnService.js
    │   │   ├── userService.js
    │   │   ├── couponService.js
    │   │   └── dashboardService.js
    │   ├── layouts/
    │   │   ├── MainLayout.js             # Sider + Header + Outlet + Footer
    │   │   ├── Sidebar.js
    │   │   ├── AppHeader.js
    │   │   └── AppFooter.js
    │   ├── components/
    │   │   ├── PageHeader.js             # Breadcrumb + tiêu đề
    │   │   ├── SearchBar.js              # filter trái
    │   │   ├── ActionBar.js              # Thêm + Export phải
    │   │   ├── StatusBadge.js
    │   │   ├── ConfirmModal.js
    │   │   ├── StatCard.js
    │   │   └── PrivateRoute.js
    │   ├── routes/
    │   │   ├── index.js                  # AdminRoutes — trung tâm
    │   │   ├── dashboardRoutes.js
    │   │   ├── productRoutes.js
    │   │   ├── categoryRoutes.js
    │   │   ├── orderRoutes.js
    │   │   ├── returnRoutes.js
    │   │   ├── userRoutes.js
    │   │   └── couponRoutes.js
    │   └── pages/
    │       ├── LoginPage.js
    │       ├── NotFoundPage.js
    │       ├── dashboard/
    │       │   └── DashboardPage.js
    │       ├── products/
    │       │   ├── ProductListPage.js
    │       │   └── ProductFormPage.js
    │       ├── categories/
    │       │   └── CategoryListPage.js
    │       ├── orders/
    │       │   ├── OrderListPage.js
    │       │   ├── OrderDetailPage.js
    │       │   └── OrderCreatePage.js    # POS
    │       ├── returns/
    │       │   ├── ReturnListPage.js
    │       │   └── ReturnDetailPage.js
    │       ├── users/
    │       │   ├── UserListPage.js
    │       │   └── UserDetailPage.js
    │       └── coupons/
    │           ├── CouponListPage.js
    │           └── CouponFormPage.js
    │
    └── customer/                          # ★ CUSTOMER — cửa hàng
        ├── context/
        │   ├── CustomerAuthContext.js    # customer auth riêng
        │   └── CartContext.js            # giỏ hàng global state
        ├── hooks/
        │   ├── useCustomerAuth.js
        │   └── useCart.js
        ├── services/
        │   ├── customerAuthService.js
        │   ├── shopProductService.js     # browse sản phẩm
        │   ├── cartService.js
        │   ├── wishlistService.js
        │   ├── checkoutService.js
        │   ├── customerOrderService.js
        │   └── reviewService.js
        ├── layouts/
        │   ├── CustomerLayout.js         # Navbar + Outlet + ShopFooter
        │   ├── Navbar.js                 # logo, menu, search, cart icon, user
        │   └── ShopFooter.js
        ├── components/                   # ★ Item riêng — làm đẹp list
        │   ├── ProductCard.js            # card ảnh + tên + giá + badge Sale
        │   ├── CategoryCard.js           # ảnh nền + tên overlay
        │   ├── BannerSlider.js           # hero banner carousel
        │   ├── ReviewCard.js             # sao + nội dung + ảnh
        │   ├── CartDrawer.js             # giỏ hàng drawer phải
        │   ├── VariantPicker.js          # chọn màu + size button group
        │   ├── QuantityInput.js          # − số lượng +
        │   ├── WishlistButton.js         # toggle tim yêu thích
        │   └── CustomerPrivateRoute.js   # guard customer chưa login
        ├── routes/
        │   ├── index.js                  # CustomerRoutes — trung tâm
        │   ├── shopRoutes.js             # landing, danh sách, chi tiết SP
        │   ├── authRoutes.js             # login, register, forgot-password
        │   ├── accountRoutes.js          # profile, orders, wishlist
        │   └── checkoutRoutes.js         # cart, checkout, confirm
        ├── pages/
        │   ├── landing/
        │   │   └── LandingPage.js        # hero + danh mục + SP nổi bật + deals
        │   ├── auth/
        │   │   ├── CustomerLoginPage.js
        │   │   ├── RegisterPage.js
        │   │   └── ForgotPasswordPage.js
        │   ├── shop/
        │   │   ├── ProductListPage.js    # lưới ProductCard + filter sidebar
        │   │   ├── ProductDetailPage.js  # ảnh lớn + VariantPicker + reviews
        │   │   └── CategoryPage.js       # SP theo danh mục
        │   ├── checkout/
        │   │   ├── CartPage.js
        │   │   ├── CheckoutPage.js       # địa chỉ + PTTT + voucher
        │   │   └── OrderConfirmPage.js   # cảm ơn + mã đơn
        │   ├── account/
        │   │   ├── ProfilePage.js
        │   │   ├── MyOrdersPage.js
        │   │   ├── OrderDetailPage.js    # xem chi tiết + yêu cầu trả
        │   │   └── WishlistPage.js
        │   └── NotFoundPage.js
        └── styles/
            ├── customer.css              # CSS variables, font, spacing customer
            ├── landing.css
            └── product.css
```

---

## 2. App.js — Phân Luồng Route

```jsx
// src/App.js
// /admin/* → AdminRoutes (AuthContext + dark theme)
// /*       → CustomerRoutes (CustomerAuthContext + CartContext + light theme)

<BrowserRouter>
  <Routes>
    <Route path="/admin/*" element={
      <AuthProvider>
        <AdminRoutes />
      </AuthProvider>
    } />
    <Route path="/*" element={
      <CustomerAuthProvider>
        <CartProvider>
          <CustomerRoutes />
        </CartProvider>
      </CustomerAuthProvider>
    } />
  </Routes>
</BrowserRouter>
```

---

## 3. Shared — Dùng Chung

### `shared/config/apiConfig.js`

```js
export const USE_MOCK = true; // ← đổi false khi có backend

const BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';

export const API_ENDPOINTS = {
  // ── AUTH (cả admin & customer) ──
  AUTH: {
    LOGIN:           `${BASE}/api/auth/login`,
    LOGOUT:          `${BASE}/api/auth/logout`,
    REFRESH:         `${BASE}/api/auth/refresh`,
    ME:              `${BASE}/api/auth/me`,
    REGISTER:        `${BASE}/api/auth/register`,
    FORGOT_PASSWORD: `${BASE}/api/auth/forgot-password`,
    RESET_PASSWORD:  `${BASE}/api/auth/reset-password`,
    VERIFY_EMAIL:    `${BASE}/api/auth/verify-email`,
  },

  // ── ADMIN ──
  DASHBOARD: {
    STATS:        `${BASE}/api/admin/dashboard/stats`,
    REVENUE:      `${BASE}/api/admin/dashboard/revenue`,
    TOP_PRODUCTS: `${BASE}/api/admin/dashboard/top-products`,
    ORDER_STATUS: `${BASE}/api/admin/dashboard/order-status`,
  },
  ADMIN_PRODUCTS: {
    GET_ALL:   `${BASE}/api/admin/products`,
    GET_BY_ID: (id) => `${BASE}/api/admin/products/${id}`,
    CREATE:    `${BASE}/api/admin/products`,
    UPDATE:    (id) => `${BASE}/api/admin/products/${id}`,
    DELETE:    (id) => `${BASE}/api/admin/products/${id}`,
  },
  CATEGORIES: {
    GET_ALL:   `${BASE}/api/admin/categories`,
    GET_BY_ID: (id) => `${BASE}/api/admin/categories/${id}`,
    CREATE:    `${BASE}/api/admin/categories`,
    UPDATE:    (id) => `${BASE}/api/admin/categories/${id}`,
    DELETE:    (id) => `${BASE}/api/admin/categories/${id}`,
  },
  ADMIN_ORDERS: {
    GET_ALL:       `${BASE}/api/admin/orders`,
    GET_BY_ID:     (id) => `${BASE}/api/admin/orders/${id}`,
    CREATE:        `${BASE}/api/admin/orders`,
    UPDATE_STATUS: (id) => `${BASE}/api/admin/orders/${id}/status`,
    CANCEL:        (id) => `${BASE}/api/admin/orders/${id}/cancel`,
  },
  RETURNS: {
    GET_ALL:   `${BASE}/api/admin/returns`,
    GET_BY_ID: (id) => `${BASE}/api/admin/returns/${id}`,
    APPROVE:   (id) => `${BASE}/api/admin/returns/${id}/approve`,
    REJECT:    (id) => `${BASE}/api/admin/returns/${id}/reject`,
    COMPLETE:  (id) => `${BASE}/api/admin/returns/${id}/complete`,
  },
  ADMIN_USERS: {
    GET_ALL:       `${BASE}/api/admin/users`,
    GET_BY_ID:     (id) => `${BASE}/api/admin/users/${id}`,
    TOGGLE_STATUS: (id) => `${BASE}/api/admin/users/${id}/toggle-status`,
    GET_ORDERS:    (id) => `${BASE}/api/admin/users/${id}/orders`,
  },
  COUPONS: {
    GET_ALL:   `${BASE}/api/admin/coupons`,
    GET_BY_ID: (id) => `${BASE}/api/admin/coupons/${id}`,
    CREATE:    `${BASE}/api/admin/coupons`,
    UPDATE:    (id) => `${BASE}/api/admin/coupons/${id}`,
    DELETE:    (id) => `${BASE}/api/admin/coupons/${id}`,
  },

  // ── CUSTOMER (shop) ──
  SHOP: {
    PRODUCTS:       `${BASE}/api/products`,
    PRODUCT_DETAIL: (id) => `${BASE}/api/products/${id}`,
    CATEGORIES:     `${BASE}/api/categories`,
    SEARCH:         `${BASE}/api/products/search`,
    REVIEWS:        (productId) => `${BASE}/api/products/${productId}/reviews`,
  },
  CART: {
    GET:    `${BASE}/api/cart`,
    ADD:    `${BASE}/api/cart/items`,
    UPDATE: (itemId) => `${BASE}/api/cart/items/${itemId}`,
    REMOVE: (itemId) => `${BASE}/api/cart/items/${itemId}`,
    CLEAR:  `${BASE}/api/cart/clear`,
  },
  WISHLIST: {
    GET:    `${BASE}/api/wishlist`,
    TOGGLE: (productId) => `${BASE}/api/wishlist/${productId}`,
  },
  CHECKOUT: {
    PLACE_ORDER:    `${BASE}/api/orders`,
    APPLY_COUPON:   `${BASE}/api/coupons/validate`,
  },
  CUSTOMER_ORDERS: {
    GET_ALL:   `${BASE}/api/orders`,
    GET_BY_ID: (id) => `${BASE}/api/orders/${id}`,
    CANCEL:    (id) => `${BASE}/api/orders/${id}/cancel`,
  },
  CUSTOMER_RETURNS: {
    CREATE:    `${BASE}/api/returns`,
    GET_BY_ID: (id) => `${BASE}/api/returns/${id}`,
  },
  PROFILE: {
    GET:             `${BASE}/api/profile`,
    UPDATE:          `${BASE}/api/profile`,
    CHANGE_PASSWORD: `${BASE}/api/profile/change-password`,
    ADDRESSES:       `${BASE}/api/profile/addresses`,
    ADD_ADDRESS:     `${BASE}/api/profile/addresses`,
    UPDATE_ADDRESS:  (id) => `${BASE}/api/profile/addresses/${id}`,
    DELETE_ADDRESS:  (id) => `${BASE}/api/profile/addresses/${id}`,
  },
  REVIEWS: {
    CREATE: `${BASE}/api/reviews`,
  },
};
```

### `shared/constants/` — Enum từ DB

```js
// orderConstants.js
export const ORDER_STATUS = {
  PENDING_CONFIRMATION: { label: 'Chờ xác nhận',  color: 'gold'    },
  PENDING_PAYMENT:      { label: 'Chờ thanh toán', color: 'orange'  },
  PROCESSING:           { label: 'Đang xử lý',     color: 'blue'    },
  SHIPPING:             { label: 'Đang giao',       color: 'cyan'    },
  DELIVERED:            { label: 'Đã giao',         color: 'green'   },
  PAID:                 { label: 'Đã thanh toán',   color: 'green'   },
  COMPLETED:            { label: 'Hoàn thành',      color: 'green'   },
  CANCELLED:            { label: 'Đã huỷ',          color: 'red'     },
  PAYMENT_FAILED:       { label: 'Thanh toán lỗi',  color: 'red'     },
  PAYMENT_EXPIRED:      { label: 'Hết hạn TT',      color: 'default' },
};
export const PAYMENT_METHOD = {
  COD:           'Tiền mặt (COD)',
  VNPAY:         'VNPay',
  MOMO:          'MoMo',
  BANK_TRANSFER: 'Chuyển khoản',
};
export const ORDER_TYPE = { ONLINE: 'Online', OFFLINE: 'Tại quầy' };

// userConstants.js
export const USER_STATUS = {
  ACTIVE:  { label: 'Hoạt động',    color: 'green'  },
  BLOCKED: { label: 'Bị khoá',      color: 'red'    },
  PENDING: { label: 'Chờ xác nhận', color: 'orange' },
};
export const USER_ROLE = { ADMIN: 'Admin', CUSTOMER: 'Khách hàng' };

// returnConstants.js
export const RETURN_STATUS = {
  PENDING:   { label: 'Chờ duyệt',  color: 'gold'  },
  APPROVED:  { label: 'Đã duyệt',   color: 'blue'  },
  REJECTED:  { label: 'Từ chối',    color: 'red'   },
  COMPLETED: { label: 'Hoàn thành', color: 'green' },
};
export const REFUND_STATUS = {
  NONE:      { label: 'Chưa hoàn',  color: 'default' },
  PENDING:   { label: 'Đang xử lý', color: 'orange'  },
  COMPLETED: { label: 'Đã hoàn',    color: 'green'   },
  FAILED:    { label: 'Thất bại',   color: 'red'     },
};

// couponConstants.js
export const DISCOUNT_TYPE = {
  PERCENTAGE:   { label: 'Phần trăm (%)',   icon: '%' },
  FIXED_AMOUNT: { label: 'Số tiền cố định', icon: '₫' },
};

// appConstants.js
export const PAGE_SIZE       = 10;
export const DATE_FORMAT     = 'DD/MM/YYYY';
export const DATETIME_FORMAT = 'DD/MM/YYYY HH:mm';
export const CURRENCY        = 'VND';
export const APP_NAME        = 'Fashion Store';
```

### `shared/mocks/` — Cấu Trúc Mẫu

```js
// productMock.js
export const mockProducts = [
  {
    product_id: 1,
    name: 'Áo Thun Basic',
    description: 'Áo thun cotton 100%, form regular fit',
    status: 'ACTIVE',           // ACTIVE | INACTIVE | OUT_OF_STOCK | DISCONTINUED
    category_id: 2,
    category_name: 'Áo Phông',
    variants: [
      { variant_id: 1, color: 'Trắng', size: 'S', price: 199000, stock_quantity: 50 },
      { variant_id: 2, color: 'Trắng', size: 'M', price: 199000, stock_quantity: 30 },
      { variant_id: 3, color: 'Đen',   size: 'M', price: 199000, stock_quantity: 20 },
    ],
    images: [
      { image_id: 1, url: 'https://placehold.co/400x500', color: 'Trắng' },
      { image_id: 2, url: 'https://placehold.co/400x500', color: 'Đen'   },
    ],
    avg_rating: 4.5,
    review_count: 28,
    is_sale: true,
    sale_price: 159000,
  },
];

// cartMock.js
export const mockCart = [
  {
    cart_item_id: 1,
    user_id: 3,
    variant_id: 2,
    quantity: 2,
    product_name: 'Áo Thun Basic',
    color: 'Trắng', size: 'M',
    price: 199000,
    image_url: 'https://placehold.co/80x80',
    stock_quantity: 30,
  },
];

// reviewMock.js
export const mockReviews = [
  {
    review_id: 1,
    user_id: 3,
    product_id: 1,
    order_item_id: 5,
    rating: 5,
    comment: 'Sản phẩm rất đẹp, chất liệu tốt, giao hàng nhanh!',
    created_at: '2025-04-10T08:00:00',
    reviewer_name: 'Nguyễn Văn A',
    images: [{ review_image_id: 1, image_url: 'https://placehold.co/100x100' }],
  },
];

// orderMock.js
export const mockOrders = [
  {
    order_id: 1001,
    user_id: 3,
    customer_name: 'Nguyễn Văn A',
    order_date: '2025-04-01T10:30:00',
    total_amount: 598000,
    status: 'DELIVERED',
    payment_method: 'COD',
    type: 'ONLINE',
    shipping_address: '123 Lê Lợi, Q.1, TP.HCM',
    coupon_id: null,
    hidden_by_user: false,
    items: [
      {
        order_item_id: 1,
        product_name: 'Áo Thun Basic',
        variant_id: 2, color: 'Trắng', size: 'M',
        quantity: 2, price: 199000,
        status: 'DELIVERED',
        is_reviewed: false,
        refund_status: 'NONE',
      },
    ],
  },
];

// userMock.js
export const mockUsers = [
  {
    user_id: 3,
    full_name: 'Nguyễn Văn A',
    email: 'nguyenvana@gmail.com',
    phone: '0901234567',
    role: 'CUSTOMER',
    status: 'ACTIVE',
    email_verified: true,
    two_factor_enabled: false,
  },
];

// couponMock.js
export const mockCoupons = [
  {
    coupon_id: 1, code: 'SUMMER20',
    discount_type: 'PERCENTAGE', discount_value: 20,
    min_order_amount: 300000, usage_limit: 100,
    start_date: '2025-06-01T00:00:00', expiry_date: '2025-08-31T23:59:59',
    active: true,
  },
  {
    coupon_id: 2, code: 'GIAM50K',
    discount_type: 'FIXED_AMOUNT', discount_value: 50000,
    min_order_amount: 200000, usage_limit: 50,
    start_date: '2025-04-01T00:00:00', expiry_date: '2025-05-01T23:59:59',
    active: false,
  },
];

// dashboardMock.js
export const mockDashboardStats = {
  total_revenue: 125000000,
  total_orders: 342,
  total_customers: 198,
  pending_orders: 12,
};
export const mockRevenue = [
  { month: 'T1', revenue: 8500000 }, { month: 'T2', revenue: 11200000 },
  { month: 'T3', revenue: 9800000 }, { month: 'T4', revenue: 14300000 },
];
export const mockTopProducts = [
  { product_id: 1, name: 'Áo Thun Basic', sold: 120, revenue: 23880000 },
  { product_id: 2, name: 'Quần Jeans Slim', sold: 95, revenue: 37050000 },
];
```

---

## 4. Admin

### 4.1 Routes Admin

```
/login                          → LoginPage (public)
/admin                          → redirect /admin/dashboard
/admin/dashboard                → DashboardPage
/admin/products                 → ProductListPage
/admin/products/create          → ProductFormPage
/admin/products/:id/edit        → ProductFormPage
/admin/categories               → CategoryListPage
/admin/orders                   → OrderListPage
/admin/orders/create            → OrderCreatePage (POS)
/admin/orders/:id               → OrderDetailPage
/admin/returns                  → ReturnListPage
/admin/returns/:id              → ReturnDetailPage
/admin/users                    → UserListPage
/admin/users/:id                → UserDetailPage
/admin/coupons                  → CouponListPage
/admin/coupons/create           → CouponFormPage
/admin/coupons/:id/edit         → CouponFormPage
```

### 4.2 `admin/routes/index.js` — Cấu Trúc

```jsx
<Routes>
  <Route path="/login" element={<LoginPage />} />
  <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
  <Route element={<PrivateRoute />}>
    <Route path="/admin" element={<MainLayout />}>
      <Route index element={<Navigate to="dashboard" replace />} />
      {dashboardRoutes}
      {productRoutes}
      {categoryRoutes}
      {orderRoutes}
      {returnRoutes}
      {userRoutes}
      {couponRoutes}
    </Route>
  </Route>
  <Route path="*" element={<NotFoundPage />} />
</Routes>
```

### 4.3 `admin/config/menuConfig.js`

```js
export const MENU_ITEMS = [
  { key: 'dashboard', label: 'Dashboard',    icon: <DashboardOutlined />, path: '/admin/dashboard' },
  {
    key: 'products-group', label: 'Sản phẩm', icon: <ShoppingOutlined />,
    children: [
      { key: 'products',   label: 'Danh sách sản phẩm', path: '/admin/products'   },
      { key: 'categories', label: 'Danh mục',            path: '/admin/categories' },
    ],
  },
  {
    key: 'orders-group', label: 'Đơn hàng', icon: <OrderedListOutlined />,
    children: [
      { key: 'orders',        label: 'Danh sách đơn', path: '/admin/orders'        },
      { key: 'orders-create', label: 'Tạo đơn (POS)', path: '/admin/orders/create' },
    ],
  },
  { key: 'returns', label: 'Trả hàng',   icon: <RollbackOutlined />, path: '/admin/returns' },
  { key: 'users',   label: 'Người dùng', icon: <UserOutlined />,     path: '/admin/users'   },
  { key: 'coupons', label: 'Khuyến mãi', icon: <GiftOutlined />,     path: '/admin/coupons' },
];
```

### 4.4 Layout Admin

```
┌────────────────────────────────────────────────────────────┐
│  AppHeader  (logo · tên admin · notification · logout)     │
├───────────────┬────────────────────────────────────────────┤
│               │  <PageHeader> Breadcrumb + Tiêu đề         │
│   Sidebar     │────────────────────────────────────────────│
│   (antd dark) │  ┌─────────────────┬──────────────────┐   │
│               │  │   SearchBar     │    ActionBar      │   │
│  - Dashboard  │  │   (trái)        │    (phải)         │   │
│  - Sản phẩm   │  └─────────────────┴──────────────────┘   │
│    - D.sách   │                                             │
│    - D.mục    │  Table / Form / Detail  (<Outlet />)        │
│  - Đơn hàng   │                                             │
│  - Trả hàng   │                                             │
│  - Người dùng │                                             │
│  - Khuyến mãi │                                             │
├───────────────┴────────────────────────────────────────────┤
│  AppFooter  (© 2025 Fashion Admin · v1.0.0)                │
└────────────────────────────────────────────────────────────┘
```

### 4.5 Các Trang Admin — Chức Năng Chi Tiết

#### Dashboard (`/admin/dashboard`)
- StatCard: Tổng doanh thu, Tổng đơn hàng, Số khách hàng, Đơn chờ xử lý
- Recharts LineChart: doanh thu theo tháng
- Bảng: Top 5 sản phẩm bán chạy
- Donut chart: số đơn theo trạng thái

#### Sản phẩm (`/admin/products`)
- **ProductListPage:** SearchBar (tên, danh mục, status) + ActionBar (Thêm, Export)
  - Table: tên, danh mục, số variants, trạng thái, Sửa/Xoá
- **ProductFormPage:** Form tên/mô tả/danh mục/status + bảng variants (màu, size, giá, tồn kho) + upload ảnh theo màu

#### Danh mục (`/admin/categories`)
- Tree cha-con (2 cấp: Áo → Áo sơ mi, Áo phông...)
- Inline add/edit/delete + kiểm tra ràng buộc sản phẩm trước khi xoá

#### Đơn hàng (`/admin/orders`)
- **OrderListPage:** filter status/ngày/loại + ActionBar (Tạo đơn POS, Export)
- **OrderDetailPage:** thông tin đơn + items + timeline trạng thái (`order_histories`)
- **OrderCreatePage (POS):** tìm SP nhanh → chọn variant → giỏ tạm → thanh toán → tạo đơn OFFLINE/COMPLETED → xuất PDF

#### Trả hàng (`/admin/returns`)
- **ReturnListPage:** filter status + bảng yêu cầu
- **ReturnDetailPage:** lý do + ảnh minh chứng + nút Duyệt/Từ chối + refund_status

#### Người dùng (`/admin/users`)
- **UserListPage:** tìm tên/email/SĐT, filter status + khoá/mở khoá inline
- **UserDetailPage:** thông tin tài khoản + lịch sử đơn hàng mini

#### Khuyến mãi (`/admin/coupons`)
- **CouponListPage:** tìm code, filter loại/status + Export
- **CouponFormPage:** code, loại (PERCENTAGE/FIXED_AMOUNT), giá trị, đơn tối thiểu, giới hạn, DateRangePicker, toggle active

### 4.6 Services Admin — Pattern Chuẩn

```js
// admin/services/productService.js
import { USE_MOCK, API_ENDPOINTS } from '../../shared/config/apiConfig';
import axiosInstance from '../../shared/config/axiosInstance';
import { mockProducts } from '../../shared/mocks/productMock';

export const productService = {
  getAll: async (params) => {
    if (USE_MOCK) return { data: mockProducts, total: mockProducts.length };
    const res = await axiosInstance.get(API_ENDPOINTS.ADMIN_PRODUCTS.GET_ALL, { params });
    return res.data;
  },
  getById:  async (id)       => { if (USE_MOCK) return mockProducts.find(p => p.product_id === +id); return (await axiosInstance.get(API_ENDPOINTS.ADMIN_PRODUCTS.GET_BY_ID(id))).data; },
  create:   async (data)     => { if (USE_MOCK) return { ...data, product_id: Date.now() }; return (await axiosInstance.post(API_ENDPOINTS.ADMIN_PRODUCTS.CREATE, data)).data; },
  update:   async (id, data) => { if (USE_MOCK) return { ...data, product_id: id }; return (await axiosInstance.put(API_ENDPOINTS.ADMIN_PRODUCTS.UPDATE(id), data)).data; },
  delete:   async (id)       => { if (USE_MOCK) return { success: true }; return (await axiosInstance.delete(API_ENDPOINTS.ADMIN_PRODUCTS.DELETE(id))).data; },
};
```

---

## 5. Customer

### 5.1 Routes Customer

```
/                               → LandingPage
/products                       → ProductListPage (lưới ProductCard)
/products/:id                   → ProductDetailPage
/categories/:id                 → CategoryPage
/login                          → CustomerLoginPage
/register                       → RegisterPage
/forgot-password                → ForgotPasswordPage
/cart                           → CartPage
/checkout                       → CheckoutPage       (yêu cầu đăng nhập)
/checkout/confirm               → OrderConfirmPage
/account/profile                → ProfilePage        (yêu cầu đăng nhập)
/account/orders                 → MyOrdersPage       (yêu cầu đăng nhập)
/account/orders/:id             → OrderDetailPage    (yêu cầu đăng nhập)
/account/wishlist               → WishlistPage       (yêu cầu đăng nhập)
*                               → NotFoundPage
```

### 5.2 Layout Customer

```
┌────────────────────────────────────────────────────────────┐
│  Navbar                                                     │
│  [Logo] [Danh mục▼] [Tìm kiếm...🔍] [♡ Wishlist] [🛒2] [👤]│
├────────────────────────────────────────────────────────────┤
│                                                             │
│   <Outlet />  — nội dung từng trang                        │
│                                                             │
├────────────────────────────────────────────────────────────┤
│  ShopFooter                                                 │
│  Về chúng tôi | Chính sách | Liên hệ | Social links        │
└────────────────────────────────────────────────────────────┘
```

### 5.3 Trang Customer — Chức Năng Chi Tiết

#### LandingPage (`/`)
- **BannerSlider:** carousel hero (ảnh + tagline + CTA button)
- **Danh mục nổi bật:** lưới `CategoryCard` (ảnh nền + tên overlay)
- **Sản phẩm nổi bật:** lưới `ProductCard` (8 sản phẩm mới nhất/bán chạy)
- **Flash Sale / Deals:** countdown timer + lưới sản phẩm giảm giá

#### ProductListPage (`/products`)
- Filter sidebar: danh mục, khoảng giá (slider), màu sắc (checkbox), size (button)
- Sort: Mới nhất, Bán chạy, Giá tăng/giảm
- Lưới `ProductCard` 4 cột (responsive 2→1 cột mobile)
- Pagination

#### ProductDetailPage (`/products/:id`)
- Gallery: ảnh lớn + thumbnail list, đổi ảnh theo màu
- `VariantPicker`: chọn màu → chọn size (disable nếu hết hàng)
- `QuantityInput`: − N +, max = tồn kho
- `WishlistButton`: toggle tim
- Nút **Thêm vào giỏ** + **Mua ngay**
- Tab: Mô tả | Đánh giá (`ReviewCard` list + form gửi review)

#### CartPage (`/cart`)
- Danh sách cart items: ảnh, tên, màu/size, giá, `QuantityInput`, xoá
- Tổng tiền tự động
- Nút **Tiến hành thanh toán**

#### CheckoutPage (`/checkout`)
- Chọn/thêm địa chỉ giao hàng (`addresses` table)
- Chọn phương thức thanh toán: COD / VNPAY / MOMO / BANK_TRANSFER
- Ô nhập mã voucher + validate
- Tóm tắt đơn hàng + tổng tiền sau giảm
- Xác nhận đặt hàng

#### OrderConfirmPage (`/checkout/confirm`)
- Thông báo đặt hàng thành công
- Mã đơn hàng + tóm tắt
- Nút xem đơn hàng / tiếp tục mua sắm

#### MyOrdersPage (`/account/orders`)
- Tabs: Tất cả | Chờ xác nhận | Đang giao | Đã giao | Đã huỷ
- List đơn: ảnh SP thu nhỏ, tên, giá, status badge, nút xem chi tiết / huỷ

#### Account OrderDetailPage (`/account/orders/:id`)
- Thông tin đơn: địa chỉ, PTTT, trạng thái, timeline
- Items: ảnh, tên, màu/size, giá, nút **Đánh giá** (nếu chưa review + đã giao)
- Nút **Yêu cầu trả hàng** (nếu DELIVERED)

#### WishlistPage (`/account/wishlist`)
- Lưới `ProductCard` với nút xoá khỏi wishlist

#### ProfilePage (`/account/profile`)
- Tabs: Thông tin | Địa chỉ | Đổi mật khẩu
- Quản lý addresses: thêm/sửa/xoá/đặt mặc định

#### Auth Pages
- **CustomerLoginPage:** email + password + link đăng ký / quên mật khẩu
- **RegisterPage:** full_name, email, phone, password, confirm password
- **ForgotPasswordPage:** nhập email → gửi link reset

### 5.4 Components Customer — Đặc Tả

#### `ProductCard.js`
```
┌───────────────┐
│  [ảnh SP]     │  ← aspect-ratio 3:4
│  [SALE -20%]  │  ← badge góc trên trái (nếu is_sale)
├───────────────┤
│ Áo Thun Basic │  ← tên, 1 dòng, ellipsis
│ Áo Phông      │  ← tên danh mục, nhỏ, mờ
│ ~~199.000₫~~  │  ← giá gốc gạch ngang (nếu sale)
│ 159.000₫      │  ← giá sale màu đỏ
│ ⭐4.5 (28)    │  ← rating + số review
│ [🛒 Thêm vào] │  ← button hover show
└───────────────┘
```

#### `CategoryCard.js`
```
┌───────────────┐
│               │
│  [ảnh nền]    │  ← full cover
│               │
│  ▓ ÁO PHÔNG ▓ │  ← overlay tên ở bottom
└───────────────┘
```

#### `BannerSlider.js`
- Ant Design Carousel tự động chuyển 5s
- Mỗi slide: ảnh full-width + text overlay (tiêu đề + mô tả + CTA button)
- Dots navigation

#### `CartDrawer.js`
- `Drawer` antd từ phải, width 400px
- Header: "Giỏ hàng (N sản phẩm)"
- List items: ảnh + tên + màu/size + giá + QuantityInput + xoá
- Footer sticky: tổng tiền + nút Thanh toán

#### `VariantPicker.js`
- Màu sắc: button tròn màu thực, active border đậm, tooltip tên màu
- Size: button chữ (S/M/L/XL), disable nếu hết hàng (strike-through + opacity)

#### `ReviewCard.js`
- Avatar + tên reviewer + ngày
- Stars (Rate antd readonly)
- Comment text
- Ảnh minh chứng (nếu có), click xem lớn

### 5.5 Context Customer

```js
// customer/context/CartContext.js
// State: items[], totalItems, totalPrice
// Actions: addItem(), updateQuantity(), removeItem(), clearCart()
// Persist: localStorage 'fashion_cart'

// customer/context/CustomerAuthContext.js
// State: currentUser, token, loading, isAuthenticated
// Actions: login(), logout(), updateProfile()
// Persist: localStorage 'fashion_customer_token'
```

### 5.6 Services Customer — Pattern

```js
// customer/services/shopProductService.js
import { USE_MOCK, API_ENDPOINTS } from '../../shared/config/apiConfig';
import axiosInstance from '../../shared/config/axiosInstance';
import { mockProducts } from '../../shared/mocks/productMock';

export const shopProductService = {
  getAll: async (params) => {
    if (USE_MOCK) {
      // filter mock theo params
      let result = [...mockProducts];
      if (params?.category_id) result = result.filter(p => p.category_id === +params.category_id);
      if (params?.keyword) result = result.filter(p => p.name.toLowerCase().includes(params.keyword.toLowerCase()));
      return { data: result, total: result.length };
    }
    return (await axiosInstance.get(API_ENDPOINTS.SHOP.PRODUCTS, { params })).data;
  },
  getById: async (id) => {
    if (USE_MOCK) return mockProducts.find(p => p.product_id === +id);
    return (await axiosInstance.get(API_ENDPOINTS.SHOP.PRODUCT_DETAIL(id))).data;
  },
};
```

---

## 6. DB Schema — Toàn Bộ Bảng

| Bảng | Dùng ở đâu |
|------|------------|
| `users` | Login, Register, Profile, Admin UserList |
| `addresses` | Checkout, ProfilePage (tab địa chỉ) |
| `products` | ProductList, ProductDetail, Admin ProductList |
| `product_variants` | ProductDetail (VariantPicker), Cart, POS |
| `product_images` | ProductDetail (gallery), ProductCard |
| `categories` | Navbar dropdown, LandingPage, Filter sidebar |
| `cart_items` | CartPage, CartDrawer |
| `wishlist_items` | WishlistPage, WishlistButton |
| `orders` | MyOrders, Admin OrderList |
| `order_items` | OrderDetail, Admin OrderDetail |
| `order_histories` | OrderDetail timeline |
| `return_requests` | Admin ReturnList, Account OrderDetail |
| `return_request_images` | Admin ReturnDetail |
| `reviews` | ProductDetail (tab đánh giá), ReviewCard |
| `review_images` | ReviewCard |
| `coupons` | Checkout (apply coupon), Admin CouponList |
| `user_coupons` | Checkout (validate coupon đã dùng) |
| `notifications` | (future: bell notification) |
| `tokens` / `refresh_tokens` | axiosInstance refresh JWT |
| `otps` | Xác thực OTP (2FA) |
| `password_reset_tokens` | ForgotPasswordPage |

### Tất Cả Enum Từ DB

| Enum | Giá trị |
|------|---------|
| `orders.status` | PENDING_CONFIRMATION, PENDING_PAYMENT, PROCESSING, SHIPPING, DELIVERED, PAID, COMPLETED, CANCELLED, PAYMENT_FAILED, PAYMENT_EXPIRED |
| `orders.payment_method` | COD, VNPAY, MOMO, BANK_TRANSFER |
| `orders.type` | ONLINE, OFFLINE |
| `order_items.status` | (giống orders.status) |
| `order_items.refund_status` | NONE, PENDING, COMPLETED, FAILED |
| `products.status` | ACTIVE, INACTIVE, OUT_OF_STOCK, DISCONTINUED |
| `users.role` | ADMIN, CUSTOMER |
| `users.status` | ACTIVE, BLOCKED, PENDING |
| `return_requests.status` | PENDING, APPROVED, REJECTED, COMPLETED |
| `coupons.discount_type` | PERCENTAGE, FIXED_AMOUNT |
| `tokens.token_type` | BEARER |

---

## 7. Packages

```bash
npm install antd @ant-design/icons react-router-dom recharts xlsx axios
```

| Package | Dùng để |
|---------|---------|
| `antd` | UI admin + components customer (Carousel, Drawer, Form...) |
| `@ant-design/icons` | Icon menu, button, badge |
| `react-router-dom` | Routing v6 |
| `recharts` | Biểu đồ Dashboard |
| `xlsx` | Export Excel admin |
| `axios` | HTTP client (axiosInstance) |

---

## 8. Luồng Mock vs Real API

```
● Mock (USE_MOCK = true)
  Page → service → shared/mocks/xxxMock.js  (không cần backend)

● Real (USE_MOCK = false)
  Page → service → API_ENDPOINTS (apiConfig) → axiosInstance (JWT auto) → Spring Boot

Khi có backend: đổi USE_MOCK = false + điền REACT_APP_API_BASE_URL trong .env
Không cần sửa bất kỳ file page nào.
```

---

## 9. Thứ Tự Generate Code

```
1.  shared/constants/           ← không phụ thuộc gì
2.  shared/config/              ← apiConfig, axiosInstance
3.  shared/utils/               ← formatters, storageHelper
4.  shared/hooks/               ← useDebounce
5.  shared/mocks/               ← data giả theo DB
6.  admin/context/              ← AuthContext
7.  admin/hooks/                ← useAuth
8.  admin/config/               ← menuConfig
9.  admin/components/           ← PrivateRoute, StatusBadge, SearchBar, ActionBar...
10. admin/layouts/              ← MainLayout, Sidebar, AppHeader, AppFooter
11. admin/services/             ← productService, orderService...
12. admin/routes/               ← index + module routes
13. admin/pages/                ← LoginPage, DashboardPage, ProductListPage...
14. customer/context/           ← CustomerAuthContext, CartContext
15. customer/hooks/             ← useCustomerAuth, useCart
16. customer/components/        ← ProductCard, BannerSlider, CartDrawer...
17. customer/layouts/           ← CustomerLayout, Navbar, ShopFooter
18. customer/services/          ← shopProductService, cartService...
19. customer/routes/            ← index + module routes
20. customer/pages/             ← LandingPage, ProductListPage, CheckoutPage...
21. src/App.js                  ← phân luồng /admin/* vs /*
22. src/index.js                ← ConfigProvider 2 theme + render
```

---

*Tài liệu tổng hợp Frontend cho hệ thống Fashion E-Commerce — Admin + Customer.*  
*Cập nhật: 2025*