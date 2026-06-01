SET FOREIGN_KEY_CHECKS = 0;

-- Xóa dữ liệu cũ
TRUNCATE TABLE addresses;
TRUNCATE TABLE cart_items;
TRUNCATE TABLE categories;
TRUNCATE TABLE coupons;
TRUNCATE TABLE email_logs;
TRUNCATE TABLE notifications;
TRUNCATE TABLE order_histories;
TRUNCATE TABLE order_items;
TRUNCATE TABLE orders;
TRUNCATE TABLE otps;
TRUNCATE TABLE password_reset_tokens;
TRUNCATE TABLE product_images;
TRUNCATE TABLE product_variants;
TRUNCATE TABLE products;
TRUNCATE TABLE recently_viewed_items;
TRUNCATE TABLE refresh_tokens;
TRUNCATE TABLE return_request_images;
TRUNCATE TABLE return_requests;
TRUNCATE TABLE review_images;
TRUNCATE TABLE reviews;
TRUNCATE TABLE tokens;
TRUNCATE TABLE user_coupons;
TRUNCATE TABLE users;
TRUNCATE TABLE wishlist_items;

-- ========================================================
-- 1. USERS (30 Dòng)
-- ========================================================
-- pass admin + cus: 123456
INSERT INTO `users` (`user_id`, `email`, `full_name`, `password`, `phone`, `role`, `status`, `email_verified`, `two_factor_enabled`) VALUES
(1, 'admin@fashion.com', 'Admin', '$2a$12$Q7WrBwIlYS8C24yRPtw8R.f3EIthr39JuGpyD16PSMyPL75cZYT16', '0900009001', 'ADMIN', 'ACTIVE', 1, 0), 
(2, 'admin2@fashion.com', 'Admin Quản Lý', '$2a$10$hashed2', '0900000002', 'ADMIN', 'ACTIVE', 1, 0),
(3, 'customer@gmail.com', 'Nguyễn Trọng A', '$2a$10$wY1txQsroSlcdRys6q.CQuDk9Y4K4nJk6zX4/zH5J4g5r4p/K3zI6', '0900000003', 'CUSTOMER', 'ACTIVE', 1, 0),
(4, 'khach04@gmail.com', 'Lê Thị B', '$2a$10$hashed4', '0900000004', 'CUSTOMER', 'ACTIVE', 1, 0),
(5, 'khach05@gmail.com', 'Trần Văn C', '$2a$10$hashed5', '0900000005', 'CUSTOMER', 'ACTIVE', 1, 0),
(6, 'khach06@gmail.com', 'Phạm Quỳnh D', '$2a$10$hashed6', '0900000006', 'CUSTOMER', 'ACTIVE', 1, 0),
(7, 'khach07@gmail.com', 'Hoàng Bảo E', '$2a$10$hashed7', '0900000007', 'CUSTOMER', 'BLOCKED', 1, 0),
(8, 'khach08@gmail.com', 'Vũ Đức F', '$2a$10$hashed8', '0900000008', 'CUSTOMER', 'ACTIVE', 1, 0),
(9, 'khach09@gmail.com', 'Đặng Ngọc G', '$2a$10$hashed9', '0900000009', 'CUSTOMER', 'PENDING', 0, 0),
(10, 'khach10@gmail.com', 'Bùi Xuân H', '$2a$10$hashed10', '0900000010', 'CUSTOMER', 'ACTIVE', 1, 0),
(11, 'khach11@gmail.com', 'Đỗ Minh I', '$2a$10$hashed11', '0900000011', 'CUSTOMER', 'ACTIVE', 1, 0),
(12, 'khach12@gmail.com', 'Hồ Thúy J', '$2a$10$hashed12', '0900000012', 'CUSTOMER', 'ACTIVE', 1, 0),
(13, 'khach13@gmail.com', 'Ngô Kiến K', '$2a$10$hashed13', '0900000013', 'CUSTOMER', 'ACTIVE', 1, 0),
(14, 'khach14@gmail.com', 'Dương Thảo L', '$2a$10$hashed14', '0900000014', 'CUSTOMER', 'ACTIVE', 1, 0),
(15, 'khach15@gmail.com', 'Lý Hải M', '$2a$10$hashed15', '0900000015', 'CUSTOMER', 'ACTIVE', 1, 0),
(16, 'khach16@gmail.com', 'Vương Phi N', '$2a$10$hashed16', '0900000016', 'CUSTOMER', 'BLOCKED', 1, 0),
(17, 'khach17@gmail.com', 'Đinh Tiến O', '$2a$10$hashed17', '0900000017', 'CUSTOMER', 'ACTIVE', 1, 0),
(18, 'khach18@gmail.com', 'Lâm Tâm P', '$2a$10$hashed18', '0900000018', 'CUSTOMER', 'PENDING', 0, 0),
(19, 'khach19@gmail.com', 'Trương Quốc Q', '$2a$10$hashed19', '0900000019', 'CUSTOMER', 'ACTIVE', 1, 0),
(20, 'khach20@gmail.com', 'Phan Thanh R', '$2a$10$hashed20', '0900000020', 'CUSTOMER', 'ACTIVE', 1, 0),
(21, 'khach21@gmail.com', 'Mai Phương S', '$2a$10$hashed21', '0900000021', 'CUSTOMER', 'ACTIVE', 1, 0),
(22, 'khach22@gmail.com', 'Đào Trọng T', '$2a$10$hashed22', '0900000022', 'CUSTOMER', 'ACTIVE', 1, 0),
(23, 'khach23@gmail.com', 'Tô Lan U', '$2a$10$hashed23', '0900000023', 'CUSTOMER', 'ACTIVE', 1, 0),
(24, 'khach24@gmail.com', 'Thái Hà V', '$2a$10$hashed24', '0900000024', 'CUSTOMER', 'BLOCKED', 0, 0),
(25, 'khach25@gmail.com', 'Châu Lệ W', '$2a$10$hashed25', '0900000025', 'CUSTOMER', 'ACTIVE', 1, 0),
(26, 'khach26@gmail.com', 'Cao Đạt X', '$2a$10$hashed26', '0900000026', 'CUSTOMER', 'ACTIVE', 1, 0),
(27, 'khach27@gmail.com', 'Lư Tấn Y', '$2a$10$hashed27', '0900000027', 'CUSTOMER', 'ACTIVE', 1, 0),
(28, 'khach28@gmail.com', 'Bạch Ngọc Z', '$2a$10$hashed28', '0900000028', 'CUSTOMER', 'PENDING', 0, 0),
(29, 'khach29@gmail.com', 'Tôn Thất A1', '$2a$10$hashed29', '0900000029', 'CUSTOMER', 'ACTIVE', 1, 0),
(30, 'khach30@gmail.com', 'Giang Di B2', '$2a$10$hashed30', '0900000030', 'CUSTOMER', 'ACTIVE', 1, 0),
(31, 'cus@fashion.com', 'Customer', '$2a$12$eRlsAFa/zm9anUdsZUGozu1PtfkPm0hRXeJWJ2za7x8OfgnPMthxq', '0900123001', 'CUSTOMER', 'ACTIVE', 1, 0);

