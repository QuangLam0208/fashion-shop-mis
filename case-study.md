# Quản lý Bán Hàng Thời Trang

---

## 1. Tên Dự Án

### Fashion E-Commerce Website Management System

Hệ thống Website Bán Hàng Thời Trang — nền tảng thương mại điện tử tích hợp cho phép quản lý toàn bộ hoạt động bán hàng thời trang trực tuyến, từ quản lý sản phẩm, đơn hàng đến trải nghiệm mua sắm của khách hàng.

---

## 2. Công Nghệ Sử Dụng

| Thành phần | Công nghệ |
|---|---|
| Frontend | ReactJS (Hooks, React Router, Axios) |
| Backend | Java Spring Boot |
| Database | MySQL 8.0 |
| ORM | Spring Data JPA (Hibernate) |
| Bảo mật | Spring Security + JWT (JSON Web Token) |
| Email | Spring Mail |
| Giảm code boilerplate | Lombok |
| Build Tool | Maven |
| IDE | IntelliJ IDEA Ultimate / Community |

---

## 3. Bối Cảnh Dự Án

Ngành thời trang đang chứng kiến sự chuyển dịch mạnh mẽ sang kênh bán hàng trực tuyến. Các cửa hàng và thương hiệu thời trang cần một hệ thống website bán hàng hiện đại để:

- Quản lý danh mục sản phẩm đa dạng với nhiều thuộc tính (màu sắc, kích thước, chất liệu)
- Xử lý đơn hàng nhanh chóng, chính xác và minh bạch
- Cung cấp trải nghiệm mua sắm mượt mà, thân thiện với người dùng
- Quản lý tồn kho, theo dõi doanh thu theo thời gian thực
- Tăng tỷ lệ chuyển đổi thông qua các tính năng khuyến mãi, voucher
- Xây dựng lòng trung thành khách hàng qua hệ thống đánh giá và tài khoản cá nhân

---

## 4. Mục Tiêu Dự Án

### 4.1 Mục Tiêu Chức Năng

- Xây dựng hệ thống web bán hàng thời trang đầy đủ chức năng cho cả khách hàng và quản trị viên
- Cho phép khách hàng duyệt sản phẩm, đặt hàng, theo dõi đơn hàng và thanh toán trực tuyến
- Cung cấp công cụ quản lý sản phẩm, đơn hàng, người dùng, khuyến mãi cho Admin
- Tích hợp xác thực bảo mật bằng JWT và phân quyền rõ ràng theo vai trò
- Gửi email thông báo tự động khi đặt hàng, xác nhận tài khoản

### 4.2 Mục Tiêu Đo Lường (KPI)

| KPI | Giá trị |
|---|---|
| Thời gian tải trang | < 2 giây |
| Số lượng người dùng đồng thời hỗ trợ | ≥ 100 |
| Thời gian xử lý đơn hàng | < 5 phút |
| Độ chính xác tồn kho | 99.9% |
| Unit Test coverage | ≥ 70% |

---

## 5. Các Bên Liên Quan (Stakeholders)

| Vai trò | Mô tả | Mức độ tham gia |
|---|---|---|
| **Admin** (Quản trị viên) | Quản lý toàn bộ hệ thống: sản phẩm, đơn hàng, người dùng, báo cáo, khuyến mãi | Cao |
| **Customer** (Khách hàng) | Duyệt sản phẩm, thêm giỏ hàng, đặt hàng, theo dõi đơn, đánh giá sản phẩm | Cao |
| Nhóm phát triển | Phân tích, thiết kế, lập trình, kiểm thử hệ thống | Cao |
| Giảng viên / Hội đồng | Đánh giá kết quả theo từng mô hình SDLC | Trung bình |

---

## 5b. Phân Quyền Hệ Thống

### Cấu Trúc Phân Cấp

```
👑 Admin — Toàn hệ thống
🙍 Customer — Mua sắm cá nhân
🌐 Guest (Khách vãng lai) — Xem sản phẩm, chưa đăng nhập
```

### Admin

**Phạm vi:** Toàn hệ thống

