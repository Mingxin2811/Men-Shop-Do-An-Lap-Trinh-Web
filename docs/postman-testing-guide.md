# Hướng dẫn test API bằng Postman

Tài liệu này dùng cho backend Men's Fashion Shop hiện tại.

## 1. Chuẩn bị backend

Mở terminal tại thư mục `backend`:

```bash
npm install
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

Backend mặc định chạy tại:

```text
http://localhost:5000
```

Swagger UI:

```text
http://localhost:5000/api-docs
```

Tài khoản seed:

```text
Admin:
email: admin@menshop.com
password: Admin123456

Customer:
email: customer@menshop.com
password: Customer123456
```

## 2. Tạo environment trong Postman

Tạo environment tên `Mens Shop Local` với các biến:

| Variable | Initial value | Current value |
| --- | --- | --- |
| `baseUrl` | `http://localhost:5000` | `http://localhost:5000` |
| `customerToken` | để trống | để trống |
| `adminToken` | để trống | để trống |
| `categoryId` | để trống | để trống |
| `productId` | để trống | để trống |
| `variantId` | để trống | để trống |
| `cartItemId` | để trống | để trống |
| `orderId` | để trống | để trống |
| `customerId` | để trống | để trống |

Với các request cần đăng nhập, vào tab `Authorization`:

- Type: `Bearer Token`
- Token: `{{customerToken}}` hoặc `{{adminToken}}`

## 3. Health check

### GET Health

```http
GET {{baseUrl}}/api/health
```

Kết quả mong đợi: `200 OK`, `success: true`.

## 4. Auth

### Login customer

```http
POST {{baseUrl}}/api/auth/login
Content-Type: application/json
```

Body:

```json
{
  "email": "customer@menshop.com",
  "password": "Customer123456"
}
```

Tab `Tests`:

```js
const json = pm.response.json();
pm.environment.set("customerToken", json.data.token);
pm.environment.set("customerId", json.data.user.id);
```

### Login admin

```http
POST {{baseUrl}}/api/auth/login
Content-Type: application/json
```

Body:

```json
{
  "email": "admin@menshop.com",
  "password": "Admin123456"
}
```

Tab `Tests`:

```js
const json = pm.response.json();
pm.environment.set("adminToken", json.data.token);
```

### Get me

```http
GET {{baseUrl}}/api/auth/me
Authorization: Bearer {{customerToken}}
```

### Update profile

```http
PUT {{baseUrl}}/api/auth/profile
Authorization: Bearer {{customerToken}}
Content-Type: application/json
```

Body:

```json
{
  "name": "Customer Demo",
  "phone": "0901234567",
  "address": "123 Nguyen Trai, TP HCM"
}
```

### Register customer mới

Dùng email khác mỗi lần test:

```http
POST {{baseUrl}}/api/auth/register
Content-Type: application/json
```

Body:

```json
{
  "name": "Nguyen Van A",
  "email": "user001@example.com",
  "password": "12345678",
  "phone": "0901234567"
}
```

## 5. Categories

### Lấy danh sách categories

```http
GET {{baseUrl}}/api/categories
```

Nếu muốn lấy category đầu tiên làm biến:

```js
const json = pm.response.json();
pm.environment.set("categoryId", json.data[0].id);
```

### Admin tạo category

```http
POST {{baseUrl}}/api/categories
Authorization: Bearer {{adminToken}}
Content-Type: application/json
```

Body:

```json
{
  "name": "Ao polo test",
  "description": "Danh muc test tu Postman"
}
```

Tests:

```js
const json = pm.response.json();
pm.environment.set("categoryId", json.data.id);
```

### Admin sửa category

```http
PUT {{baseUrl}}/api/categories/{{categoryId}}
Authorization: Bearer {{adminToken}}
Content-Type: application/json
```

Body:

```json
{
  "name": "Ao polo test updated",
  "description": "Mo ta da cap nhat"
}
```

### Admin xóa category

```http
DELETE {{baseUrl}}/api/categories/{{categoryId}}
Authorization: Bearer {{adminToken}}
```

Lưu ý: category đang có product sẽ không xóa được.

## 6. Products

### Lấy danh sách products

```http
GET {{baseUrl}}/api/products?limit=5&page=1&sort=newest
```

Tests:

```js
const json = pm.response.json();
pm.environment.set("productId", json.data.products[0].id);
if (json.data.products[0].variants?.length) {
  pm.environment.set("variantId", json.data.products[0].variants[0].id);
}
```