-- ========================================================
-- 2. CATEGORIES (12 Danh mục)
-- ========================================================
INSERT INTO `categories` (`category_id`, `parent_id`, `name`) VALUES
(1, NULL, 'Thời Trang Nam'),
(2, NULL, 'Thời Trang Nữ'),
(3, NULL, 'Phụ Kiện'),
(4, 1, 'Áo Nam'),
(5, 1, 'Quần Nam'),
(6, 2, 'Áo Nữ'),
(7, 2, 'Chân Váy & Đầm'),
(8, 2, 'Quần Nữ'),
(9, 3, 'Túi Xách & Balo'),
(10, 3, 'Mắt Kính'),
(11, 3, 'Trang Sức'),
(12, 1, 'Giày Dép Nam');

-- ========================================================
-- 3. PRODUCTS (30 Sản phẩm)
-- ========================================================
INSERT INTO `products` (`product_id`, `category_id`, `name`, `description`, `status`) VALUES
(1, 4, 'Áo Thun Basic Nam', 'Áo thun cotton trơn đơn giản.', 'ACTIVE'),
(2, 4, 'Áo Sơ Mi Kẻ Sọc', 'Áo sơ mi dài tay họa tiết kẻ sọc.', 'ACTIVE'),
(3, 4, 'Áo Khoác Bomber', 'Áo khoác gió thời trang nam.', 'ACTIVE'),
(4, 5, 'Quần Jean Rách Gối', 'Quần jean slimfit phong cách trẻ trung.', 'ACTIVE'),
(5, 5, 'Quần Tây Ống Suông', 'Quần âu thanh lịch công sở.', 'ACTIVE'),
(6, 5, 'Quần Short Kaki', 'Quần đùi đi chơi, mặc nhà thoải mái.', 'ACTIVE'),
(7, 6, 'Áo Trễ Vai Nữ Tính', 'Áo kiểu trễ vai điệu đà.', 'ACTIVE'),
(8, 6, 'Áo Sơ Mi Lụa', 'Chất liệu lụa satin mềm mịn.', 'ACTIVE'),
(9, 6, 'Áo Croptop Năng Động', 'Áo thun croptop in chữ.', 'ACTIVE'),
(10, 7, 'Chân Váy Xếp Ly', 'Chân váy dáng ngắn xòe.', 'ACTIVE'),
(11, 7, 'Đầm Body Dạ Hội', 'Đầm dự tiệc ôm sát quyến rũ.', 'ACTIVE'),
(12, 7, 'Đầm Maxi Đi Biển', 'Váy dài qua gót họa tiết hoa.', 'ACTIVE'),
(13, 8, 'Quần Ống Rộng Nữ', 'Quần culottes cạp cao.', 'ACTIVE'),
(14, 8, 'Quần Jean Skinny Nữ', 'Quần bó tôn dáng co giãn tốt.', 'OUT_OF_STOCK'),
(15, 9, 'Túi Xách Da Đeo Chéo', 'Túi nữ da PU form hộp.', 'ACTIVE'),
(16, 9, 'Balo Laptop 15inch', 'Balo chống sốc chống nước.', 'ACTIVE'),
(17, 10, 'Mắt Kính Chống Cận', 'Gọng kính titan siêu nhẹ.', 'ACTIVE'),
(18, 10, 'Kính Râm Thời Trang', 'Kính đi nắng chống UV400.', 'ACTIVE'),
(19, 11, 'Dây Chuyền Bạc 925', 'Dây chuyền nữ mặt hoa tuyết.', 'ACTIVE'),
(20, 11, 'Vòng Tay Phong Thủy', 'Vòng đá thạch anh mix charm.', 'ACTIVE'),
(21, 12, 'Giày Sneaker Trắng', 'Giày thể thao basic dễ phối.', 'ACTIVE'),
(22, 12, 'Giày Tây Nam Da Bò', 'Giày oxford công sở.', 'DISCONTINUED'),
(23, 4, 'Áo Len Cổ Lọ Nam', 'Áo dệt kim ấm áp mùa đông.', 'ACTIVE'),
(24, 4, 'Áo Polo Thể Thao', 'Chất vải thể thao thấm mồ hôi.', 'ACTIVE'),
(25, 5, 'Quần Jogger Túi Hộp', 'Quần phong cách streetwear.', 'ACTIVE'),
(26, 6, 'Áo Blazer Nữ', 'Áo khoác blazer thanh lịch.', 'ACTIVE'),
(27, 7, 'Chân Váy Bút Chì', 'Dành cho môi trường văn phòng.', 'ACTIVE'),
(28, 9, 'Túi Tote Canvas', 'Túi vải thân thiện môi trường.', 'ACTIVE'),
(29, 12, 'Dép Quai Hậu Nam', 'Dép sandal đi học, đi chơi.', 'ACTIVE'),
(30, 4, 'Áo Thun In Phản Quang', 'Áo thun form rộng unisex.', 'ACTIVE');