- Quản lý danh mục sản phẩm (thêm / sửa / xoá / tìm kiếm / phân cấp cha-con)
- Quản lý sản phẩm và biến thể (màu sắc, kích thước, số lượng tồn kho)
- Quản lý đơn hàng (xem, cập nhật trạng thái, huỷ)
- Quản lý yêu cầu trả hàng (Xem chi tiết, duyệt/từ chối yêu cầu, cập nhật trạng thái xử lý và hoàn tiền)
- Quản lý tài khoản khách hàng (khoá / mở khoá)
- Quản lý khuyến mãi và voucher
- Xem báo cáo doanh thu, thống kê sản phẩm bán chạy
- Thực hiện bán hàng trực tiếp tại quầy, tra cứu nhanh tồn kho và giá bán.

### Customer

**Phạm vi:** Cá nhân

- Đăng ký / đăng nhập / quản lý hồ sơ cá nhân
- Duyệt và tìm kiếm sản phẩm theo danh mục, lọc theo giá / màu sắc / kích thước
- Thêm sản phẩm vào giỏ hàng (Cart) và danh sách yêu thích (Wishlist)
- Đặt hàng và hủy đơn hàng, chọn địa chỉ giao hàng, áp dụng voucher
- Tạo yêu cầu trả hàng cho đơn hàng đã hoàn thành và theo dõi tiến trình xử lý.
- Theo dõi trạng thái đơn hàng và lịch sử mua hàng
- Đánh giá và nhận xét sản phẩm đã mua

### Guest (Khách vãng lai)

**Phạm vi:** Chỉ đọc

- Xem danh sách và chi tiết sản phẩm
- Tìm kiếm sản phẩm
- Đăng ký / đăng nhập để tiếp tục mua hàng

> **Lưu ý thiết kế DB:** Bảng `users` cần cột `role` (ENUM: ADMIN / CUSTOMER) và cột `is_active` để hỗ trợ khoá tài khoản. JWT token lưu thông tin role để phân quyền API.

---

## 6. Yêu Cầu Chức Năng

### 6.1 Chức Năng Trong Phạm Vi (In Scope)

#### A. Chức Năng Khách Hàng (Customer)

- **Xác thực tài khoản:** Đăng ký, đăng nhập, đăng xuất, quên mật khẩu (gửi email reset), xác nhận email
- **Hồ sơ cá nhân:** Xem và cập nhật thông tin cá nhân, đổi mật khẩu, quản lý địa chỉ giao hàng
- **Duyệt sản phẩm:** Xem danh sách sản phẩm, lọc theo danh mục / giá / màu sắc / kích thước, tìm kiếm theo tên
- **Chi tiết sản phẩm:** Xem ảnh, mô tả, giá, đánh giá, chọn biến thể (màu / size)
- **Giỏ hàng (Cart):** Thêm / xoá / cập nhật số lượng sản phẩm
- **Yêu thích (Wishlist):** Thêm / xoá sản phẩm yêu thích
- **Đặt hàng:** Chọn địa chỉ, phương thức thanh toán, áp dụng voucher, xác nhận đơn và thực hiện thanh toán qua cổng liên kết (nếu có).
- **Trả hàng**: Gửi yêu cầu trả hàng (lý do, hình ảnh minh chứng) cho các đơn hàng đã nhận, theo dõi trạng thái xử lý duyệt đơn của admin (APPROVED,COMPLETED,PENDING,REJECTED) và trạng thái khi gửi trả đơn hàng (COMPLETED,FAILED,NONE,PENDING) và nhận tiền hoàn tự động thông qua cổng thanh toán ban đầu (nếu có).
- **Theo dõi đơn hàng:** Xem trạng thái (Chờ xác nhận / Đang xử lý / Đang giao / Đã giao / Đã huỷ)
- **Lịch sử đơn hàng:** Xem danh sách và chi tiết các đơn đã đặt
- **Đánh giá sản phẩm:** Gửi đánh giá (rating + comment) cho sản phẩm đã mua

#### B. Chức Năng Quản Trị Viên (Admin)

