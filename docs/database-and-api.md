# Thiết kế database và API

## 1. Database schema đề xuất

### users

| Field | Type | Ghi chú |
| --- | --- | --- |
| id | UUID | Primary key |
| name | VARCHAR | Họ tên |
| email | VARCHAR | Unique |
| password | VARCHAR | Mật khẩu đã mã hóa |
| phone | VARCHAR | Số điện thoại |
| address | TEXT | Địa chỉ mặc định |
| role | ENUM | `CUSTOMER`, `ADMIN` |
| is_active | BOOLEAN | Trạng thái tài khoản |
| created_at | TIMESTAMP | Ngày tạo |
| updated_at | TIMESTAMP | Ngày cập nhật |

### categories

| Field | Type | Ghi chú |
| --- | --- | --- |
| id | UUID | Primary key |
| name | VARCHAR | Tên danh mục |
| slug | VARCHAR | Unique |
| description | TEXT | Mô tả |
| created_at | TIMESTAMP | Ngày tạo |
| updated_at | TIMESTAMP | Ngày cập nhật |

### products

| Field | Type | Ghi chú |
| --- | --- | --- |
| id | UUID | Primary key |
| category_id | UUID | Foreign key |
| name | VARCHAR | Tên sản phẩm |
| slug | VARCHAR | Unique |
| description | TEXT | Mô tả |
| price | DECIMAL | Giá bán |
| image_url | TEXT | Ảnh đại diện |
| stock | INTEGER | Số lượng tồn |
| is_active | BOOLEAN | Còn hiển thị hay không |
| created_at | TIMESTAMP | Ngày tạo |
| updated_at | TIMESTAMP | Ngày cập nhật |

### product_variants

| Field | Type | Ghi chú |
| --- | --- | --- |
| id | UUID | Primary key |
| product_id | UUID | Foreign key |
| size | VARCHAR | S, M, L, XL |
| color | VARCHAR | Màu sắc |
| stock | INTEGER | Số lượng tồn theo biến thể |

### cart_items

| Field | Type | Ghi chú |
| --- | --- | --- |
| id | UUID | Primary key |
| user_id | UUID | Foreign key |
| product_id | UUID | Foreign key |
| variant_id | UUID | Nullable |
| quantity | INTEGER | Số lượng |
| created_at | TIMESTAMP | Ngày tạo |

### orders

| Field | Type | Ghi chú |
| --- | --- | --- |
| id | UUID | Primary key |
| user_id | UUID | Foreign key |
| total_amount | DECIMAL | Tổng tiền |
| status | ENUM | Trạng thái đơn hàng |
| payment_status | ENUM | Trạng thái thanh toán |
| payment_method | VARCHAR | COD, STRIPE, VNPAY |
| shipping_name | VARCHAR | Tên người nhận |
| shipping_phone | VARCHAR | Số điện thoại người nhận |
| shipping_address | TEXT | Địa chỉ giao hàng |
| created_at | TIMESTAMP | Ngày tạo |
| updated_at | TIMESTAMP | Ngày cập nhật |

### order_items

| Field | Type | Ghi chú |
| --- | --- | --- |
| id | UUID | Primary key |
| order_id | UUID | Foreign key |
| product_id | UUID | Foreign key |
| variant_id | UUID | Nullable |
| product_name | VARCHAR | Lưu tên tại thời điểm mua |
| price | DECIMAL | Giá tại thời điểm mua |
| quantity | INTEGER | Số lượng |
| size | VARCHAR | Size đã chọn |
| color | VARCHAR | Màu đã chọn |

### payments

| Field | Type | Ghi chú |
| --- | --- | --- |
| id | UUID | Primary key |
| order_id | UUID | Foreign key |
| provider | VARCHAR | STRIPE/VNPAY |
| transaction_id | VARCHAR | Mã giao dịch |
| amount | DECIMAL | Số tiền |
| status | ENUM | `PENDING`, `PAID`, `FAILED`, `CANCELLED` |
| created_at | TIMESTAMP | Ngày tạo |

## 2. API endpoints

### Auth

| Method | Endpoint | Mô tả | Quyền |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | Đăng ký | Public |
| POST | `/api/auth/login` | Đăng nhập | Public |
| GET | `/api/auth/me` | Lấy thông tin cá nhân | Customer/Admin |
| PUT | `/api/auth/profile` | Cập nhật thông tin | Customer/Admin |

### Products

| Method | Endpoint | Mô tả | Quyền |
| --- | --- | --- | --- |
| GET | `/api/products` | Danh sách sản phẩm | Public |
| GET | `/api/products/:id` | Chi tiết sản phẩm | Public |
| POST | `/api/products` | Thêm sản phẩm | Admin |
| PUT | `/api/products/:id` | Sửa sản phẩm | Admin |
| DELETE | `/api/products/:id` | Xóa/ẩn sản phẩm | Admin |

Query gợi ý cho `GET /api/products`:

```text
?search=ao&category=ao-thun&minPrice=100000&maxPrice=500000&page=1&limit=12&sort=price_asc
```

### Categories

| Method | Endpoint | Mô tả | Quyền |
| --- | --- | --- | --- |
| GET | `/api/categories` | Danh sách danh mục | Public |
| POST | `/api/categories` | Thêm danh mục | Admin |
| PUT | `/api/categories/:id` | Sửa danh mục | Admin |
| DELETE | `/api/categories/:id` | Xóa danh mục | Admin |

### Cart

| Method | Endpoint | Mô tả | Quyền |
| --- | --- | --- | --- |
| GET | `/api/cart` | Lấy giỏ hàng | Customer |
| POST | `/api/cart` | Thêm vào giỏ | Customer |
| PUT | `/api/cart/:id` | Cập nhật số lượng | Customer |
| DELETE | `/api/cart/:id` | Xóa khỏi giỏ | Customer |
| DELETE | `/api/cart` | Xóa toàn bộ giỏ | Customer |

### Orders

| Method | Endpoint | Mô tả | Quyền |
| --- | --- | --- | --- |
| POST | `/api/orders` | Tạo đơn hàng | Customer |
| GET | `/api/orders/my-orders` | Đơn hàng của tôi | Customer |
| GET | `/api/orders/:id` | Chi tiết đơn hàng | Customer/Admin |
| GET | `/api/orders` | Tất cả đơn hàng | Admin |
| PUT | `/api/orders/:id/status` | Cập nhật trạng thái | Admin |

### Payments

| Method | Endpoint | Mô tả | Quyền |
| --- | --- | --- | --- |
| POST | `/api/payments/create-checkout-session` | Tạo phiên thanh toán | Customer |
| POST | `/api/payments/webhook` | Nhận kết quả từ cổng thanh toán | Public |
| GET | `/api/payments/success` | Xử lý thanh toán thành công | Public |
| GET | `/api/payments/cancel` | Xử lý hủy thanh toán | Public |

## 3. Trạng thái đề xuất

### OrderStatus

```text
PENDING
CONFIRMED
SHIPPING
COMPLETED
CANCELLED
```

### PaymentStatus

```text
UNPAID
PENDING
PAID
FAILED
REFUNDED
```

### UserRole

```text
CUSTOMER
ADMIN
```

## 4. Seed data để demo

Danh mục:

- Áo thun
- Áo sơ mi
- Áo khoác
- Quần jeans
- Quần tây
- Phụ kiện

Sản phẩm demo:

- Áo thun basic cotton
- Áo sơ mi oxford
- Quần jeans slim fit
- Quần tây công sở
- Áo khoác bomber
- Thắt lưng da nam