-- ========================================================
-- 4. PRODUCT_VARIANTS (45 Biến thể)
-- ========================================================
INSERT INTO `product_variants` (`variant_id`, `product_id`, `color`, `size`, `price`, `stock_quantity`) VALUES
(1, 1, 'Trắng', 'M', 150000, 100), (2, 1, 'Đen', 'M', 150000, 80), (3, 1, 'Trắng', 'L', 150000, 50),
(4, 2, 'Xanh Dương', 'M', 250000, 40), (5, 2, 'Xanh Dương', 'L', 250000, 30),
(6, 3, 'Đen', 'L', 450000, 20), (7, 3, 'Rêu', 'XL', 450000, 15),
(8, 4, 'Xanh Nhạt', '30', 350000, 60), (9, 4, 'Xanh Đậm', '32', 350000, 45),
(10, 5, 'Đen', '31', 400000, 30), (11, 5, 'Xám', '32', 400000, 25),
(12, 6, 'Be', 'L', 180000, 100), (13, 6, 'Đen', 'M', 180000, 80),
(14, 7, 'Hồng', 'S', 200000, 40), (15, 7, 'Trắng', 'M', 200000, 50),
(16, 8, 'Kem', 'M', 300000, 20), (17, 8, 'Xanh Ngọc', 'L', 300000, 10),
(18, 9, 'Đen', 'Freesize', 120000, 150),
(19, 10, 'Trắng', 'S', 220000, 70), (20, 10, 'Đen', 'M', 220000, 60),
(21, 11, 'Đỏ', 'M', 850000, 10), (22, 11, 'Đen', 'S', 850000, 8),
(23, 12, 'Vàng', 'Freesize', 350000, 35),
(24, 13, 'Be', 'M', 280000, 40), (25, 13, 'Nâu', 'L', 280000, 25),
(26, 14, 'Xanh', '28', 320000, 0), -- Out of stock
(27, 15, 'Đen', 'Freesize', 500000, 15), (28, 15, 'Nâu', 'Freesize', 500000, 20),
(29, 16, 'Xám', '15 inch', 450000, 50),
(30, 17, 'Bạc', 'Freesize', 250000, 100),
(31, 18, 'Đen', 'Freesize', 150000, 120),
(32, 19, 'Bạc', 'Freesize', 600000, 15),
(33, 20, 'Hồng', '15cm', 350000, 25),
(34, 21, 'Trắng', '40', 650000, 30), (35, 21, 'Trắng', '41', 650000, 25),
(36, 22, 'Nâu', '42', 950000, 0), -- Discontinued
(37, 23, 'Xám', 'L', 380000, 40),
(38, 24, 'Đỏ', 'M', 220000, 60), (39, 24, 'Trắng', 'M', 220000, 80),
(40, 25, 'Đen', 'L', 340000, 45),
(41, 26, 'Be', 'S', 550000, 20),
(42, 27, 'Đen', 'M', 250000, 35),
(43, 28, 'Trắng Ngà', 'Freesize', 90000, 200),
(44, 29, 'Đen', '41', 250000, 60),
(45, 30, 'Đen', 'XL', 180000, 90);