- **Quản lý danh mục:** Thêm / sửa / xoá / tìm kiếm danh mục, phân cấp danh mục cha-con
- **Quản lý sản phẩm:** Thêm / sửa / xoá / tìm kiếm sản phẩm; quản lý biến thể (màu sắc, kích thước, giá, tồn kho), upload ảnh sản phẩm
- **Quản lý đơn hàng:** Xem danh sách đơn hàng, tìm kiếm / lọc theo trạng thái, cập nhật trạng thái đơn, xem chi tiết đơn hàng
- **Quản lý trả hàng:** Nhận và xem xét yêu cầu trả hàng từ khách, cập nhật trạng thái xử lý, xác nhận đã nhận lại hàng, xem xét đơn hàng và thực hiện hoàn trả tiền thông qua cổng thanh toán.
- **Quản lý Bán hàng tại quầy:** Tra cứu nhanh, tạo đơn hàng nhanh, thông tin khách hàng, thanh toán offline, in hóa đơn
- **Quản lý người dùng:** Xem danh sách khách hàng, khoá / mở khoá tài khoản, xem lịch sử mua hàng của từng khách
- **Quản lý khuyến mãi:** Tạo / sửa / xoá voucher giảm giá (theo % hoặc số tiền cố định), đặt thời hạn và giới hạn sử dụng
- **Báo cáo & Thống kê:** Doanh thu theo ngày / tháng / năm, sản phẩm bán chạy, số đơn hàng theo trạng thái

### 6.2 Chức Năng Ngoài Phạm Vi (Out of Scope)

- Đăng nhập bằng mạng xã hội (Google, Facebook OAuth)
- Tích hợp Google Maps để theo dõi vận chuyển
- Hệ thống điểm thưởng (Loyalty Points)

---

## 7. Chức Năng Chính Hệ Thống

### 7.1 Xác Thực & Tài Khoản  (Customer / Admin)

| Chức năng | Mô tả |
|---|---|
| Đăng ký | Tạo tài khoản mới, gửi email xác nhận |
| Đăng nhập | Xác thực bằng email + mật khẩu, nhận JWT token |
| Đăng xuất | Huỷ phiên đăng nhập |
| Quên mật khẩu | Gửi email chứa link reset mật khẩu |
| Cập nhật hồ sơ | Sửa thông tin cá nhân, đổi mật khẩu |
| Quản lý địa chỉ | Thêm / sửa / xoá địa chỉ giao hàng |

### 7.2 Quản lý Danh Mục (Admin)

| Chức năng | Mô tả |
|---|---|
| Thêm danh mục | Tạo danh mục mới với tên danh mục|
| Sửa danh mục | Cập nhật thông tin danh mục đã tồn tại |
| Xoá danh mục | Xoá danh mục (kiểm tra ràng buộc sản phẩm trước khi xoá) |
| Tìm kiếm danh mục | Tìm kiếm danh mục theo tên |
| Gán danh mục cha/con | Phân cấp danh mục 2 cấp (VD: Áo → Áo sơ mi, Áo phông) |

### 7.3 Quản lý Sản Phẩm (Admin)

| Chức năng | Mô tả |
|---|---|
| Thêm sản phẩm | Tạo sản phẩm mới với tên, mô tả, danh mục|
| Sửa sản phẩm | Cập nhật thông tin sản phẩm |
| Xoá sản phẩm | Xoá sản phẩm (ẩn hoặc xoá cứng) |
| Tìm kiếm sản phẩm | Tìm theo tên, danh mục, khoảng giá |
| Quản lý biến thể | Thêm / sửa / xoá biến thể (màu sắc, kích thước, số lượng tồn kho, giá) |
| Upload ảnh | Tải lên nhiều ảnh cho sản phẩm và từng biến thể |
| Trạng thái | Cập nhật trạng thái sản phẩm |

### 7.4 Quản lý Đơn Hàng (Admin)

| Chức năng | Mô tả |
|---|---|
| Xem danh sách đơn hàng | Hiển thị tất cả đơn hàng với thông tin tổng quan |
| Tìm kiếm / lọc đơn hàng | Lọc theo trạng thái, ngày đặt, khách hàng |
| Xem chi tiết đơn hàng | Xem sản phẩm, địa chỉ, phương thức thanh toán, lịch sử cập nhật |
| Cập nhật trạng thái đơn | Chuyển trạng thái: Chờ xác nhận → Đang xử lý → Đang giao → Đã giao |
| Huỷ đơn hàng | Huỷ đơn và hoàn lại tồn kho |
| Trạng thái | PENDING_CONFIRMATION, CONFIRMED, SHIPPING, DELIVERED, CANCELLED |
| Theo dõi đơn hàng | Lịch sử thay đổi trạng thái |

### 7.5 Quản lý Người Dùng (Admin)

