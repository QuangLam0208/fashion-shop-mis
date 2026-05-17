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