-- ========================================================
-- 5. PRODUCT_IMAGES (Đại diện cho vài sản phẩm)
-- ========================================================
INSERT INTO `product_images` (`image_id`, `product_id`, `color`, `url`) VALUES
(1, 1, 'Trắng', 'https://example.com/img/p1_white.jpg'),
(2, 1, 'Đen', 'https://example.com/img/p1_black.jpg'),
(3, 2, 'Xanh Dương', 'https://example.com/img/p2_blue.jpg'),
(4, 7, 'Hồng', 'https://example.com/img/p7_pink.jpg'),
(5, 11, 'Đỏ', 'https://example.com/img/p11_red.jpg');

-- ========================================================
-- 6. ADDRESSES (30 Địa chỉ cho 30 Users)
-- ========================================================
INSERT INTO `addresses` (`address_id`, `user_id`, `full_address`, `receiver_name`, `receiver_phone`, `is_default`) VALUES
(1, 3, '12A Nguyễn Văn Cừ, Q5, TP.HCM', 'Nguyễn Trọng A', '0900000003', 1),
(2, 4, '45B Lê Lợi, Q1, TP.HCM', 'Lê Thị B', '0900000004', 1),
(3, 5, '99 Trần Hưng Đạo, Hoàn Kiếm, HN', 'Trần Văn C', '0900000005', 1),
(4, 6, 'KDC Trung Sơn, Bình Chánh, TP.HCM', 'Phạm Quỳnh D', '0900000006', 1),
(5, 7, '22 Hoàng Diệu, Hải Châu, Đà Nẵng', 'Hoàng Bảo E', '0900000007', 1),
(6, 8, '102 Cầu Giấy, Cầu Giấy, HN', 'Vũ Đức F', '0900000008', 1),
(7, 10, 'Hẻm 51, 3/2, Ninh Kiều, Cần Thơ', 'Bùi Xuân H', '0900000010', 1),
(8, 11, 'Phố Cổ Hội An, Quảng Nam', 'Đỗ Minh I', '0900000011', 1),
(9, 12, '15 Lê Duẩn, Ba Đình, HN', 'Hồ Thúy J', '0900000012', 1),
(10, 13, 'Chợ Bến Thành, Q1, TP.HCM', 'Ngô Kiến K', '0900000013', 1),
(11, 14, '55 Quang Trung, Gò Vấp, TP.HCM', 'Dương Thảo L', '0900000014', 1),
(12, 15, 'Tòa nhà Bitexco, Q1, TP.HCM', 'Lý Hải M', '0900000015', 1),
(13, 17, '80 Láng Hạ, Đống Đa, HN', 'Đinh Tiến O', '0900000017', 1),
(14, 19, 'Bãi Sau, Vũng Tàu', 'Trương Quốc Q', '0900000019', 1),
(15, 20, '120 Võ Văn Kiệt, Sơn Trà, ĐN', 'Phan Thanh R', '0900000020', 1),
(16, 21, '4A Phạm Ngọc Thạch, Q3, TP.HCM', 'Mai Phương S', '0900000021', 1),
(17, 22, 'Đại học Cần Thơ, Ninh Kiều', 'Đào Trọng T', '0900000022', 1),
(18, 23, 'KĐT Sala, Quận 2, TP.HCM', 'Tô Lan U', '0900000023', 1),
(19, 25, '120 Trần Phú, Nha Trang', 'Châu Lệ W', '0900000025', 1),
(20, 26, '15 Hùng Vương, Huế', 'Cao Đạt X', '0900000026', 1),
(21, 27, '68 Nguyễn Du, Hai Bà Trưng, HN', 'Lư Tấn Y', '0900000027', 1),
(22, 29, '50 Tôn Đức Thắng, Q1, TP.HCM', 'Tôn Thất A1', '0900000029', 1),
(23, 30, 'Landmark 81, Bình Thạnh, TP.HCM', 'Giang Di B2', '0900000030', 1),
(24, 3, 'Địa chỉ phụ của A, Q7, TP.HCM', 'Trọng A (Cơ quan)', '0900000003', 0),
(25, 4, 'Địa chỉ phụ của B, Q2, TP.HCM', 'Lê B (Nhà riêng)', '0900000004', 0),
(26, 5, 'Địa chỉ phụ của C, Tây Hồ, HN', 'Trần C', '0900000005', 0),
(27, 8, 'Địa chỉ phụ của F, Nam Từ Liêm, HN', 'Vũ F', '0900000008', 0),
(28, 11, 'Địa chỉ phụ của I, TP.Tam Kỳ', 'Minh I', '0900000011', 0),
(29, 20, 'Địa chỉ phụ của R, Thanh Khê, ĐN', 'Thanh R', '0900000020', 0),
(30, 30, 'Địa chỉ phụ của B2, Q1, TP.HCM', 'Giang Di B2', '0900000030', 0);