| Chức năng | Mô tả |
|---|---|
| Xem danh sách người dùng | Hiển thị tất cả tài khoản khách hàng |
| Tìm kiếm người dùng | Tìm theo số điện thoại, tên, email |
| Khoá / Mở khoá tài khoản | Vô hiệu hoá hoặc kích hoạt lại tài khoản khách hàng |
| Xem lịch sử mua hàng | Xem toàn bộ đơn hàng của một khách hàng cụ thể |

### 7.6 Quản lý Khuyến Mãi (Admin)

| Chức năng | Mô tả |
|---|---|
| Thêm voucher | Tạo mã giảm giá với loại (% hoặc cố định), giá trị, thời hạn, giới hạn lượt dùng |
| Sửa voucher | Cập nhật thông tin voucher |
| Xoá voucher | Xoá hoặc vô hiệu hoá voucher |
| Tìm kiếm voucher | Tìm theo mã, trạng thái (còn hiệu lực / hết hạn) |

### 7.7 Mua Sắm (Customer)

| Chức năng | Mô tả |
|---|---|
| Xem sản phẩm | Duyệt danh sách sản phẩm, lọc và sắp xếp |
| Tìm kiếm sản phẩm | Tìm kiếm theo từ khoá, danh mục |
| Xem chi tiết sản phẩm | Xem ảnh, mô tả, đánh giá, chọn biến thể |
| Đặt hàng | Điền địa chỉ giao hàng, chọn phương thức thanh toán, áp voucher, xác nhận đơn |
| Theo dõi đơn hàng | Xem trạng thái đơn hàng hiện tại |
| Huỷ đơn hàng | Huỷ đơn khi đơn chưa được xử lý |

### 7.8 Quản lý giỏ hàng (Customer)

| Chức năng | Mô tả |
|---|---|
| Thêm vào giỏ hàng | Chọn biến thể và thêm vào Cart |
| Quản lý giỏ hàng | Cập nhật số lượng, xoá sản phẩm khỏi Cart, kiểm tra tồn kho tự động, tính tổng tiền tự động |

### 7.9 Quản lý yêu thích (Customer)

| Chức năng | Mô tả |
|---|---|
| Thêm vào Wishlist | Lưu sản phẩm yêu thích để mua sau |
| Xóa khỏi Wishlist | Xóa sản phẩm khỏi danh sách yêu thích |
| Toggle | Toggle trạng thái yêu thích |
| Xem Whishlist | Xem danh sách các sản phẩm yêu thích |

### 7.10 Đánh giá sản phẩm

| Chức năng | Mô tả |
|---|---|
| Đánh giá | Gửi đánh giá với số sao (1-5) |
| Upload | Upload hình ảnh đánh giá |
| Xem | Xem đánh giá sản phẩm |

### 7.11 Quản lý trả hàng

| Chức năng | Mô tả |
|---|---|
| Yêu cầu | Yêu cầu trả hàng (Customer) |
| Xử lý | Xử lý yêu cầu (Admin) |
| Cập nhật trạng thái | PENDING, APPROVED, REJECTED, COMPLETED |
| Hoàn tiền | Hoàn tiền tự động |

### 7.12 Báo Cáo & Thống Kê (Admin)

| Chức năng | Mô tả |
|---|---|
| Doanh thu theo thời gian | Thống kê doanh thu theo ngày / tháng / năm |
| Sản phẩm bán chạy | Danh sách sản phẩm có số lượng bán cao nhất |
| Thống kê đơn hàng | Số đơn theo từng trạng thái |
| Tổng quan Dashboard | Hiển thị các chỉ số chính: tổng doanh thu, tổng đơn hàng, số khách hàng |

### 7.13 Quản lý Bán hàng tại quầy

| Chức năng | Mô tả |
|---|---|
| Giao diện POS | Màn hình tối ưu cho việc chọn sản phẩm nhanh và thanh toán trên một trang duy nhất |
| Tra cứu sản phẩm | Hiển thị nhanh danh sách biến thể (màu, size), giá tiền và số lượng còn trong kho |
| Quản lý hàng chờ | Cho phép tạm lưu đơn hàng tại quầy để phục vụ khách khác trước |
| Xác nhận đơn hàng | Trừ tồn kho ngay lập tức và tạo đơn hàng với trạng thái "Đã giao" & "Đã thanh toán" |
| Xuất hóa đơn PDF | Tự động tạo mẫu hóa đơn chuyên nghiệp chứa thông tin cửa hàng, danh sách món và tổng tiền |

