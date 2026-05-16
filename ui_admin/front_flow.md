# 📋 Fashion Admin — Tài Liệu Dự Án Frontend

> **Stack:** ReactJS (CRA) · Ant Design · React Router v6 · Recharts  
> **Khởi chạy:** `npm start`  
> **Mock data:** `USE_MOCK = true` trong `config/apiConfig.js` — đổi `false` khi có backend

---

## 1. Cây Thư Mục

```
fashion-admin/
├── .env                          # REACT_APP_API_BASE_URL=http://localhost:8080
├── .gitignore
├── package.json
├── public/
│   ├── index.html
│   └── favicon.ico
└── src/
    ├── index.js                  # Entry point
    ├── App.js                    # Chỉ render <AppRoutes />
    ├── index.css                 # Global reset + antd ConfigProvider token
    │
    ├── config/                   # ★ Cấu hình trung tâm
    │   ├── apiConfig.js          # USE_MOCK flag + toàn bộ API_ENDPOINTS
    │   ├── menuConfig.js         # MENU_ITEMS cho Sidebar
    │   └── axiosInstance.js      # Axios base + JWT interceptor + xử lý 401
    │
    ├── routes/                   # ★ Quản lý điều hướng
    │   ├── index.js              # AppRoutes: gom tất cả, bọc MainLayout + PrivateRoute
    │   ├── dashboardRoutes.js
    │   ├── productRoutes.js
    │   ├── categoryRoutes.js
    │   ├── orderRoutes.js
    │   ├── returnRoutes.js
    │   ├── userRoutes.js
    │   └── couponRoutes.js
    │
    ├── mocks/                    # Data giả theo DB schema (dùng khi USE_MOCK=true)
    │   ├── dashboardMock.js
    │   ├── productMock.js
    │   ├── categoryMock.js
    │   ├── orderMock.js
    │   ├── returnMock.js
    │   ├── userMock.js
    │   └── couponMock.js
    │
    ├── constants/                # Enum / hằng số từ DB
    │   ├── orderConstants.js
    │   ├── userConstants.js
    │   ├── returnConstants.js
    │   ├── couponConstants.js
    │   └── appConstants.js
    │
    ├── layouts/                  # Khung giao diện chính
    │   ├── MainLayout.js         # Sider + Header + <Outlet/> + Footer
    │   ├── Sidebar.js            # Menu antd đọc từ menuConfig
    │   ├── AppHeader.js          # Logo, avatar, notification, logout
    │   └── AppFooter.js          # Copyright
    │
    ├── pages/                    # Các màn hình
    │   ├── LoginPage.js
    │   ├── NotFoundPage.js
    │   ├── dashboard/
    │   │   └── DashboardPage.js
    │   ├── products/
    │   │   ├── ProductListPage.js
    │   │   └── ProductFormPage.js
    │   ├── categories/
    │   │   └── CategoryListPage.js
    │   ├── orders/
    │   │   ├── OrderListPage.js
    │   │   ├── OrderDetailPage.js
    │   │   └── OrderCreatePage.js  # POS
    │   ├── returns/
    │   │   ├── ReturnListPage.js
    │   │   └── ReturnDetailPage.js
    │   ├── users/
    │   │   ├── UserListPage.js
    │   │   └── UserDetailPage.js
    │   └── coupons/
    │       ├── CouponListPage.js
    │       └── CouponFormPage.js
    │
    ├── components/               # UI tái sử dụng
    │   ├── PageHeader.js         # Breadcrumb + tiêu đề trang
    │   ├── SearchBar.js          # Ô filter + Tìm kiếm + Xoá lọc (trái)
    │   ├── ActionBar.js          # Thêm mới + Export (phải)
    │   ├── StatusBadge.js        # Tag màu theo status
    │   ├── ConfirmModal.js       # Modal xác nhận xoá / khoá
    │   ├── StatCard.js           # KPI card cho Dashboard
    │   └── PrivateRoute.js       # Guard: chưa login → /login
    │
    ├── services/                 # Gọi API (mock hoặc real)
    │   ├── authService.js
    │   ├── productService.js
    │   ├── categoryService.js
    │   ├── orderService.js
    │   ├── returnService.js
    │   ├── userService.js
    │   ├── couponService.js
    │   └── dashboardService.js
    │
    ├── context/
    │   └── AuthContext.js        # currentUser, token, login(), logout()
    │
    ├── hooks/
    │   ├── useAuth.js            # useContext(AuthContext)
    │   └── useDebounce.js        # debounce search input 400ms
    │
    └── utils/
        ├── formatters.js         # formatCurrency, formatDate, formatPhone
        ├── exportExcel.js        # Export table → .xlsx
        └── storageHelper.js      # get/set/clear token localStorage
```

