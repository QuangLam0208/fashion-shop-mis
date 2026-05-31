# 📋 Tài liệu Đặc tả Hợp đồng API (API Contract Documentation)

Tài liệu này định nghĩa chi tiết cấu trúc dữ liệu gửi lên (Payload Schema), các trường bắt buộc/tùy chọn, các quy tắc kiểm tra tính hợp lệ (Validation Rules) và ví dụ Request/Response cho các API liên quan đến sản phẩm dành cho Frontend.

Mã Task Jira tương ứng: **AC-BE-12-12 — API contract documented**

---

## 1. API: Thêm Sản phẩm Mới (Create Product)

* **Endpoint**: `/api/admin/products/create`
* **Method**: `POST`
* **Headers**:
  * `Content-Type: application/json`
  * `Authorization: Bearer <JWT_TOKEN>`

### 🔹 Payload Schema (Request Body)

| Tên Trường | Kiểu dữ liệu | Bắt buộc | Quy tắc ràng buộc (Validation) | Mô tả |
| :--- | :--- | :--- | :--- | :--- |
| `name` | String | **Có** | Không để trống, từ 2 - 255 ký tự | Tên sản phẩm thời trang |
| `categoryId` | Long | **Có** | Không được null, danh mục phải tồn tại | ID của danh mục sản phẩm (VD: 2) |
| `price` | Double | **Có** | Không được null, giá trị $\ge 0$ | Giá bán mặc định của sản phẩm |
| `variants` | Array | **Có** | Ít nhất 1 biến thể sản phẩm | Danh sách biến thể thuộc tính sản phẩm |
| `variants[].size` | String | **Có** | Không để trống, tối đa 20 ký tự | Kích thước biến thể (VD: "S", "M", "L") |
| `variants[].color` | String | **Có** | Không để trống, tối đa 50 ký tự | Màu sắc biến thể (VD: "Đen", "Trắng") |
| `variants[].stockQuantity` | Long | **Có** | Không được null, giá trị $\ge 0$ | Số lượng tồn kho của biến thể này |
| `description` | String | *Không* | Tối đa 2000 ký tự (Mặc định: "") | Mô tả chi tiết sản phẩm |
| `imageUrls` | Array[String] | *Không* | Danh sách URL (Mặc định: link ảnh trống) | Danh sách link ảnh sản phẩm (Cloudinary) |

---

### 🔹 Ví dụ Request & Response

#### 📥 Example JSON Request (POST):
```json
{
  "name": "Áo Thun Polo Thể Thao Basic",
  "categoryId": 2,
  "description": "Áo thun polo chất liệu cotton co giãn tốt, thích hợp vận động ngoài trời.",
  "price": 250000.0,
  "imageUrls": [
    "https://res.cloudinary.com/dpqadtayu/image/upload/v1716912345/fashion_shop/polo_front.jpg",
    "https://res.cloudinary.com/dpqadtayu/image/upload/v1716912346/fashion_shop/polo_back.jpg"
  ],
  "variants": [
    {
      "size": "M",
      "color": "Trắng",
      "stockQuantity": 50
    },
    {
      "size": "L",
      "color": "Trắng",
      "stockQuantity": 45
    },
    {
      "size": "XL",
      "color": "Đen",
      "stockQuantity": 30
    }
  ]
}
```

#### 📤 Example JSON Response - Thành công (201 Created):
```json
{
  "productId": 12,
  "name": "Áo Thun Polo Thể Thao Basic",
  "price": 250000.0,
  "minPrice": 250000.0,
  "category": "Áo Nam",
  "categoryName": "Áo Polo",
  "categoryId": 2,
  "description": "Áo thun polo chất liệu cotton co giãn tốt, thích hợp vận động ngoài trời.",
  "status": "ACTIVE",
  "averageRating": 0.0,
  "reviewCount": 0,
  "mainImage": "https://res.cloudinary.com/dpqadtayu/image/upload/v1716912345/fashion_shop/polo_front.jpg",
  "hoverImage": "https://res.cloudinary.com/dpqadtayu/image/upload/v1716912346/fashion_shop/polo_back.jpg",
  "images": [
    {
      "imageId": 101,
      "url": "https://res.cloudinary.com/dpqadtayu/image/upload/v1716912345/fashion_shop/polo_front.jpg",
      "color": null
    },
    {
      "imageId": 102,
      "url": "https://res.cloudinary.com/dpqadtayu/image/upload/v1716912346/fashion_shop/polo_back.jpg",
      "color": null
    }
  ],
  "variants": [
    {
      "variantId": 301,
      "size": "M",
      "color": "Trắng",
      "stockQuantity": 50,
      "price": 250000.0
    },
    {
      "variantId": 302,
      "size": "L",
      "color": "Trắng",
      "stockQuantity": 45,
      "price": 250000.0
    },
    {
      "variantId": 303,
      "size": "XL",
      "color": "Đen",
      "stockQuantity": 30,
      "price": 250000.0
    }
  ],
  "reviews": []
}
```

#### 📤 Example JSON Response - Thất bại (400 Bad Request):
```json
{
  "timestamp": "2026-05-28T11:40:00.000+00:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "errors": {
    "name": "Tên sản phẩm không được để trống",
    "price": "Giá không được âm",
    "variants": "Phải có ít nhất một biến thể sản phẩm (variant)"
  }
}
```

---

## 2. API: Cập nhật Sản phẩm (Update Product)

* **Endpoint**: `/api/admin/products/update/{id}`
* **Method**: `PUT`
* **Headers**:
  * `Content-Type: application/json`
  * `Authorization: Bearer <JWT_TOKEN>`