---

## 8. Yêu Cầu Phi Chức Năng

| Tiêu chí | Yêu cầu cụ thể |
|---|---|
| Hiệu năng | Thời gian phản hồi API < 2 giây; hỗ trợ ≥ 100 người dùng đồng thời |
| Bảo mật | Mã hoá mật khẩu bằng BCrypt; xác thực bằng JWT; phân quyền ADMIN / CUSTOMER qua Spring Security |
| Khả dụng | Uptime ≥ 99%; không downtime trong giờ cao điểm |
| Khả năng mở rộng | Thiết kế module hoá theo MVC, dễ tích hợp Payment Gateway / OAuth sau |
| Khả năng bảo trì | Tuân theo Java Coding Convention; sử dụng Lombok giảm boilerplate; Unit Test ≥ 70% coverage |
| Tương thích | Hỗ trợ Chrome, Firefox, Edge; giao diện responsive trên mobile và desktop |
| Dữ liệu | Lưu dữ liệu tối thiểu 2 năm; backup tự động hàng ngày |
| Email | Gửi email xác nhận đăng ký, reset mật khẩu, xác nhận đơn hàng qua Spring Mail |
| Tính toàn vẹn dữ liệu | Đảm bảo việc trừ tồn kho (product_variants.stock_quantity) phải sử dụng Transaction để tránh sai lệch khi có cả khách mua online và khách mua tại quầy cùng lúc |

---

## 9. Phân Tích Rủi Ro Dự Án

| Rủi ro | Mức độ | Giải pháp giảm thiểu |
|---|---|---|
| Yêu cầu thay đổi giữa chừng (Scope Creep) | Cao | Freeze yêu cầu sau mỗi phase; xác nhận bằng văn bản |
| Nhóm thiếu kinh nghiệm với Spring Boot / ReactJS / JWT | Trung bình | Học công nghệ trước; pair programming sprint đầu |
| Xung đột tồn kho (Race Condition khi nhiều người đặt cùng 1 sản phẩm) | Cao | Sử dụng transaction và optimistic locking với JPA |
| Rò rỉ JWT token | Trung bình | Đặt thời hạn token ngắn; sử dụng Refresh Token; HTTPS |
| Rò rỉ dữ liệu khách hàng | Trung bình | BCrypt, không lưu plaintext; phân quyền chặt chẽ theo role |
| Hiệu năng kém khi nhiều người mua đồng thời | Trung bình | Load testing với JMeter; tối ưu query; caching |
| Trễ tiến độ do thành viên nghỉ đột xuất | Thấp | Phân công chồng lấn; tài liệu hoá rõ ràng |

---

## 10. Kiến Trúc Hệ Thống (MVC)

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                         │
│           ReactJS (Hooks, React Router, Axios)              │
│        Giao diện người dùng & Admin Dashboard               │
└───────────────────────┬─────────────────────────────────────┘
                        │ HTTP/HTTPS (REST API + JWT)
┌───────────────────────▼─────────────────────────────────────┐
│                     SPRING BOOT BACKEND                      │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              Spring Security + JWT Filter           │    │
│  │         (Xác thực token, phân quyền role)           │    │
│  └──────────────────────┬──────────────────────────────┘    │
│                         │                                    │
│  ┌──────────────────────▼──────────────────────────────┐    │
│  │             Controller Layer (REST API)             │    │
│  │  AuthController │ ProductController │ OrderController│   │
│  │  CategoryController │ UserController │ VoucherController│ │
│  └──────────────────────┬──────────────────────────────┘    │
│                         │                                    │
│  ┌──────────────────────▼──────────────────────────────┐    │
│  │              Service Layer (Business Logic)         │    │
│  │  AuthService │ ProductService │ OrderService        │    │
│  │  CategoryService │ EmailService │ VoucherService    │    │
│  └──────────────────────┬──────────────────────────────┘    │
│                         │                                    │
│  ┌──────────────────────▼──────────────────────────────┐    │
│  │         Repository Layer (Spring Data JPA)          │    │
│  │  UserRepository │ ProductRepository │ OrderRepository│   │
│  │  CategoryRepository │ VoucherRepository             │    │
│  └──────────────────────┬──────────────────────────────┘    │
└───────────────────────  │ ───────────────────────────────────┘
                          │ JDBC / Hibernate ORM
