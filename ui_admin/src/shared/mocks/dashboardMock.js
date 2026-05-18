// src/shared/mocks/dashboardMock.js
export const mockDashboardStats = {
  total_revenue:   125600000,
  total_orders:    348,
  total_customers: 156,
  total_products:  89,
  pending_orders:  24,
  revenue_growth:  12.5,
  order_growth:    8.3,
};

export const mockRevenueData = [
  { month: 'T1', revenue: 8500000 },
  { month: 'T2', revenue: 9200000 },
  { month: 'T3', revenue: 11000000 },
  { month: 'T4', revenue: 10300000 },
  { month: 'T5', revenue: 13800000 },
  { month: 'T6', revenue: 12100000 },
  { month: 'T7', revenue: 14500000 },
  { month: 'T8', revenue: 15200000 },
  { month: 'T9', revenue: 13900000 },
  { month: 'T10', revenue: 16400000 },
  { month: 'T11', revenue: 18700000 },
  { month: 'T12', revenue: 21000000 },
];

export const mockTopProducts = [
  { product_id: 3, name: 'Quần Jeans Slim Fit',   sold: 124, revenue: 61876000 },
  { product_id: 1, name: 'Áo Thun Basic Trắng',   sold: 98,  revenue: 15582000 },
  { product_id: 4, name: 'Váy Midi Hoa Nhí',       sold: 76,  revenue: 34200000 },
  { product_id: 6, name: 'Áo Khoác Denim',         sold: 54,  revenue: 43146000 },
  { product_id: 2, name: 'Áo Polo Nam Classic',    sold: 43,  revenue: 15050000 },
];

export const mockOrderStatusData = [
  { status: 'PENDING_CONFIRMATION', count: 24, label: 'Chờ xác nhận' },
  { status: 'PROCESSING',           count: 38, label: 'Đang xử lý'   },
  { status: 'SHIPPING',             count: 52, label: 'Đang giao'     },
  { status: 'DELIVERED',            count: 198, label: 'Đã giao'      },
  { status: 'CANCELLED',            count: 36, label: 'Đã huỷ'        },
];