---

## 2. Luồng Dữ Liệu

```
● Mock mode  (USE_MOCK = true)
  Page → service.js → mocks/xxxMock.js  (data tĩnh, không cần backend)

● Real mode  (USE_MOCK = false)
  Page → service.js → API_ENDPOINTS (apiConfig.js) → axiosInstance (JWT auto) → Spring Boot
```

**Khi có backend**, chỉ cần:
1. Sửa `USE_MOCK = false` trong `config/apiConfig.js`
2. Điền `REACT_APP_API_BASE_URL=http://localhost:8080` trong `.env`
3. Không cần sửa bất kỳ file page nào.

---

## 3. Routes

### `routes/index.js` — Trung tâm điều hướng
```
<Routes>
  <Route path="/login"   element={<LoginPage />} />
  <Route element={<PrivateRoute />}>
    <Route element={<MainLayout />}>
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

### Bảng Routes chi tiết

| File | Path | Component |
|------|------|-----------|
| `dashboardRoutes.js` | `/admin/dashboard` | `DashboardPage` |
| `productRoutes.js` | `/admin/products` | `ProductListPage` |
| | `/admin/products/create` | `ProductFormPage` |
| | `/admin/products/:id/edit` | `ProductFormPage` |
| `categoryRoutes.js` | `/admin/categories` | `CategoryListPage` |
| `orderRoutes.js` | `/admin/orders` | `OrderListPage` |
| | `/admin/orders/create` | `OrderCreatePage` (POS) |
| | `/admin/orders/:id` | `OrderDetailPage` |
| `returnRoutes.js` | `/admin/returns` | `ReturnListPage` |
| | `/admin/returns/:id` | `ReturnDetailPage` |
| `userRoutes.js` | `/admin/users` | `UserListPage` |
| | `/admin/users/:id` | `UserDetailPage` |
| `couponRoutes.js` | `/admin/coupons` | `CouponListPage` |
| | `/admin/coupons/create` | `CouponFormPage` |
| | `/admin/coupons/:id/edit` | `CouponFormPage` |

---

## 4. Config

### `config/apiConfig.js`
```js
export const USE_MOCK = true; // ← đổi false khi có backend

const BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN:          `${BASE}/api/auth/login`,
    LOGOUT:         `${BASE}/api/auth/logout`,
    REFRESH:        `${BASE}/api/auth/refresh`,
  },
  DASHBOARD: {
    STATS:          `${BASE}/api/admin/dashboard/stats`,
    REVENUE:        `${BASE}/api/admin/dashboard/revenue`,
    TOP_PRODUCTS:   `${BASE}/api/admin/dashboard/top-products`,
  },
  PRODUCTS: {
    GET_ALL:        `${BASE}/api/admin/products`,
    GET_BY_ID:      (id) => `${BASE}/api/admin/products/${id}`,
    CREATE:         `${BASE}/api/admin/products`,
    UPDATE:         (id) => `${BASE}/api/admin/products/${id}`,
    DELETE:         (id) => `${BASE}/api/admin/products/${id}`,
  },
  CATEGORIES: {
    GET_ALL:        `${BASE}/api/admin/categories`,
    GET_BY_ID:      (id) => `${BASE}/api/admin/categories/${id}`,
    CREATE:         `${BASE}/api/admin/categories`,
    UPDATE:         (id) => `${BASE}/api/admin/categories/${id}`,
    DELETE:         (id) => `${BASE}/api/admin/categories/${id}`,
  },
  ORDERS: {
    GET_ALL:        `${BASE}/api/admin/orders`,
    GET_BY_ID:      (id) => `${BASE}/api/admin/orders/${id}`,
    CREATE:         `${BASE}/api/admin/orders`,          // POS
    UPDATE_STATUS:  (id) => `${BASE}/api/admin/orders/${id}/status`,
    CANCEL:         (id) => `${BASE}/api/admin/orders/${id}/cancel`,
  },
  RETURNS: {
    GET_ALL:        `${BASE}/api/admin/returns`,
    GET_BY_ID:      (id) => `${BASE}/api/admin/returns/${id}`,
    APPROVE:        (id) => `${BASE}/api/admin/returns/${id}/approve`,
    REJECT:         (id) => `${BASE}/api/admin/returns/${id}/reject`,
    COMPLETE:       (id) => `${BASE}/api/admin/returns/${id}/complete`,
  },
  USERS: {
    GET_ALL:        `${BASE}/api/admin/users`,
    GET_BY_ID:      (id) => `${BASE}/api/admin/users/${id}`,
    TOGGLE_STATUS:  (id) => `${BASE}/api/admin/users/${id}/toggle-status`,
    GET_ORDERS:     (id) => `${BASE}/api/admin/users/${id}/orders`,
  },
  COUPONS: {
    GET_ALL:        `${BASE}/api/admin/coupons`,
    GET_BY_ID:      (id) => `${BASE}/api/admin/coupons/${id}`,
    CREATE:         `${BASE}/api/admin/coupons`,
    UPDATE:         (id) => `${BASE}/api/admin/coupons/${id}`,
    DELETE:         (id) => `${BASE}/api/admin/coupons/${id}`,
  },
};
```

### `config/menuConfig.js`
```js
import {
  DashboardOutlined, ShoppingOutlined, TagsOutlined,
  OrderedListOutlined, RollbackOutlined, UserOutlined, GiftOutlined,
} from '@ant-design/icons';

export const MENU_ITEMS = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    icon: <DashboardOutlined />,
    path: '/admin/dashboard',
  },
  {
    key: 'products',
    label: 'Sản phẩm',
    icon: <ShoppingOutlined />,
    children: [
      { key: 'product-list',     label: 'Danh sách',  path: '/admin/products' },
      { key: 'category-list',    label: 'Danh mục',   path: '/admin/categories' },
    ],
  },
  {
    key: 'orders',
    label: 'Đơn hàng',
    icon: <OrderedListOutlined />,
    children: [
      { key: 'order-list',   label: 'Danh sách đơn', path: '/admin/orders' },
      { key: 'order-create', label: 'Tạo đơn (POS)', path: '/admin/orders/create' },
    ],
  },
  {
    key: 'returns',
    label: 'Trả hàng',
    icon: <RollbackOutlined />,
    path: '/admin/returns',
  },
  {
    key: 'users',
    label: 'Người dùng',
    icon: <UserOutlined />,
    path: '/admin/users',
  },
  {
    key: 'coupons',
    label: 'Khuyến mãi',
    icon: <GiftOutlined />,
    path: '/admin/coupons',
  },
];
```

---

## 5. Constants (từ DB Schema)

### `constants/orderConstants.js`
```js
export const ORDER_STATUS = {
  PENDING_CONFIRMATION: { label: 'Chờ xác nhận',   color: 'gold' },
  PENDING_PAYMENT:      { label: 'Chờ thanh toán',  color: 'orange' },
  PROCESSING:           { label: 'Đang xử lý',      color: 'blue' },
  SHIPPING:             { label: 'Đang giao',        color: 'cyan' },
  DELIVERED:            { label: 'Đã giao',          color: 'green' },
  PAID:                 { label: 'Đã thanh toán',    color: 'green' },
  COMPLETED:            { label: 'Hoàn thành',       color: 'green' },
  CANCELLED:            { label: 'Đã huỷ',           color: 'red' },
  PAYMENT_FAILED:       { label: 'Thanh toán lỗi',   color: 'red' },
  PAYMENT_EXPIRED:      { label: 'Hết hạn TT',       color: 'default' },
};

