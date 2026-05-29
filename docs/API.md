# API Documentation

Base URL local:

```text
http://localhost:5000/api
```

Response thành công:

```json
{
  "success": true,
  "message": "Thao tác thành công",
  "data": {}
}
```

Response lỗi:

```json
{
  "success": false,
  "message": "Mô tả lỗi"
}
```

Các endpoint cần đăng nhập dùng header:

```text
Authorization: Bearer <JWT_TOKEN>
```

## Health

| Method | Endpoint | Quyền | Mô tả |
| --- | --- | --- | --- |
| GET | `/api/health` | Public | Kiểm tra backend đang chạy |

## Auth

| Method | Endpoint | Quyền | Mô tả |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | Public | Đăng ký tài khoản khách hàng |
| POST | `/api/auth/login` | Public | Đăng nhập |
| GET | `/api/auth/me` | Customer/Admin | Lấy thông tin người dùng hiện tại |
| PUT | `/api/auth/profile` | Customer/Admin | Cập nhật hồ sơ |

Register body:

```json
{
  "name": "Nguyen Van A",
  "email": "a@example.com",
  "password": "12345678",
  "phone": "0901234567"
}
```

Login body:

```json
{
  "email": "customer@menshop.com",
  "password": "Customer123456"
}
```

Update profile body:

```json
{
  "name": "Nguyen Van A",
  "phone": "0901234567",
  "address": "TP. Ho Chi Minh"
}
```

## Products

| Method | Endpoint | Quyền | Mô tả |
| --- | --- | --- | --- |
| GET | `/api/products` | Public | Danh sách sản phẩm đang hiển thị |
| GET | `/api/products/:id` | Public | Chi tiết sản phẩm đang hiển thị |
| GET | `/api/products/admin/all` | Admin | Danh sách sản phẩm quản trị, gồm cả đã ẩn |
| POST | `/api/products` | Admin | Thêm sản phẩm |
| PUT | `/api/products/:id` | Admin | Cập nhật sản phẩm |
| DELETE | `/api/products/:id` | Admin | Ẩn sản phẩm |

Query public list:

```text
search
category
minPrice
maxPrice
size
color
page
limit
sort=newest|price_asc|price_desc
```

Ví dụ:

```text
GET /api/products?search=ao&category=ao-thun&size=M&color=Trang&page=1&limit=12&sort=price_asc
```

Create/update product body:

```json
{
  "categoryId": "category-uuid",
  "name": "Ao polo pique",
  "description": "Ao polo nam dung form",
  "price": 329000,
  "imageUrl": "https://example.com/image.jpg",
  "stock": 53,
  "isActive": true,
  "variants": [
    { "size": "S", "color": "Den", "stock": 15 },
    { "size": "M", "color": "Trang", "stock": 20 }
  ]
}
```

## Categories

| Method | Endpoint | Quyền | Mô tả |
| --- | --- | --- | --- |
| GET | `/api/categories` | Public | Danh sách danh mục |
| POST | `/api/categories` | Admin | Thêm danh mục |
| PUT | `/api/categories/:id` | Admin | Sửa danh mục |
| DELETE | `/api/categories/:id` | Admin | Xóa danh mục nếu không có sản phẩm |

Create/update category body:

```json
{
  "name": "Ao thun",
  "description": "Ao thun nam tre trung"
}
```

## Cart

| Method | Endpoint | Quyền | Mô tả |
| --- | --- | --- | --- |
| GET | `/api/cart` | Customer/Admin | Lấy giỏ hàng hiện tại |
| POST | `/api/cart` | Customer/Admin | Thêm sản phẩm vào giỏ |
| PUT | `/api/cart/:id` | Customer/Admin | Cập nhật số lượng |
| DELETE | `/api/cart/:id` | Customer/Admin | Xóa một item |
| DELETE | `/api/cart` | Customer/Admin | Xóa toàn bộ giỏ |

Add to cart body:

```json
{
  "productId": "product-uuid",
  "variantId": "variant-uuid",
  "quantity": 2
}
```

Update cart item body:

```json
{
  "quantity": 3
}
```

## Orders

| Method | Endpoint | Quyền | Mô tả |
| --- | --- | --- | --- |
| POST | `/api/orders` | Customer/Admin | Tạo đơn từ giỏ hàng |
| GET | `/api/orders/my-orders` | Customer/Admin | Lịch sử đơn hàng của tôi |
| GET | `/api/orders/:id` | Chủ đơn/Admin | Chi tiết đơn hàng |
| GET | `/api/orders` | Admin | Tất cả đơn hàng |
| PUT | `/api/orders/:id/status` | Admin | Cập nhật trạng thái đơn hàng |

Create order body:

```json
{
  "shippingName": "Nguyen Van A",
  "shippingPhone": "0901234567",
  "shippingAddress": "TP. Ho Chi Minh",
  "paymentMethod": "COD"
}
```

Online payment body:

```json
{
  "shippingName": "Nguyen Van A",
  "shippingPhone": "0901234567",
  "shippingAddress": "TP. Ho Chi Minh",
  "paymentMethod": "STRIPE"
}
```

Update order status body:

```json
{
  "status": "CONFIRMED"
}
```

Status hợp lệ:

```text
PENDING, CONFIRMED, SHIPPING, COMPLETED, CANCELLED
```

## Payments

| Method | Endpoint | Quyền | Mô tả |
| --- | --- | --- | --- |
| POST | `/api/payments/create-checkout-session` | Customer/Admin | Tạo phiên thanh toán mock |
| GET | `/api/payments/mock-gateway` | Public | Gateway giả lập success/cancel |
| GET | `/api/payments/success` | Public | Cập nhật thanh toán thành công |
| GET | `/api/payments/cancel` | Public | Cập nhật thanh toán thất bại/hủy |
| POST | `/api/payments/webhook` | Public | Webhook placeholder |

Create checkout session body:

```json
{
  "orderId": "order-uuid"
}
```

Mock success:

```text
GET /api/payments/mock-gateway?orderId=<ORDER_ID>&action=success
```

Mock cancel:

```text
GET /api/payments/mock-gateway?orderId=<ORDER_ID>&action=cancel
```

## Admin

| Method | Endpoint | Quyền | Mô tả |
| --- | --- | --- | --- |
| GET | `/api/admin/dashboard` | Admin | Thống kê tổng quan |
| GET | `/api/admin/users` | Admin | Danh sách khách hàng |
| PUT | `/api/admin/users/:id/status` | Admin | Khóa/mở khóa khách hàng |

Query users:

```text
search
page
limit
```

Update user status body:

```json
{
  "isActive": false
}
```

## Tài khoản demo

Admin:

```text
Email: admin@menshop.com
Password: Admin123456
```

Customer:

```text
Email: customer@menshop.com
Password: Customer123456
```