-- ========================================================
-- 7. COUPONS & USER_COUPONS
-- ========================================================
INSERT INTO `coupons` (`coupon_id`, `code`, `discount_type`, `discount_value`, `min_order_amount`, `usage_limit`, `start_date`, `expiry_date`, `active`) VALUES
(1, 'WELCOME50', 'FIXED_AMOUNT', 50000, 200000, 1000, '2023-01-01', '2026-12-31', 1),
(2, 'SUMMER20', 'PERCENTAGE', 20, 500000, 500, '2024-05-01', '2025-08-31', 1),
(3, 'FREESHIP', 'FIXED_AMOUNT', 30000, 150000, 2000, '2024-01-01', '2026-12-31', 1),
(4, 'VIP100K', 'FIXED_AMOUNT', 100000, 1000000, 50, '2024-01-01', '2025-12-31', 1),
(5, 'BLACKFRIDAY', 'PERCENTAGE', 50, 0, 10, '2024-11-20', '2024-11-30', 0);

INSERT INTO `user_coupons` (`user_coupon_id`, `user_id`, `coupon_id`, `used`) VALUES
(1, 3, 1, 1), (2, 4, 1, 0), (3, 5, 2, 1), (4, 6, 3, 0), (5, 8, 4, 1);

-- ========================================================
-- 8. ORDERS (30 Đơn hàng đủ trạng thái)
-- ========================================================
INSERT INTO `orders` (`order_id`, `user_id`, `coupon_id`, `total_amount`, `status`, `payment_method`, `type`, `order_date`, `shipping_address`, `hidden_by_user`) VALUES
(1, 3, 1, 300000, 'COMPLETED', 'COD', 'ONLINE', '2024-01-10 10:00:00', '12A Nguyễn Văn Cừ, Q5, TP.HCM', 0),
(2, 4, NULL, 500000, 'PENDING_PAYMENT', 'BANK_TRANSFER', 'ONLINE', '2024-02-15 14:30:00', '45B Lê Lợi, Q1, TP.HCM', 0),
(3, 5, 2, 800000, 'SHIPPING', 'VNPAY', 'ONLINE', '2024-03-20 09:15:00', '99 Trần Hưng Đạo, Hoàn Kiếm, HN', 0),
(4, 6, NULL, 450000, 'DELIVERED', 'MOMO', 'ONLINE', '2024-03-25 16:45:00', 'KDC Trung Sơn, Bình Chánh, TP.HCM', 0),
(5, 8, 4, 1500000, 'CANCELLED', 'COD', 'ONLINE', '2024-04-01 10:00:00', '102 Cầu Giấy, Cầu Giấy, HN', 0),
(6, 10, NULL, 600000, 'PROCESSING', 'BANK_TRANSFER', 'ONLINE', '2024-04-10 11:00:00', 'Hẻm 51, 3/2, Ninh Kiều, Cần Thơ', 0),
(7, 11, NULL, 350000, 'PAID', 'MOMO', 'ONLINE', '2024-04-12 08:30:00', 'Phố Cổ Hội An, Quảng Nam', 0),
(8, 12, NULL, 280000, 'COMPLETED', 'COD', 'OFFLINE', '2024-04-15 15:00:00', 'Mua tại quầy', 0),
(9, 13, NULL, 750000, 'COMPLETED', 'VNPAY', 'ONLINE', '2024-04-18 19:20:00', 'Chợ Bến Thành, Q1, TP.HCM', 0),
(10, 14, NULL, 400000, 'PENDING_CONFIRMATION', 'COD', 'ONLINE', '2024-04-20 09:10:00', '55 Quang Trung, Gò Vấp, TP.HCM', 0),
(11, 15, NULL, 120000, 'COMPLETED', 'COD', 'ONLINE', '2024-04-21 14:00:00', 'Tòa nhà Bitexco, Q1, TP.HCM', 0),
(12, 17, NULL, 850000, 'COMPLETED', 'BANK_TRANSFER', 'ONLINE', '2024-04-22 10:00:00', '80 Láng Hạ, Đống Đa, HN', 0),
(13, 19, NULL, 900000, 'SHIPPING', 'MOMO', 'ONLINE', '2024-04-25 11:30:00', 'Bãi Sau, Vũng Tàu', 0),
(14, 20, NULL, 150000, 'DELIVERED', 'COD', 'ONLINE', '2024-04-26 13:45:00', '120 Võ Văn Kiệt, Sơn Trà, ĐN', 0),
(15, 21, NULL, 220000, 'CANCELLED', 'VNPAY', 'ONLINE', '2024-04-27 16:00:00', '4A Phạm Ngọc Thạch, Q3, TP.HCM', 0),
(16, 22, NULL, 650000, 'PROCESSING', 'COD', 'ONLINE', '2024-04-28 09:20:00', 'Đại học Cần Thơ, Ninh Kiều', 0),
(17, 23, NULL, 300000, 'COMPLETED', 'BANK_TRANSFER', 'ONLINE', '2024-04-29 14:15:00', 'KĐT Sala, Quận 2, TP.HCM', 0),
(18, 25, NULL, 500000, 'COMPLETED', 'MOMO', 'ONLINE', '2024-04-30 10:00:00', '120 Trần Phú, Nha Trang', 0),
(19, 26, NULL, 450000, 'COMPLETED', 'COD', 'ONLINE', '2024-05-01 08:00:00', '15 Hùng Vương, Huế', 0),
(20, 27, NULL, 250000, 'PENDING_PAYMENT', 'VNPAY', 'ONLINE', '2024-05-02 11:11:00', '68 Nguyễn Du, Hai Bà Trưng, HN', 0),
(21, 29, NULL, 180000, 'SHIPPING', 'COD', 'ONLINE', '2024-05-03 15:30:00', '50 Tôn Đức Thắng, Q1, TP.HCM', 0),
(22, 30, NULL, 600000, 'DELIVERED', 'BANK_TRANSFER', 'ONLINE', '2024-05-04 18:45:00', 'Landmark 81, Bình Thạnh, TP.HCM', 0),
(23, 3, NULL, 350000, 'COMPLETED', 'COD', 'ONLINE', '2024-05-05 09:00:00', '12A Nguyễn Văn Cừ, Q5, TP.HCM', 0),
(24, 4, NULL, 400000, 'CANCELLED', 'MOMO', 'ONLINE', '2024-05-06 14:00:00', '45B Lê Lợi, Q1, TP.HCM', 0),
(25, 5, NULL, 250000, 'PROCESSING', 'COD', 'ONLINE', '2024-05-07 10:20:00', '99 Trần Hưng Đạo, Hoàn Kiếm, HN', 0),
(26, 6, NULL, 850000, 'COMPLETED', 'VNPAY', 'ONLINE', '2024-05-08 16:30:00', 'KDC Trung Sơn, Bình Chánh, TP.HCM', 0),
(27, 8, NULL, 150000, 'PAID', 'BANK_TRANSFER', 'ONLINE', '2024-05-09 11:00:00', '102 Cầu Giấy, Cầu Giấy, HN', 0),
(28, 10, NULL, 300000, 'COMPLETED', 'COD', 'OFFLINE', '2024-05-10 14:50:00', 'Mua tại quầy', 0),
(29, 11, NULL, 450000, 'SHIPPING', 'MOMO', 'ONLINE', '2024-05-11 09:10:00', 'Phố Cổ Hội An, Quảng Nam', 0),
(30, 12, NULL, 220000, 'DELIVERED', 'COD', 'ONLINE', '2024-05-12 15:20:00', '15 Lê Duẩn, Ba Đình, HN', 0);

