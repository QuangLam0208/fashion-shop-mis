// src/shared/constants/orderConstants.js

export const ORDER_STATUS = {
  PENDING_CONFIRMATION: 'PENDING_CONFIRMATION',
  PENDING_PAYMENT:      'PENDING_PAYMENT',
  PROCESSING:           'PROCESSING',
  SHIPPING:             'SHIPPING',
  DELIVERED:            'DELIVERED',
  COMPLETED:            'COMPLETED',
  CANCELLED:            'CANCELLED',
  PAYMENT_FAILED:       'PAYMENT_FAILED',
  PAYMENT_EXPIRED:      'PAYMENT_EXPIRED',
};

export const ORDER_STATUS_LABEL = {
  PENDING_CONFIRMATION: 'Chờ xác nhận',
  PENDING_PAYMENT:      'Chờ thanh toán',
  PROCESSING:           'Đang xử lý',
  SHIPPING:             'Đang giao',
  DELIVERED:            'Đã giao',
  COMPLETED:            'Hoàn thành',
  CANCELLED:            'Đã huỷ',
  PAYMENT_FAILED:       'Thanh toán thất bại',
  PAYMENT_EXPIRED:      'Hết hạn thanh toán',
};

export const ORDER_STATUS_COLOR = {
  PENDING_CONFIRMATION: 'gold',
  PENDING_PAYMENT:      'orange',
  PROCESSING:           'blue',
  SHIPPING:             'cyan',
  DELIVERED:            'green',
  COMPLETED:            'green',
  CANCELLED:            'red',
  PAYMENT_FAILED:       'red',
  PAYMENT_EXPIRED:      'default',
};

export const PAYMENT_METHOD = {
  COD:           'COD',
  VNPAY:         'VNPAY',
  MOMO:          'MOMO',
  BANK_TRANSFER: 'BANK_TRANSFER',
};

export const PAYMENT_METHOD_LABEL = {
  COD:           'Thanh toán khi nhận hàng',
  VNPAY:         'VNPay',
  MOMO:          'MoMo',
  BANK_TRANSFER: 'Chuyển khoản ngân hàng',
};

export const ORDER_TYPE = {
  ONLINE:  'ONLINE',
  OFFLINE: 'OFFLINE',
};

/** Trạng thái cho phép huỷ */
export const CANCELLABLE_STATUSES = [
  ORDER_STATUS.PENDING_CONFIRMATION,
  ORDER_STATUS.PENDING_PAYMENT,
];

/** Trạng thái cho phép trả hàng */
export const RETURNABLE_STATUSES = [ORDER_STATUS.DELIVERED];

/** Trạng thái cho phép đánh giá */
export const REVIEWABLE_STATUSES = [
  ORDER_STATUS.DELIVERED,
  ORDER_STATUS.COMPLETED,
];

/** Tabs filter đơn hàng */
export const ORDER_TABS = [
  { key: 'ALL',                  label: 'Tất cả' },
  { key: 'PENDING_CONFIRMATION', label: 'Chờ xác nhận' },
  { key: 'PROCESSING',           label: 'Đang xử lý' },
  { key: 'SHIPPING',             label: 'Đang giao' },
  { key: 'DELIVERED',            label: 'Đã giao' },
  { key: 'CANCELLED',            label: 'Đã huỷ' },
];

export const USER_ROLE = { ADMIN: 'ADMIN', CUSTOMER: 'CUSTOMER' };
export const USER_STATUS = { ACTIVE: 'ACTIVE', BLOCKED: 'BLOCKED', PENDING: 'PENDING' };
export const USER_STATUS_LABEL = {
  ACTIVE:  'Hoạt động',
  BLOCKED: 'Đã khoá',
  PENDING: 'Chờ xác nhận',
};
export const USER_STATUS_COLOR = { ACTIVE: 'green', BLOCKED: 'red', PENDING: 'gold' };

// src/shared/constants/returnConstants.js
export const RETURN_STATUS = {
  PENDING:   'PENDING',
  APPROVED:  'APPROVED',
  REJECTED:  'REJECTED',
  COMPLETED: 'COMPLETED',
};

export const RETURN_STATUS_LABEL = {
  PENDING:   'Chờ xử lý',
  APPROVED:  'Đã duyệt',
  REJECTED:  'Từ chối',
  COMPLETED: 'Hoàn tất',
};

export const RETURN_STATUS_COLOR = {
  PENDING:   'gold',
  APPROVED:  'blue',
  REJECTED:  'red',
  COMPLETED: 'green',
};

export const RETURN_REASONS = [
  'Sản phẩm bị lỗi / hư hỏng',
  'Sản phẩm không đúng mô tả',
  'Sai màu sắc / kích thước',
  'Sản phẩm không đúng như đã đặt',
  'Không còn nhu cầu sử dụng',
  'Khác',
];

export const DISCOUNT_TYPE = {
  PERCENTAGE:   'PERCENTAGE',
  FIXED_AMOUNT: 'FIXED_AMOUNT',
};

export const DISCOUNT_TYPE_LABEL = {
  PERCENTAGE:   'Giảm theo %',
  FIXED_AMOUNT: 'Giảm số tiền cố định',
};


export const PAGE_SIZE = 12;

export const SORT_OPTIONS = [
  { value: 'newest',     label: 'Mới nhất' },
  { value: 'price_asc',  label: 'Giá tăng dần' },
  { value: 'price_desc', label: 'Giá giảm dần' },
  { value: 'rating',     label: 'Đánh giá cao' },
];

export const PRODUCT_STATUS = {
  ACTIVE:        'ACTIVE',
  INACTIVE:      'INACTIVE',
  OUT_OF_STOCK:  'OUT_OF_STOCK',
  DISCONTINUED:  'DISCONTINUED',
};

export const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '28', '29', '30', '31', '32', '34'];

export const COLORS = [
  { name: 'Trắng', hex: '#FFFFFF' },
  { name: 'Đen',   hex: '#000000' },
  { name: 'Đỏ',    hex: '#E53935' },
  { name: 'Xanh',  hex: '#1E88E5' },
  { name: 'Xanh lá', hex: '#43A047' },
  { name: 'Vàng',  hex: '#FDD835' },
  { name: 'Hồng',  hex: '#E91E63' },
  { name: 'Xám',   hex: '#9E9E9E' },
  { name: 'Be',    hex: '#D7CCC8' },
  { name: 'Nâu',   hex: '#795548' },
];

export const PRICE_RANGES = [
  { label: 'Dưới 200.000₫',          min: 0,      max: 200000  },
  { label: '200.000₫ – 500.000₫',    min: 200000, max: 500000  },
  { label: '500.000₫ – 1.000.000₫',  min: 500000, max: 1000000 },
  { label: 'Trên 1.000.000₫',        min: 1000000, max: null   },
];

export const SHIPPING_FEE = 30000; // phí ship mặc định

export const FREE_SHIP_THRESHOLD = 500000; // miễn phí ship từ