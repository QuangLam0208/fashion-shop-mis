// src/shared/mocks/orderMock.js
export const mockOrders = [
  {
    order_id: 1001, user_id: 2,
    status: 'DELIVERED', payment_method: 'COD', type: 'ONLINE',
    total_amount: 817000, discount_amount: 0, final_amount: 817000,
    shipping_address: '123 Nguyễn Huệ, Q1, TP.HCM',
    created_at: '2024-05-01T09:00:00', updated_at: '2024-05-03T14:00:00',
    items: [
      { order_item_id: 1, product_id: 1, variant_id: 1, name: 'Áo Thun Basic Trắng', color: 'Trắng', size: 'M', quantity: 2, unit_price: 159000, subtotal: 318000 },
      { order_item_id: 2, product_id: 3, variant_id: 5, name: 'Quần Jeans Slim Fit',  color: 'Xanh',  size: '30', quantity: 1, unit_price: 499000, subtotal: 499000 },
    ],
  },
  {
    order_id: 1002, user_id: 3,
    status: 'PROCESSING', payment_method: 'VNPAY', type: 'ONLINE',
    total_amount: 450000, discount_amount: 50000, final_amount: 400000,
    shipping_address: '456 Lê Lợi, Q3, TP.HCM',
    created_at: '2024-05-10T11:30:00', updated_at: '2024-05-10T11:31:00',
    items: [
      { order_item_id: 3, product_id: 4, variant_id: null, name: 'Váy Midi Hoa Nhí', color: 'Hồng', size: 'M', quantity: 1, unit_price: 450000, subtotal: 450000 },
    ],
  },
  {
    order_id: 1003, user_id: 2,
    status: 'PENDING_CONFIRMATION', payment_method: 'COD', type: 'ONLINE',
    total_amount: 199000, discount_amount: 0, final_amount: 199000,
    shipping_address: '123 Nguyễn Huệ, Q1, TP.HCM',
    created_at: '2024-05-12T08:00:00', updated_at: '2024-05-12T08:00:00',
    items: [
      { order_item_id: 4, product_id: 5, variant_id: null, name: 'Quần Short Thể Thao', color: 'Đen', size: 'L', quantity: 1, unit_price: 199000, subtotal: 199000 },
    ],
  },
];