### Lọc/tìm kiếm/sắp xếp

```http
GET {{baseUrl}}/api/products?search=ao&category=ao-thun&minPrice=100000&maxPrice=500000&size=M&sort=price_asc&page=1&limit=12
```

### Lấy chi tiết product

```http
GET {{baseUrl}}/api/products/{{productId}}
```

### Admin tạo product

Cần có `categoryId`. Nếu chưa có, chạy `GET /api/categories` trước.

```http
POST {{baseUrl}}/api/products
Authorization: Bearer {{adminToken}}
Content-Type: application/json
```

Body:

```json
{
  "categoryId": "{{categoryId}}",
  "name": "Ao polo postman test",
  "description": "San pham tao bang Postman",
  "price": 299000,
  "imageUrl": "https://example.com/polo.jpg",
  "stock": 30,
  "variants": [
    {
      "size": "M",
      "color": "Den",
      "stock": 10
    },
    {
      "size": "L",
      "color": "Trang",
      "stock": 8
    }
  ]
}
```

Tests:

```js
const json = pm.response.json();
pm.environment.set("productId", json.data.id);
pm.environment.set("variantId", json.data.variants[0].id);
```

### Admin sửa product

```http
PUT {{baseUrl}}/api/products/{{productId}}
Authorization: Bearer {{adminToken}}
Content-Type: application/json
```

Body có thể gửi một phần:

```json
{
  "price": 319000,
  "stock": 25
}
```

### Admin ẩn product

```http
DELETE {{baseUrl}}/api/products/{{productId}}
Authorization: Bearer {{adminToken}}
```

Endpoint này là soft delete: `isActive = false`.

## 7. Cart

Đăng nhập customer trước và có `productId`.

### Xóa sạch cart trước khi test

```http
DELETE {{baseUrl}}/api/cart
Authorization: Bearer {{customerToken}}
```

### Thêm product vào cart

Không dùng variant:

```http
POST {{baseUrl}}/api/cart
Authorization: Bearer {{customerToken}}
Content-Type: application/json
```

Body:

```json
{
  "productId": "{{productId}}",
  "quantity": 1
}
```

Nếu dùng variant:

```json
{
  "productId": "{{productId}}",
  "variantId": "{{variantId}}",
  "quantity": 1
}
```

Tests:

```js
const json = pm.response.json();
pm.environment.set("cartItemId", json.data.id);
```

### Lấy cart

```http
GET {{baseUrl}}/api/cart
Authorization: Bearer {{customerToken}}
```

### Cập nhật số lượng

```http
PUT {{baseUrl}}/api/cart/{{cartItemId}}
Authorization: Bearer {{customerToken}}
Content-Type: application/json
```

Body:

```json
{
  "quantity": 2
}
```

### Xóa một item

```http
DELETE {{baseUrl}}/api/cart/{{cartItemId}}
Authorization: Bearer {{customerToken}}
```

## 8. Orders

Trước khi tạo order, cart phải có ít nhất một item.

### Tạo order COD

```http
POST {{baseUrl}}/api/orders
Authorization: Bearer {{customerToken}}
Content-Type: application/json
```

Body:

```json
{
  "shippingName": "Customer Demo",
  "shippingPhone": "0901234567",
  "shippingAddress": "123 Nguyen Trai, TP HCM",
  "paymentMethod": "COD"
}
```

Tests:

```js
const json = pm.response.json();
pm.environment.set("orderId", json.data.id);
```

### Tạo order STRIPE mock

Thêm sản phẩm vào cart lại, sau đó:

```http
POST {{baseUrl}}/api/orders
Authorization: Bearer {{customerToken}}
Content-Type: application/json
```

Body:

```json
{
  "shippingName": "Customer Demo",
  "shippingPhone": "0901234567",
  "shippingAddress": "123 Nguyen Trai, TP HCM",
  "paymentMethod": "STRIPE"
}
```

Tests:

```js
const json = pm.response.json();
pm.environment.set("orderId", json.data.id);
```

### Lấy đơn hàng của tôi

```http
GET {{baseUrl}}/api/orders/my-orders
Authorization: Bearer {{customerToken}}
```

### Lấy chi tiết order

```http
GET {{baseUrl}}/api/orders/{{orderId}}
Authorization: Bearer {{customerToken}}
```