-- ========================================================
-- 9. ORDER_ITEMS (Khoảng 35 Chi tiết đơn hàng)
-- ========================================================
INSERT INTO `order_items` (`order_item_id`, `order_id`, `variant_id`, `product_name`, `quantity`, `price`, `status`, `refund_status`, `is_reviewed`, `cancellation_reason`) VALUES
(1, 1, 1, 'Áo Thun Basic Nam', 2, 150000, 'COMPLETED', 'NONE', 1, NULL),
(2, 2, 4, 'Áo Sơ Mi Kẻ Sọc', 2, 250000, 'PENDING_PAYMENT', 'NONE', 0, NULL),
(3, 3, 10, 'Quần Tây Ống Suông', 2, 400000, 'SHIPPING', 'NONE', 0, NULL),
(4, 4, 6, 'Áo Khoác Bomber', 1, 450000, 'DELIVERED', 'PENDING', 0, NULL), -- Món này đang xin đổi trả
(5, 5, 21, 'Đầm Body Dạ Hội', 1, 850000, 'CANCELLED', 'NONE', 0, 'Đổi ý không mua'),
(6, 5, 34, 'Giày Sneaker Trắng', 1, 650000, 'CANCELLED', 'NONE', 0, 'Đổi ý không mua'),
(7, 6, 16, 'Áo Sơ Mi Lụa', 2, 300000, 'PROCESSING', 'NONE', 0, NULL),
(8, 7, 23, 'Đầm Maxi Đi Biển', 1, 350000, 'PAID', 'NONE', 0, NULL),
(9, 8, 24, 'Quần Ống Rộng Nữ', 1, 280000, 'COMPLETED', 'NONE', 0, NULL),
(10, 9, 27, 'Túi Xách Da Đeo Chéo', 1, 500000, 'COMPLETED', 'NONE', 1, NULL),
(11, 9, 30, 'Mắt Kính Chống Cận', 1, 250000, 'COMPLETED', 'NONE', 0, NULL),
(12, 10, 11, 'Quần Tây Ống Suông', 1, 400000, 'PENDING_CONFIRMATION', 'NONE', 0, NULL),
(13, 11, 18, 'Áo Croptop Năng Động', 1, 120000, 'COMPLETED', 'NONE', 1, NULL),
(14, 12, 21, 'Đầm Body Dạ Hội', 1, 850000, 'COMPLETED', 'NONE', 1, NULL),
(15, 13, 29, 'Balo Laptop 15inch', 2, 450000, 'SHIPPING', 'NONE', 0, NULL),
(16, 14, 31, 'Kính Râm Thời Trang', 1, 150000, 'DELIVERED', 'NONE', 0, NULL),
(17, 15, 19, 'Chân Váy Xếp Ly', 1, 220000, 'CANCELLED', 'NONE', 0, 'Tìm được chỗ rẻ hơn'),
(18, 16, 34, 'Giày Sneaker Trắng', 1, 650000, 'PROCESSING', 'NONE', 0, NULL),
(19, 17, 16, 'Áo Sơ Mi Lụa', 1, 300000, 'COMPLETED', 'NONE', 1, NULL),
(20, 18, 27, 'Túi Xách Da Đeo Chéo', 1, 500000, 'COMPLETED', 'NONE', 0, NULL),
(21, 19, 29, 'Balo Laptop 15inch', 1, 450000, 'COMPLETED', 'NONE', 0, NULL),
(22, 20, 30, 'Mắt Kính Chống Cận', 1, 250000, 'PENDING_PAYMENT', 'NONE', 0, NULL),
(23, 21, 45, 'Áo Thun In Phản Quang', 1, 180000, 'SHIPPING', 'NONE', 0, NULL),
(24, 22, 32, 'Dây Chuyền Bạc 925', 1, 600000, 'DELIVERED', 'NONE', 0, NULL),
(25, 23, 8, 'Quần Jean Rách Gối', 1, 350000, 'COMPLETED', 'NONE', 1, NULL),
(26, 24, 10, 'Quần Tây Ống Suông', 1, 400000, 'CANCELLED', 'NONE', 0, 'Sai size'),
(27, 25, 30, 'Mắt Kính Chống Cận', 1, 250000, 'PROCESSING', 'NONE', 0, NULL),
(28, 26, 21, 'Đầm Body Dạ Hội', 1, 850000, 'COMPLETED', 'NONE', 0, NULL),
(29, 27, 31, 'Kính Râm Thời Trang', 1, 150000, 'PAID', 'NONE', 0, NULL),
(30, 28, 16, 'Áo Sơ Mi Lụa', 1, 300000, 'COMPLETED', 'NONE', 1, NULL),
(31, 29, 29, 'Balo Laptop 15inch', 1, 450000, 'SHIPPING', 'NONE', 0, NULL),
(32, 30, 19, 'Chân Váy Xếp Ly', 1, 220000, 'DELIVERED', 'NONE', 0, NULL);

