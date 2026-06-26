[README.md](https://github.com/user-attachments/files/29362772/README.md)
# 🛍️ Fashion E-Commerce Website Management System

Hệ thống Website Bán Hàng Thời Trang — nền tảng thương mại điện tử full-stack cho phép quản lý toàn bộ hoạt động bán hàng thời trang trực tuyến (online) và tại quầy (offline/POS), từ quản lý sản phẩm, đơn hàng, khuyến mãi đến trải nghiệm mua sắm của khách hàng.

---

## 📋 Mục lục

- [Giới thiệu](#-giới-thiệu)
- [Công nghệ sử dụng](#-công-nghệ-sử-dụng)
- [Cấu trúc thư mục](#-cấu-trúc-thư-mục)
- [Tính năng chính](#-tính-năng-chính)
- [Kiến trúc hệ thống](#-kiến-trúc-hệ-thống)
- [Yêu cầu hệ thống](#-yêu-cầu-hệ-thống)
- [Hướng dẫn cài đặt & chạy](#-hướng-dẫn-cài-đặt--chạy)
- [Tài khoản mẫu](#-tài-khoản-mẫu)
- [Địa chỉ truy cập](#-địa-chỉ-truy-cập)
- [Thanh toán](#-thanh-toán)
- [Kiểm thử (Testing)](#-kiểm-thử-testing)
- [Một số lưu ý quan trọng](#-một-số-lưu-ý-quan-trọng)
- [Quy tắc nghiệp vụ đáng chú ý](#-quy-tắc-nghiệp-vụ-đáng-chú-ý)

---

## 📖 Giới thiệu

Dự án được xây dựng theo mô hình **2 phân hệ riêng biệt** dùng chung 1 backend:

| Phân hệ | Đối tượng | Mô tả |
|---|---|---|
| **Customer** | Khách hàng | Duyệt sản phẩm, đặt hàng, thanh toán, theo dõi đơn, đánh giá, trả hàng |
| **Admin** | Quản trị viên | Quản lý sản phẩm/danh mục/đơn hàng/khuyến mãi, bán hàng tại quầy (POS), báo cáo doanh thu |

Toàn bộ giao tiếp giữa Frontend và Backend thông qua **REST API** bảo mật bằng **JWT**, phân quyền theo vai trò `ADMIN` / `CUSTOMER`.

---

## 🧰 Công nghệ sử dụng

### Backend (`app/`)

| Thành phần | Công nghệ |
|---|---|
| Ngôn ngữ / Build tool | Java 17, Maven (kèm Maven Wrapper `mvnw`) |
| Framework | Spring Boot |
| Bảo mật | Spring Security + JWT (`io.jsonwebtoken` - jjwt) |
| Truy xuất dữ liệu | Spring Data JPA / Hibernate |
| Database | MySQL 8.0 |
| Giảm boilerplate | Lombok |
| Gửi email | Spring Mail (SMTP Gmail) |
| Lưu trữ ảnh | Cloudinary |
| Xuất PDF hoá đơn | OpenPDF (`com.lowagie`) |
| Thanh toán | MoMo (sandbox, có cơ chế Mock), enum hỗ trợ VNPay/COD/Bank Transfer |

### Frontend (`ui_admin/`)

| Thành phần | Công nghệ |
|---|---|
| Framework | ReactJS (Hooks, Create React App) |
| Routing | React Router DOM |
| UI Library | Ant Design (antd) |
| Gọi API | Axios (kèm interceptor tự refresh token) |
| Biểu đồ | Recharts |

### Cơ sở dữ liệu

| File | Nội dung |
|---|---|
| `db.sql` | Schema (cấu trúc bảng) MySQL |
| `data_fashion.sql` | Dữ liệu mẫu (~30 user, 30+ sản phẩm, đơn hàng, đánh giá...) |
| `case-study.md` | Tài liệu phân tích nghiệp vụ / đặc tả chức năng đầy đủ |

---

## 📂 Cấu trúc thư mục

```text
.
├── app/                                  # BACKEND — Spring Boot
│   ├── src/main/java/com/fashion/
│   │   ├── controller/
│   │   │   ├── api/                      # REST API cho Customer + public
│   │   │   └── api/admin/                # REST API riêng cho Admin (/api/admin/**)
│   │   ├── model/                        # JPA Entity (User, Product, Order...)
│   │   │   └── enums/                    # Role, OrderStatus, PaymentMethod...
│   │   ├── dto/
│   │   │   ├── request/                  # DTO nhận dữ liệu từ client
│   │   │   └── response/                 # DTO trả dữ liệu cho client
│   │   ├── service/                      # Business logic (theo từng domain)
│   │   ├── repository/                   # Spring Data JPA Repository
│   │   ├── security/                     # JwtTokenProvider, SecurityConfig, Filter
│   │   ├── exception/                    # GlobalExceptionHandler + custom exceptions
│   │   ├── config/                       # MomoConfig, CloudinaryConfig
│   │   ├── validation/                   # Custom validator (PasswordMatch...)
│   │   ├── scheduler/                    # Job tự hủy đơn quá hạn thanh toán
│   │   └── util/                         # SecurityUtils, MediaTypeUtils
│   ├── src/main/resources/application.properties
│   ├── src/test/java/...                 # Unit test JUnit 5 + Mockito
│   └── pom.xml
│
├── ui_admin/                             # FRONTEND — ReactJS
│   └── src/
│       ├── admin/                        # Khu vực quản trị (/admin/*)
│       │   ├── pages/  components/  layouts/  services/  routes/  context/  hooks/  config/
│       ├── customer/                     # Khu vực khách hàng (/*)
│       │   ├── pages/  components/  layouts/  services/  routes/  context/  hooks/
│       ├── shared/                       # Dùng chung 2 phân hệ
│       │   ├── config/   (axiosInstance, apiConfig)
│       │   ├── constants/
│       │   └── utils/    (formatters...)
│       └── App.js                        # Điểm phân luồng /admin/* vs /*
│
├── db.sql                                # Schema DB
├── data_fashion.sql                      # Dữ liệu mẫu
└── case-study.md                         # Đặc tả nghiệp vụ chi tiết
```

---

## ✨ Tính năng chính

### 🙍 Khách hàng (Customer)

- Đăng ký / đăng nhập / quên mật khẩu / xác thực email (token gửi qua email)
- Duyệt, tìm kiếm, lọc sản phẩm theo danh mục, giá, sắp xếp
- Xem chi tiết sản phẩm: ảnh theo màu, biến thể (size/màu), đánh giá
- Giỏ hàng: thêm/sửa/xoá, tự kiểm tra tồn kho
- Sổ địa chỉ giao hàng (nhiều địa chỉ, đặt mặc định)
- Đặt hàng: chọn địa chỉ, phương thức thanh toán (COD/MoMo), áp mã giảm giá
- Theo dõi trạng thái đơn hàng theo từng sản phẩm (mỗi `OrderItem` có trạng thái riêng)
- Hủy đơn (khi chưa xử lý), thanh toán lại đơn MoMo bị treo
- Gửi yêu cầu trả hàng/hoàn tiền kèm ảnh minh chứng, theo dõi tiến trình xử lý
- Đánh giá sản phẩm đã mua (rating + bình luận + ảnh)
- Ví Voucher: thu thập & áp dụng mã giảm giá
- Danh sách yêu thích (Wishlist)
- Thông báo (Notification) realtime khi đơn hàng đổi trạng thái

### 👑 Quản trị viên (Admin)

- **Dashboard**: tổng doanh thu, số đơn, số khách hàng, top sản phẩm bán chạy, biểu đồ doanh thu & tỷ lệ trả hàng
- **Quản lý danh mục**: cây danh mục cha-con, thêm/sửa/xoá, tìm kiếm
- **Quản lý sản phẩm**: CRUD sản phẩm + biến thể (size/màu/giá/tồn kho), upload ảnh, kiểm tra ràng buộc trước khi xoá (đã có giao dịch thì không cho xoá cứng)
- **Quản lý đơn hàng**: danh sách, lọc theo trạng thái/ngày, xem chi tiết, cập nhật trạng thái theo luồng (state machine), xuất hoá đơn PDF
- **Quản lý trả hàng**: duyệt/từ chối yêu cầu, cập nhật trạng thái hoàn tiền từng sản phẩm, tự đóng phiếu khi tất cả item xử lý xong
- **Quản lý khách hàng**: tra cứu, khoá/mở khoá tài khoản (tự thu hồi toàn bộ token đang hoạt động), xem lịch sử mua hàng
- **Quản lý khuyến mãi**: tạo/sửa voucher (theo % hoặc số tiền cố định), bật/tắt nhanh
- **Báo cáo doanh thu**: thống kê theo khoảng ngày, tách doanh thu Online/Offline, xuất file CSV
- **Bán hàng tại quầy (POS)**: giao diện chọn sản phẩm nhanh, tạo đơn "Đã thanh toán" ngay, in hoá đơn PDF

---

## 🏗️ Kiến trúc hệ thống

```text
ReactJS (Customer UI / Admin UI)
        │  HTTP/HTTPS (REST API + JWT Bearer Token)
        ▼
Spring Security Filter (JwtAuthenticationFilter)
        ▼
Controller Layer  →  Service Layer  →  Repository Layer (Spring Data JPA)
        ▼
                MySQL 8.0
        │
        ├── Spring Mail        (email xác thực / reset mật khẩu / thông báo)
        ├── Cloudinary         (lưu trữ ảnh sản phẩm / review / return request)
        └── MoMo Payment API   (thanh toán trực tuyến, xác thực IPN bằng HMAC-SHA256)
```

Phân quyền API (`SecurityConfig`):

| Pattern | Quyền truy cập |
|---|---|
| `/api/auth/**` | Public |
| `GET /api/products/**`, `/api/categories/**`, `/api/reviews/**` | Public |
| `/api/admin/**` | Yêu cầu role `ADMIN` |
| Phần còn lại | Yêu cầu đăng nhập (JWT hợp lệ) |

---

## ⚙️ Yêu cầu hệ thống

- **Java** 17+
- **Node.js** 16+ và npm
- **MySQL** 8.0+
- (Tuỳ chọn) Maven — đã có `mvnw` / `mvnw.cmd` đi kèm nên không bắt buộc cài Maven riêng

---

## 🚀 Hướng dẫn cài đặt & chạy

### Bước 1 — Khởi tạo Database

```sql
CREATE DATABASE IF NOT EXISTS fashion_db
  DEFAULT CHARACTER SET utf8mb4 DEFAULT COLLATE utf8mb4_0900_ai_ci;
```

Có 2 cách để có dữ liệu:

- **Cách A (khuyến nghị — nhanh)**: Không cần chạy `db.sql`. Bỏ qua, để Hibernate tự tạo bảng ở Bước 2 (`spring.jpa.hibernate.ddl-auto=update`), sau đó import dữ liệu mẫu:
  ```bash
  mysql -u root -p fashion_db < data_fashion.sql
  ```
- **Cách B (thủ công)**: Import schema có sẵn rồi import dữ liệu mẫu:
  ```bash
  mysql -u root -p fashion_db < db.sql
  mysql -u root -p fashion_db < data_fashion.sql
  ```

### Bước 2 — Cấu hình & chạy Backend

Mở `app/src/main/resources/application.properties`, kiểm tra/sửa các thông số cho khớp môi trường máy bạn:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/fashion_db?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=12345
```

> ⚠️ **Quan trọng — Cloudinary**: hai biến `cloudinary.api-key` và `cloudinary.api-secret` không có giá trị mặc định, **ứng dụng sẽ không khởi động được** nếu thiếu. Trước khi chạy, hãy khai báo biến môi trường:
>
> ```bash
> # Linux/macOS
> export CLOUDINARY_API_KEY=xxxxxxxx
> export CLOUDINARY_API_SECRET=xxxxxxxx
>
> # Windows (PowerShell)
> $env:CLOUDINARY_API_KEY="xxxxxxxx"
> $env:CLOUDINARY_API_SECRET="xxxxxxxx"
> ```
> Đăng ký tài khoản miễn phí tại [cloudinary.com](https://cloudinary.com) để lấy `API Key`/`API Secret`.

> 📧 **Email**: cấu hình SMTP Gmail trong file đã có sẵn cho mục đích demo — nên thay bằng tài khoản Gmail App Password của riêng bạn nếu muốn email gửi đi thật.

Chạy backend (cổng mặc định: **8080**):

```bash
cd app
./mvnw spring-boot:run        # Linux/macOS
mvnw.cmd spring-boot:run       # Windows
```

### Bước 3 — Cấu hình & chạy Frontend

```bash
cd ui_admin
npm install
```

Tạo file `.env` trong `ui_admin/` (nếu backend không chạy ở `localhost:8080`):

```env
REACT_APP_API_BASE_URL=http://localhost:8080
```

Chạy frontend (cổng mặc định: **3000**):

```bash
npm start
```

---

## 🔑 Tài khoản mẫu

Dữ liệu mẫu trong `data_fashion.sql` cung cấp sẵn các tài khoản sau (mật khẩu: `123456`):

| Vai trò | Email | Mật khẩu |
|---|---|---|
| Admin | `admin@fashion.com` | `123456` |
| Customer | `customer@gmail.com` | `123456` |
| Customer | `cus@fashion.com` | `123456` |

> Các tài khoản khách hàng khác trong file dữ liệu mẫu dùng hash mật khẩu khác và **không** đảm bảo cùng mật khẩu `123456` — chỉ dùng 3 tài khoản trên để đăng nhập thử.

---

## 🌐 Địa chỉ truy cập

| Khu vực | URL |
|---|---|
| Trang khách hàng (Shop) | http://localhost:3000/ |
| Đăng nhập Admin | http://localhost:3000/admin/login |
| Dashboard Admin | http://localhost:3000/admin/dashboard |
| Bán hàng tại quầy (POS) | http://localhost:3000/admin/pos |
| Backend API base | http://localhost:8080/api |

---

## 💳 Thanh toán

| Phương thức | Trạng thái |
|---|---|
| **COD** (thanh toán khi nhận hàng) | Hoạt động đầy đủ |
| **MoMo** | Chạy ở chế độ **Mock/Sandbox** — hệ thống điều hướng tới trang mô phỏng quét QR nội bộ (`/mock/momo-payment`) thay vì gọi API MoMo thật, có ký chữ ký HMAC-SHA512/SHA256 hợp lệ để kiểm thử luồng IPN |
| **Chuyển khoản ngân hàng / VNPay** | Đã định nghĩa trong hệ thống (enum `PaymentMethod`), dùng cho mở rộng |

Cơ chế tự động: đơn hàng ở trạng thái `PENDING_PAYMENT` quá **10 phút** sẽ tự chuyển sang `PAYMENT_EXPIRED` và hoàn tồn kho (xem `OrderExpirationTask`, quét mỗi 60 giây).

---

## 🧪 Kiểm thử (Testing)

Backend có sẵn bộ Unit Test (JUnit 5 + Mockito) cho hầu hết các Service quan trọng (Auth, Order, Cart, Coupon, Product, Wishlist, Return Request, Revenue, Dashboard...).

```bash
cd app
./mvnw test
```

> Lưu ý: `AppApplicationTests` (test context loading) bị `@Disabled` vì cần kết nối MySQL thật đang chạy.

---

## 📝 Một số lưu ý quan trọng

- **2 hệ thống đăng nhập độc lập**: Admin và Customer dùng JWT/refresh-token và `localStorage key` khác nhau (`fashion_admin_token` vs `fashion_customer_token`), tuy cùng dùng 1 endpoint `/api/auth/login` của backend, phân biệt qua trường `role` trả về.
- **Trừ tồn kho có transaction**: việc trừ kho khi đặt hàng online và bán tại quầy (POS) đều bọc trong transaction để tránh sai lệch khi nhiều người mua cùng lúc.
- **Mỗi sản phẩm trong đơn có trạng thái riêng** (`OrderItem.status`), trạng thái tổng của `Order` được tự động tính lại dựa trên "trạng thái chậm nhất" trong các item con (xem `OrderManagementServiceImpl#updateOverallOrderStatus`).
- **Không thể xoá cứng** sản phẩm/danh mục/biến thể đã từng phát sinh giao dịch — hệ thống sẽ yêu cầu chuyển trạng thái `INACTIVE`/`DISCONTINUED` thay vì xoá.
- **Khoá tài khoản khách hàng** sẽ thu hồi (revoke) toàn bộ access token đang hoạt động của họ ngay lập tức.

---

## 🔄 Quy tắc nghiệp vụ đáng chú ý

**Luồng trạng thái đơn hàng** (tóm tắt, xem chi tiết trong `OrderManagementServiceImpl#checkStatusTransition`):

```
PENDING_PAYMENT ──► PAID ──► CONFIRMED ──► PROCESSING ──► SHIPPING ──► DELIVERED ──► COMPLETED
       │                                                       │             │
       ▼                                                       ▼             ▼
  PAYMENT_FAILED / PAYMENT_EXPIRED / CANCELLED              RETURNED      RETURNED

PENDING_CONFIRMATION ──► CONFIRMED ──► PROCESSING ──► SHIPPING ──► DELIVERED ──► COMPLETED
       │
       ▼
   CANCELLED
```

**Luồng yêu cầu trả hàng**: `PENDING` → `APPROVED`/`REJECTED` → (nếu `APPROVED`) cập nhật hoàn tiền từng sản phẩm `PENDING` → `COMPLETED`/`FAILED`/`REJECTED` → khi tất cả sản phẩm đã xử lý xong, phiếu tự chuyển `COMPLETED`.

---

📚 Để xem đặc tả nghiệp vụ đầy đủ (mục tiêu dự án, KPI, phân quyền, rủi ro, ERD...), tham khảo file **`case-study.md`** tại thư mục gốc dự án.
