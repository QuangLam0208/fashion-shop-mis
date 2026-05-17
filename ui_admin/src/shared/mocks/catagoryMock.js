// src/shared/mocks/categoryMock.js
export const mockCategories = [
  { category_id: 1, name: 'Áo',    parent_id: null, image: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=300', description: 'Các loại áo' },
  { category_id: 2, name: 'Quần',  parent_id: null, image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=300', description: 'Các loại quần' },
  { category_id: 3, name: 'Váy',   parent_id: null, image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=300', description: 'Các loại váy' },
  { category_id: 4, name: 'Áo Thun',    parent_id: 1, image: null, description: 'Áo thun các loại' },
  { category_id: 5, name: 'Áo Polo',    parent_id: 1, image: null, description: 'Áo polo nam nữ' },
  { category_id: 6, name: 'Áo Khoác',   parent_id: 1, image: null, description: 'Áo khoác, jacket' },
  { category_id: 7, name: 'Quần Jeans', parent_id: 2, image: null, description: 'Quần jeans denim' },
  { category_id: 8, name: 'Quần Short', parent_id: 2, image: null, description: 'Quần short thể thao' },
];