-- ========================================================
-- 10. REVIEWS (Một số đánh giá 5 sao, 4 sao)
-- ========================================================
INSERT INTO `reviews` (`review_id`, `user_id`, `product_id`, `order_item_id`, `rating`, `comment`, `created_at`) VALUES
(1, 3, 1, 1, 5, 'Áo đẹp, vải xịn mặc mát lắm nhé shop!', '2024-01-15 15:00:00'),
(2, 13, 15, 10, 4, 'Túi da mềm, form hơi nhỏ so với mình nghĩ nhưng oke.', '2024-04-20 10:00:00'),
(3, 15, 9, 13, 5, 'Áo croptop mặc siêu tôn dáng, vote 5 sao!', '2024-04-23 09:00:00'),
(4, 17, 11, 14, 5, 'Đầm mặc đi tiệc ai cũng khen, rất đáng tiền.', '2024-04-24 19:30:00'),
(5, 23, 8, 19, 5, 'Lụa mềm, mặc mát, giao hàng nhanh.', '2024-05-02 11:00:00'),
(6, 3, 4, 25, 4, 'Quần jean chất ổn, màu hơi nhạt hơn ảnh một xíu.', '2024-05-07 08:45:00');

INSERT INTO `review_images` (`review_image_id`, `review_id`, `image_url`) VALUES
(1, 1, 'https://example.com/reviews/r1_img1.jpg'),
(2, 4, 'https://example.com/reviews/r4_img1.jpg'),
(3, 4, 'https://example.com/reviews/r4_img2.jpg');