export const PAYMENT_METHOD = {
  COD:           'Tiền mặt (COD)',
  VNPAY:         'VNPay',
  MOMO:          'MoMo',
  BANK_TRANSFER: 'Chuyển khoản',
};

export const ORDER_TYPE = {
  ONLINE:  'Online',
  OFFLINE: 'Tại quầy',
};
```

### `constants/userConstants.js`
```js
export const USER_STATUS = {
  ACTIVE:  { label: 'Hoạt động', color: 'green' },
  BLOCKED: { label: 'Bị khoá',   color: 'red' },
  PENDING: { label: 'Chờ xác nhận', color: 'orange' },
};

export const USER_ROLE = {
  ADMIN:    'Admin',
  CUSTOMER: 'Khách hàng',
};
```

### `constants/returnConstants.js`
```js
export const RETURN_STATUS = {
  PENDING:  { label: 'Chờ duyệt',   color: 'gold' },
  APPROVED: { label: 'Đã duyệt',    color: 'blue' },
  REJECTED: { label: 'Từ chối',     color: 'red' },
  COMPLETED:{ label: 'Hoàn thành',  color: 'green' },
};

export const REFUND_STATUS = {
  NONE:      { label: 'Chưa hoàn',   color: 'default' },
  PENDING:   { label: 'Đang xử lý',  color: 'orange' },
  COMPLETED: { label: 'Đã hoàn',     color: 'green' },
  FAILED:    { label: 'Thất bại',    color: 'red' },
};
```

### `constants/couponConstants.js`
```js
export const DISCOUNT_TYPE = {
  PERCENTAGE:   { label: 'Phần trăm (%)',   icon: '%' },
  FIXED_AMOUNT: { label: 'Số tiền cố định', icon: '₫' },
};
```

### `constants/appConstants.js`
```js
export const PAGE_SIZE      = 10;
export const DATE_FORMAT    = 'DD/MM/YYYY';
export const DATETIME_FORMAT= 'DD/MM/YYYY HH:mm';
export const CURRENCY       = 'VND';
export const APP_NAME       = 'Fashion Admin';
```

---

## 6. Mocks (cấu trúc theo DB Schema)

### `mocks/productMock.js` — cấu trúc mẫu
```js
export const mockProducts = [
  {
    product_id: 1,
    name: 'Áo Thun Basic',
    description: 'Áo thun cotton 100%',
    status: 'ACTIVE',                         // ACTIVE | INACTIVE | OUT_OF_STOCK | DISCONTINUED
    category_id: 2,
    category_name: 'Áo Phông',
    variants: [
      { variant_id: 1, color: 'Trắng', size: 'M', price: 199000, stock_quantity: 50 },
      { variant_id: 2, color: 'Trắng', size: 'L', price: 199000, stock_quantity: 30 },
      { variant_id: 3, color: 'Đen',   size: 'M', price: 199000, stock_quantity: 20 },
    ],
    images: [
      { image_id: 1, url: 'https://placehold.co/300x400', color: 'Trắng' },
    ],
  },
];
```

### `mocks/orderMock.js` — cấu trúc mẫu
```js
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
    items: [
      {
        order_item_id: 1,
        product_name: 'Áo Thun Basic',
        variant_id: 1,
        color: 'Trắng', size: 'M',
        quantity: 2,
        price: 199000,
        status: 'DELIVERED',
        is_reviewed: false,
        refund_status: 'NONE',
      },
    ],
  },
];
```

### `mocks/userMock.js` — cấu trúc mẫu
```js
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
```

### `mocks/couponMock.js` — cấu trúc mẫu
```js
export const mockCoupons = [
  {
    coupon_id: 1,
    code: 'SUMMER20',
    discount_type: 'PERCENTAGE',
    discount_value: 20,
    min_order_amount: 300000,
    usage_limit: 100,
    start_date: '2025-06-01T00:00:00',
    expiry_date: '2025-08-31T23:59:59',
    active: true,
  },
  {
    coupon_id: 2,
    code: 'GIAM50K',
    discount_type: 'FIXED_AMOUNT',
    discount_value: 50000,
    min_order_amount: 200000,
    usage_limit: 50,
    start_date: '2025-04-01T00:00:00',
    expiry_date: '2025-05-01T23:59:59',
    active: false,
  },
];
```

---

## 7. Services — Cách viết chuẩn

```js
// services/productService.js
import { USE_MOCK, API_ENDPOINTS } from '../config/apiConfig';
import axiosInstance from '../config/axiosInstance';
import { mockProducts } from '../mocks/productMock';