### 🔹 Payload Schema (Request Body)

| Tên Trường | Kiểu dữ liệu | Bắt buộc | Quy tắc ràng buộc (Validation) | Mô tả |
| :--- | :--- | :--- | :--- | :--- |
| `name` | String | **Có** | Không để trống, từ 2 - 255 ký tự | Tên sản phẩm mới cập nhật |
| `categoryId` | Long | **Có** | Không được null, danh mục tồn tại | ID danh mục cập nhật |
| `price` | Double | **Có** | Không được null, giá trị $\ge 0$ | Giá bán mới của sản phẩm |
| `status` | String | **Có** | Không được null, phải là một Enum hợp lệ | `ACTIVE`, `INACTIVE`, `OUT_OF_STOCK`, `DISCONTINUED` |
| `imageUrls` | Array[String] | **Có** | Không được rỗng, tối thiểu 1 ảnh | Danh sách toàn bộ các ảnh được giữ lại/mới thêm |
| `variants` | Array | **Có** | Ít nhất 1 biến thể sản phẩm | Danh sách các biến thể của sản phẩm |
| `variants[].variantId` | Long | *Không* | Khóa ID biến thể (nếu có sẵn) | **Null**: Thêm mới biến thể. **Có giá trị**: Cập nhật biến thể cũ. Lược bỏ biến thể nào trong mảng sẽ tự động xóa biến thể đó khỏi DB. |
| `variants[].size` | String | **Có** | Không để trống, tối đa 20 ký tự | Kích thước |
| `variants[].color` | String | **Có** | Không để trống, tối đa 50 ký tự | Màu sắc |
| `variants[].stockQuantity` | Long | **Có** | Không được null, giá trị $\ge 0$ | Số lượng tồn kho |
| `description` | String | *Không* | Tối đa 2000 ký tự | Mô tả chi tiết cập nhật |

---

### 🔹 Ví dụ Request & Response

#### 📥 Example JSON Request (PUT):
```json
{
  "name": "Áo Thun Polo Thể Thao Basic Pro",
  "categoryId": 2,
  "description": "Áo thun polo chất liệu cotton cao cấp co giãn 4 chiều.",
  "price": 270000.0,
  "status": "ACTIVE",
  "imageUrls": [
    "https://res.cloudinary.com/dpqadtayu/image/upload/v1716912345/fashion_shop/polo_front.jpg"
  ],
  "variants": [
    {
      "variantId": 301,
      "size": "M",
      "color": "Trắng",
      "stockQuantity": 60
    },
    {
      "variantId": 302,
      "size": "L",
      "color": "Trắng",
      "stockQuantity": 0
    },
    {
      "size": "XXL",
      "color": "Đỏ",
      "stockQuantity": 15
    }
  ]
}
```

#### 📤 Example JSON Response - Thành công (200 OK):
```json
{
  "productId": 12,
  "name": "Áo Thun Polo Thể Thao Basic Pro",
  "price": 270000.0,
  "minPrice": 270000.0,
  "category": "Áo Nam",
  "categoryName": "Áo Polo",
  "categoryId": 2,
  "description": "Áo thun polo chất liệu cotton cao cấp co giãn 4 chiều.",
  "status": "ACTIVE",
  "averageRating": 0.0,
  "reviewCount": 0,
  "mainImage": "https://res.cloudinary.com/dpqadtayu/image/upload/v1716912345/fashion_shop/polo_front.jpg",
  "hoverImage": "https://res.cloudinary.com/dpqadtayu/image/upload/v1716912345/fashion_shop/polo_front.jpg",
  "images": [
    {
      "imageId": 101,
      "url": "https://res.cloudinary.com/dpqadtayu/image/upload/v1716912345/fashion_shop/polo_front.jpg",
      "color": null
    }
  ],
  "variants": [
    {
      "variantId": 301,
      "size": "M",
      "color": "Trắng",
      "stockQuantity": 60,
      "price": 270000.0
    },
    {
      "variantId": 302,
      "size": "L",
      "color": "Trắng",
      "stockQuantity": 0,
      "price": 270000.0
    },
    {
      "variantId": 304,
      "size": "XXL",
      "color": "Đỏ",
      "stockQuantity": 15,
      "price": 270000.0
    }
  ],
  "reviews": []
}
```

---

## 3. API Phụ trợ: Tải hình ảnh lên Cloud Storage (Upload Image)

* **Endpoint**: `/api/upload/image`
* **Method**: `POST`
* **Headers**:
  * `Content-Type: multipart/form-data`
  * `Authorization: Bearer <JWT_TOKEN>`

### 🔹 Cấu trúc Request (Multipart Form Data)
* Tham số truyền lên: **`file`** (Kiểu dữ liệu: `Binary File`)
* Ràng buộc: Định dạng tệp tin bắt buộc phải là hình ảnh (`image/*`).

---

### 🔹 Ví dụ Request & Response

#### 📥 Example cURL Request:
```bash
curl --location 'http://localhost:8080/api/upload/image' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' \
--form 'file=@"/C:/Users/Admin/Desktop/product_image.png"'
```

#### 📤 Example JSON Response - Thành công (200 OK):
```json
{
  "url": "https://res.cloudinary.com/dpqadtayu/image/upload/v1716912345/fashion_shop/abcde12345.png"
}
```

#### 📤 Example JSON Response - Thất bại (400 Bad Request):
```json
{
  "error": "Chỉ cho phép tải lên các tệp định dạng hình ảnh!"
}
```
