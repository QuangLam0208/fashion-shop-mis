// src/shared/mocks/productMock.js
export const mockProducts = [
  {
    product_id: 1, category_id: 1,
    name: 'Áo Thun Basic Trắng', description: 'Áo thun cotton 100% thoáng mát',
    base_price: 199000, sale_price: 159000, is_sale: true, status: 'ACTIVE',
    rating: 4.5, review_count: 28,
    images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400'],
  },
  {
    product_id: 2, category_id: 1,
    name: 'Áo Polo Nam Classic', description: 'Áo polo phong cách cổ điển',
    base_price: 350000, sale_price: null, is_sale: false, status: 'ACTIVE',
    rating: 4.2, review_count: 15,
    images: ['https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=400'],
  },
  {
    product_id: 3, category_id: 2,
    name: 'Quần Jeans Slim Fit', description: 'Quần jeans co giãn 4 chiều',
    base_price: 599000, sale_price: 499000, is_sale: true, status: 'ACTIVE',
    rating: 4.7, review_count: 42,
    images: ['https://images.unsplash.com/photo-1542272604-787c3835535d?w=400'],
  },
  {
    product_id: 4, category_id: 3,
    name: 'Váy Midi Hoa Nhí', description: 'Váy midi họa tiết hoa nhí duyên dáng',
    base_price: 450000, sale_price: null, is_sale: false, status: 'ACTIVE',
    rating: 4.8, review_count: 36,
    images: ['https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400'],
  },
  {
    product_id: 5, category_id: 2,
    name: 'Quần Short Thể Thao', description: 'Quần short vải thun thoáng khí',
    base_price: 249000, sale_price: 199000, is_sale: true, status: 'ACTIVE',
    rating: 4.3, review_count: 19,
    images: ['https://images.unsplash.com/photo-1591195853828-11db59a44f43?w=400'],
  },
  {
    product_id: 6, category_id: 1,
    name: 'Áo Khoác Denim', description: 'Áo khoác denim oversize phong cách',
    base_price: 799000, sale_price: null, is_sale: false, status: 'ACTIVE',
    rating: 4.6, review_count: 23,
    images: ['https://images.unsplash.com/photo-1601333144130-8cbb312386b6?w=400'],
  },
];

export const mockProductVariants = [
  { variant_id: 1, product_id: 1, color: 'Trắng', size: 'S',  price: 159000, stock_quantity: 10 },
  { variant_id: 2, product_id: 1, color: 'Trắng', size: 'M',  price: 159000, stock_quantity: 15 },
  { variant_id: 3, product_id: 1, color: 'Đen',   size: 'M',  price: 159000, stock_quantity: 8  },
  { variant_id: 4, product_id: 1, color: 'Đen',   size: 'L',  price: 159000, stock_quantity: 0  },
  { variant_id: 5, product_id: 3, color: 'Xanh',  size: '29', price: 499000, stock_quantity: 12 },
  { variant_id: 6, product_id: 3, color: 'Đen',   size: '30', price: 499000, stock_quantity: 5  },
];