export const productService = {
  getAll: async (params) => {
    if (USE_MOCK) return { data: mockProducts, total: mockProducts.length };
    const res = await axiosInstance.get(API_ENDPOINTS.PRODUCTS.GET_ALL, { params });
    return res.data;
  },

  getById: async (id) => {
    if (USE_MOCK) return mockProducts.find(p => p.product_id === Number(id));
    const res = await axiosInstance.get(API_ENDPOINTS.PRODUCTS.GET_BY_ID(id));
    return res.data;
  },

  create: async (data) => {
    if (USE_MOCK) return { ...data, product_id: Date.now() };
    const res = await axiosInstance.post(API_ENDPOINTS.PRODUCTS.CREATE, data);
    return res.data;
  },

  update: async (id, data) => {
    if (USE_MOCK) return { ...data, product_id: id };
    const res = await axiosInstance.put(API_ENDPOINTS.PRODUCTS.UPDATE(id), data);
    return res.data;
  },

  delete: async (id) => {
    if (USE_MOCK) return { success: true };
    const res = await axiosInstance.delete(API_ENDPOINTS.PRODUCTS.DELETE(id));
    return res.data;
  },
};
```

---

## 8. Layout — Cấu trúc MainLayout

```
┌─────────────────────────────────────────────────────────┐
│  AppHeader  (logo · tên admin · notification · logout)  │
├──────────────┬──────────────────────────────────────────┤
│              │  Breadcrumb (PageHeader component)        │
│   Sidebar    │─────────────────────────────────────────  │
│   (Sider     │  ┌──────────────────────────────────┐    │
│    antd)     │  │  SearchBar    │    ActionBar      │    │
│              │  │  (trái)       │    (phải)         │    │
│  - Dashboard │  └──────────────────────────────────┘    │
│  - Sản phẩm  │                                           │
│    - D.sách  │  Table / Form / Detail content            │
│    - D.mục   │  (<Outlet /> từ react-router)             │
│  - Đơn hàng  │                                           │
│  - Trả hàng  │                                           │
│  - Người dùng│                                           │
│  - Khuyến mãi│                                           │
├──────────────┴──────────────────────────────────────────┤
│  AppFooter  (© 2025 Fashion Admin · v1.0.0)             │
└─────────────────────────────────────────────────────────┘
```

---

## 9. Các Trang — Chức Năng Chi Tiết

### 9.1 Dashboard (`/admin/dashboard`)
- **StatCard:** Tổng doanh thu, Tổng đơn hàng, Số khách hàng, Đơn chờ xử lý
- **Biểu đồ:** Doanh thu theo tháng (LineChart / BarChart — Recharts)
- **Bảng:** Top 5 sản phẩm bán chạy
- **Thống kê:** Số đơn theo từng trạng thái (donut chart)

### 9.2 Quản lý Sản phẩm (`/admin/products`)
**ProductListPage:**
- SearchBar: tìm theo tên, lọc theo danh mục, trạng thái
- ActionBar: Thêm sản phẩm, Export Excel
- Table: tên, danh mục, số variants, trạng thái, hành động (Sửa, Xoá)

**ProductFormPage (`/admin/products/create` | `/:id/edit`):**
- Form: tên, mô tả, danh mục, trạng thái
- Bảng variants: thêm/sửa/xoá (màu, size, giá, tồn kho)
- Upload ảnh theo màu

### 9.3 Quản lý Danh mục (`/admin/categories`)
**CategoryListPage:**
- SearchBar: tìm theo tên
- ActionBar: Thêm danh mục
- Hiển thị dạng Tree (cha → con) hoặc Table với cột parent
- Inline edit tên, chọn danh mục cha
- Xoá (kiểm tra ràng buộc sản phẩm)

### 9.4 Quản lý Đơn hàng (`/admin/orders`)
**OrderListPage:**
- SearchBar: tìm theo mã đơn / khách hàng, lọc theo status, ngày đặt, loại (ONLINE/OFFLINE)
- ActionBar: Tạo đơn (POS), Export Excel
- Table: mã đơn, khách hàng, ngày đặt, tổng tiền, PTTT, loại, trạng thái
- Click vào dòng → OrderDetailPage

**OrderDetailPage (`/admin/orders/:id`):**
- Thông tin đơn hàng, địa chỉ giao, phương thức thanh toán
- Danh sách sản phẩm trong đơn
- Lịch sử thay đổi trạng thái (`order_histories`)
- Nút cập nhật trạng thái / huỷ đơn

**OrderCreatePage — POS (`/admin/orders/create`):**
- Tìm kiếm sản phẩm nhanh, chọn variant (màu, size)
- Giỏ hàng tạm, cập nhật số lượng
- Thông tin khách hàng (tuỳ chọn)
- Chọn phương thức thanh toán (mặc định COD)
- Xác nhận → tạo đơn type=OFFLINE, status=COMPLETED
- Xuất hoá đơn PDF

### 9.5 Quản lý Trả hàng (`/admin/returns`)
**ReturnListPage:**
- SearchBar: lọc theo RETURN_STATUS, ngày yêu cầu
- Table: mã yêu cầu, khách hàng, đơn hàng, lý do, ngày, trạng thái

**ReturnDetailPage (`/admin/returns/:id`):**
- Thông tin yêu cầu: lý do, mô tả, hình ảnh minh chứng
- Thông tin đơn hàng gốc
- Nút: Duyệt (APPROVED) / Từ chối + nhập lý do (REJECTED)
- Sau duyệt: xác nhận đã nhận hàng → COMPLETED
- Trạng thái hoàn tiền (`refund_status`)

### 9.6 Quản lý Người dùng (`/admin/users`)
**UserListPage:**
- SearchBar: tìm theo tên, email, số điện thoại; lọc theo status
- Table: avatar, họ tên, email, SĐT, trạng thái, hành động
- Nút Khoá / Mở khoá ngay trong bảng

**UserDetailPage (`/admin/users/:id`):**
- Thông tin tài khoản: email, SĐT, trạng thái, xác thực email
- Lịch sử đơn hàng của khách (mini table)
- Nút Khoá / Mở khoá

### 9.7 Quản lý Khuyến mãi (`/admin/coupons`)
**CouponListPage:**
- SearchBar: tìm theo mã code, lọc theo loại giảm giá, trạng thái (còn HH / hết HH)
- ActionBar: Thêm voucher, Export
- Table: mã, loại, giá trị, đơn tối thiểu, ngày HH, giới hạn, trạng thái

**CouponFormPage (`/admin/coupons/create` | `/:id/edit`):**
- Form: mã code, loại (PERCENTAGE / FIXED_AMOUNT), giá trị
- Đơn hàng tối thiểu, giới hạn lượt dùng
- DateRangePicker: ngày bắt đầu — ngày hết hạn
- Toggle kích hoạt / tắt

---

## 10. Components Dùng Chung

### `PageHeader`
```jsx
<PageHeader
  breadcrumbs={[
    { label: 'Trang chủ', path: '/admin/dashboard' },
    { label: 'Sản phẩm',  path: '/admin/products' },
    { label: 'Thêm mới' },
  ]}
  title="Thêm sản phẩm"