┌─────────────────────────▼───────────────────────────────────┐
│                    DATABASE LAYER                            │
│                    MySQL 8.0                                 │
│  users │ products │ product_variants │ categories           │
│  orders │ order_items │ vouchers │ reviews │ addresses       │
└─────────────────────────────────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────┐
│                  EXTERNAL SERVICES                           │
│              Spring Mail (SMTP / Gmail)                      │
│          Gửi email xác nhận, reset mật khẩu                  │
└─────────────────────────────────────────────────────────────┘
```

### Luồng Xử Lý Request Điển Hình

```
ReactJS → [HTTP Request + JWT Header]
       → Spring Security Filter (Validate JWT, set SecurityContext)
       → Controller (Nhận request, validate input)
       → Service (Xử lý business logic, gọi Repository)
       → Repository (Truy vấn DB qua Hibernate ORM)
       → MySQL (Trả dữ liệu)
       → Service (Xử lý kết quả)
       → Controller (Trả ResponseEntity<T>)
       → ReactJS (Nhận JSON, cập nhật UI)
```

---

## 11. Cấu Trúc Project IntelliJ Dự Kiến

```text
FashionWebsite/
├── pom.xml
└── src/
    ├── main/
    │   ├── java/com/fashion/
    │   │   ├── controller/              (REST API Controllers)
    │   │   │   ├── AuthController.java
    │   │   │   ├── ProductController.java
    │   │   │   ├── CategoryController.java
    │   │   │   ├── OrderController.java
    │   │   │   ├── UserController.java
    │   │   │   ├── CartController.java
    │   │   │   ├── VoucherController.java
    │   │   │   └── ReviewController.java
    │   │   ├── model/                   (Entity classes - JPA)
    │   │   │   ├── User.java            (role: ADMIN/CUSTOMER)
    │   │   │   ├── Product.java
    │   │   │   ├── ProductVariant.java  (màu sắc, kích thước, tồn kho)
    │   │   │   ├── Category.java        (parentId để phân cấp cha-con)
    │   │   │   ├── Order.java           (status: PENDING/PROCESSING/SHIPPING/DELIVERED/CANCELLED)
    │   │   │   ├── OrderItem.java
    │   │   │   ├── CartItem.java
    │   │   │   ├── Voucher.java
    │   │   │   ├── Review.java
    │   │   │   └── Address.java
    │   │   ├── dto/                     (Data Transfer Objects)
    │   │   │   ├── request/             (Request DTOs)
    │   │   │   └── response/            (Response DTOs)
    │   │   ├── service/                 (Business Logic)
    │   │   │   ├── AuthService.java
    │   │   │   ├── ProductService.java
    │   │   │   ├── CategoryService.java
    │   │   │   ├── OrderService.java
    │   │   │   ├── EmailService.java
    │   │   │   ├── CartService.java
    │   │   │   └── VoucherService.java
    │   │   ├── repository/              (Spring Data JPA Repositories)
    │   │   │   ├── UserRepository.java
    │   │   │   ├── ProductRepository.java
    │   │   │   ├── CategoryRepository.java
    │   │   │   ├── OrderRepository.java
    │   │   │   └── VoucherRepository.java
    │   │   ├── security/                (Spring Security + JWT)
    │   │   │   ├── JwtTokenProvider.java
    │   │   │   ├── JwtAuthenticationFilter.java
    │   │   │   └── SecurityConfig.java
    │   │   ├── exception/               (Custom Exception Handlers)
    │   │   │   ├── GlobalExceptionHandler.java
    │   │   │   └── ResourceNotFoundException.java
    │   │   └── util/                    (Helper classes)
    │   └── resources/
    │       ├── application.properties   (DB config, JWT secret, Mail config)
    │       └── static/                  (Static assets nếu có)
    ├── test/                            (Unit & Integration Tests)
    │   └── java/com/fashion/
    │       ├── service/
    │       └── controller/
    └── target/                          (Compiled output)

frontend/ (ReactJS - có thể tách repo riêng)
├── package.json
├── public/
└── src/
    ├── components/                      (Reusable UI components)
    ├── pages/                           (Trang: Home, ProductList, Cart, Checkout, Admin POS...)
    ├── services/                        (Axios API calls)
    ├── context/                         (AuthContext, CartContext)
    ├── hooks/                           (Custom hooks)
    ├── utils/                           (Helper functions)
    └── App.jsx
```

---