### Admin lấy tất cả orders

```http
GET {{baseUrl}}/api/orders?page=1&limit=10
Authorization: Bearer {{adminToken}}
```

### Admin lọc orders theo status

```http
GET {{baseUrl}}/api/orders?status=PENDING
Authorization: Bearer {{adminToken}}
```

### Admin cập nhật status

```http
PUT {{baseUrl}}/api/orders/{{orderId}}/status
Authorization: Bearer {{adminToken}}
Content-Type: application/json
```

Body:

```json
{
  "status": "CONFIRMED"
}
```

Status hợp lệ:

```text
PENDING
CONFIRMED
SHIPPING
COMPLETED
CANCELLED
```

## 9. Payments

Chỉ dùng cho order có `paymentMethod = STRIPE`.

### Tạo checkout session

```http
POST {{baseUrl}}/api/payments/create-checkout-session
Authorization: Bearer {{customerToken}}
Content-Type: application/json
```

Body:

```json
{
  "orderId": "{{orderId}}"
}
```

Response sẽ có:

```json
{
  "data": {
    "checkoutUrl": "http://localhost:5000/api/payments/mock-gateway?orderId=..."
  }
}
```

### Thanh toán thành công bằng JSON

Trong Postman thêm header:

```text
Accept: application/json
```

Request:

```http
GET {{baseUrl}}/api/payments/success?orderId={{orderId}}
```

Kết quả: order chuyển `paymentStatus = PAID`, tạo/cập nhật record payment.

### Hủy thanh toán bằng JSON

Header:

```text
Accept: application/json
```

Request:

```http
GET {{baseUrl}}/api/payments/cancel?orderId={{orderId}}
```

Kết quả: order chuyển `paymentStatus = FAILED`, payment status `CANCELLED`.

### Test mock gateway redirect

```http
GET {{baseUrl}}/api/payments/mock-gateway?orderId={{orderId}}&action=success
```

Hoặc:

```http
GET {{baseUrl}}/api/payments/mock-gateway?orderId={{orderId}}&action=cancel
```

Trong Postman nên tắt `Automatically follow redirects` nếu muốn xem response `302`.

## 10. Admin

Tất cả request admin cần:

```text
Authorization: Bearer {{adminToken}}
```

### Dashboard

```http
GET {{baseUrl}}/api/admin/dashboard
```

### Danh sách users

```http
GET {{baseUrl}}/api/admin/users?page=1&limit=10
```

Tìm kiếm:

```http
GET {{baseUrl}}/api/admin/users?search=customer
```

Tests để lấy `customerId`:

```js
const json = pm.response.json();
pm.environment.set("customerId", json.data.users[0].id);
```

### Khóa customer

```http
PUT {{baseUrl}}/api/admin/users/{{customerId}}/status
Content-Type: application/json
```

Body:

```json
{
  "isActive": false
}
```

### Mở khóa customer

```http
PUT {{baseUrl}}/api/admin/users/{{customerId}}/status
Content-Type: application/json
```

Body:

```json
{
  "isActive": true
}
```

Lưu ý: nếu khóa tài khoản `customer@menshop.com`, hãy mở khóa lại để tiếp tục test các luồng customer.

## 11. Thứ tự test khuyến nghị

1. `GET /api/health`
2. Login customer, lưu `customerToken`
3. Login admin, lưu `adminToken`
4. `GET /api/categories`, lưu `categoryId`
5. `GET /api/products`, lưu `productId` và `variantId`
6. Clear cart
7. Add to cart
8. Get cart
9. Create order COD
10. Add to cart lại
11. Create order STRIPE
12. Create checkout session
13. Payment success
14. Admin dashboard
15. Admin list/update orders
16. Admin list/lock/unlock users

## 12. Lỗi thường gặp

### 401 - Vui lòng đăng nhập

Chưa set Bearer Token hoặc token sai. Hãy login lại và lưu token vào environment.

### 403 - Không có quyền

Đang dùng customer token cho API admin. Đổi sang `{{adminToken}}`.

### 400 - Giỏ hàng trống

Bạn tạo order khi cart không có item. Hãy gọi `POST /api/cart` trước.

### 400 - Đơn hàng COD không cần checkout online

Chỉ gọi payment checkout cho order có `paymentMethod = STRIPE`.

### 409 - Đã tồn tại

Tên category/product tạo slug trùng. Đổi tên mới, vì slug là unique.