/>
```

### `SearchBar` + `ActionBar` (layout mỗi trang list)
```jsx
<div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
  <SearchBar
    fields={[
      { name: 'keyword', placeholder: 'Tên sản phẩm...', type: 'input' },
      { name: 'status',  placeholder: 'Trạng thái',      type: 'select', options: [...] },
    ]}
    onSearch={handleSearch}
    onReset={handleReset}
  />
  <ActionBar
    onAdd={() => navigate('/admin/products/create')}
    onExport={handleExport}
  />
</div>
```

### `StatusBadge`
```jsx
// Tự động lấy màu và label từ constants
<StatusBadge type="order" status="DELIVERED" />
<StatusBadge type="user"  status="BLOCKED" />
<StatusBadge type="return" status="APPROVED" />
```

---

## 11. DB Schema Tóm Tắt (liên quan Admin)

| Bảng | Dùng ở trang |
|------|-------------|
| `users` | UserList, UserDetail, Login |
| `products` | ProductList, ProductForm, POS |
| `product_variants` | ProductForm, POS (chọn variant) |
| `product_images` | ProductForm (upload ảnh) |
| `categories` | CategoryList, ProductForm (chọn danh mục) |
| `orders` | OrderList, OrderDetail, OrderCreate(POS) |
| `order_items` | OrderDetail |
| `order_histories` | OrderDetail (timeline trạng thái) |
| `return_requests` | ReturnList, ReturnDetail |
| `return_request_images` | ReturnDetail (ảnh minh chứng) |
| `coupons` | CouponList, CouponForm |
| `user_coupons` | (tham khảo khi tạo đơn POS) |

### Enums từ DB (đã map vào constants)

| Enum | Giá trị |
|------|---------|
| `orders.status` | PENDING_CONFIRMATION, PENDING_PAYMENT, PROCESSING, SHIPPING, DELIVERED, PAID, COMPLETED, CANCELLED, PAYMENT_FAILED, PAYMENT_EXPIRED |
| `orders.payment_method` | COD, VNPAY, MOMO, BANK_TRANSFER |
| `orders.type` | ONLINE, OFFLINE |
| `products.status` | ACTIVE, INACTIVE, OUT_OF_STOCK, DISCONTINUED |
| `users.status` | ACTIVE, BLOCKED, PENDING |
| `users.role` | ADMIN, CUSTOMER |
| `return_requests.status` | PENDING, APPROVED, REJECTED, COMPLETED |
| `order_items.refund_status` | NONE, PENDING, COMPLETED, FAILED |
| `coupons.discount_type` | PERCENTAGE, FIXED_AMOUNT |

---

## 12. Packages Cần Cài

```bash
npm install antd @ant-design/icons react-router-dom recharts xlsx
```

| Package | Dùng để |
|---------|---------|
| `antd` | UI component library chính |
| `@ant-design/icons` | Icon cho menu, button, badge |
| `react-router-dom` | Routing (v6) |
| `recharts` | Biểu đồ Dashboard |
| `xlsx` | Export bảng ra file .xlsx |
| `axios` | HTTP client (đã đi kèm khi setup axiosInstance) |

---

## 13. Thứ Tự Generate Code

Khi bắt đầu code, làm theo thứ tự sau để tránh lỗi import:

```
1. constants/         ← không phụ thuộc gì
2. config/            ← apiConfig, menuConfig, axiosInstance
3. mocks/             ← dùng constants
4. utils/             ← độc lập
5. context/           ← AuthContext
6. hooks/             ← dùng context
7. components/        ← PrivateRoute, StatusBadge, SearchBar, ActionBar, PageHeader, StatCard, ConfirmModal
8. layouts/           ← dùng menuConfig, hooks
9. routes/            ← dùng layouts, components, pages
10. pages/            ← dùng tất cả phía trên
11. App.js            ← import AppRoutes
12. index.js          ← render App
```

---

*Tài liệu này tổng hợp toàn bộ thiết kế frontend Admin cho hệ thống Fashion E-Commerce.*  
*Cập nhật lần cuối: 2025*