-- ========================================================
-- 11. RETURN_REQUESTS (Demo 1 yêu cầu hoàn trả đơn hàng số 4)
-- ========================================================
INSERT INTO `return_requests` (`return_request_id`, `order_id`, `user_id`, `reason`, `description`, `status`, `request_date`, `processed_by`, `processed_at`, `rejection_reason`) VALUES
(1, 4, 6, 'Lỗi sản phẩm', 'Áo khoác bomber bị rách chỉ ở phần tay áo.', 'PENDING', '2024-03-26 10:00:00', NULL, NULL, NULL);

UPDATE `order_items` SET `return_request_id` = 1 WHERE `order_item_id` = 4;

INSERT INTO `return_request_images` (`return_request_id`, `image_url`) VALUES
(1, 'https://example.com/returns/error_bomber1.jpg');

-- ========================================================
-- 12. CART, WISHLIST, RECENTLY VIEWED, NOTIFICATIONS
-- ========================================================
INSERT INTO `cart_items` (`cart_item_id`, `user_id`, `variant_id`, `quantity`) VALUES
(1, 3, 6, 1), (2, 4, 10, 2), (3, 5, 21, 1), (4, 10, 30, 1), (5, 12, 1, 3);

INSERT INTO `wishlist_items` (`wishlist_item_id`, `user_id`, `product_id`) VALUES
(1, 3, 7), (2, 4, 5), (3, 4, 11), (4, 10, 20), (5, 15, 30);

INSERT INTO `recently_viewed_items` (`view_id`, `user_id`, `product_id`, `viewed_at`) VALUES
(1, 3, 3, '2024-05-10 09:00:00'), (2, 3, 4, '2024-05-10 09:05:00'),
(3, 4, 10, '2024-05-11 14:20:00'), (4, 10, 21, '2024-05-12 10:15:00');

-- ========================================================
-- SỬA LẠI BẢNG NOTIFICATIONS CHO KHỚP VỚI ENUM TRONG JAVA
-- ========================================================
INSERT INTO `notifications` (`id`, `user_id`, `title`, `content`, `type`, `related_id`, `is_read`, `created_at`) VALUES
(1, 3, 'Đơn hàng thành công', 'Đơn hàng #1 của bạn đã hoàn thành.', 'SUCCESS', 1, 1, '2024-01-12 10:00:00'),
(2, 6, 'Yêu cầu hoàn trả', 'Yêu cầu hoàn trả đơn #4 đang được xử lý.', 'INFO', 4, 0, '2024-03-26 10:05:00'),
(3, 10, 'Nhắc nhở thanh toán', 'Bạn có đơn hàng đang chờ thanh toán.', 'WARNING', 6, 0, '2024-04-10 12:00:00');

-- ========================================================
-- Bật lại kiểm tra khóa ngoại
-- ========================================================
SET FOREIGN_KEY_CHECKS = 1;