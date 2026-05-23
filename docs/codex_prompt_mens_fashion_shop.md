# PROMPT CHI TIẾT CHO CODEX - DỰ ÁN WEBSITE BÁN THỜI TRANG NAM

## 1. Vai trò của Codex

Bạn là một lập trình viên full-stack. Hãy xây dựng một website bán thời trang nam ở mức đồ án sinh viên, có frontend, backend, database, API, admin dashboard, thanh toán test/sandbox và Docker để chạy local/deploy.

Dự án cần ưu tiên:

1. Chạy được thực tế.
2. Code rõ ràng, dễ hiểu, dễ sửa.
3. Có cấu trúc thư mục chuẩn.
4. API trả về JSON rõ ràng.
5. Giao diện responsive trên desktop và mobile.
6. Có dữ liệu mẫu để demo.
7. Có Dockerfile, docker-compose và README hướng dẫn chạy.

Không cần làm quá phức tạp như website thương mại điện tử thật. Tập trung vào bản hoàn chỉnh vừa đủ để demo đồ án.

---

## 2. Mục tiêu hệ thống

Xây dựng website bán thời trang nam có các chức năng cơ bản của một website thương mại điện tử:

1. Hiển thị trang chủ.
2. Hiển thị danh sách sản phẩm.
3. Tìm kiếm, lọc, sắp xếp sản phẩm.
4. Xem chi tiết sản phẩm.
5. Đăng ký, đăng nhập.
6. Thêm sản phẩm vào giỏ hàng.
7. Cập nhật giỏ hàng.
8. Đặt hàng.
9. Thanh toán online ở chế độ test/sandbox.
10. Xem lịch sử đơn hàng.
11. Trang quản trị cho admin.
12. Quản lý sản phẩm, danh mục, đơn hàng, người dùng.
13. Dashboard thống kê cơ bản.
14. Docker hóa frontend, backend và PostgreSQL.

---

## 3. Công nghệ bắt buộc sử dụng

### 3.1. Frontend

Sử dụng:

1. ReactJS.
2. Vite.
3. Bootstrap hoặc React Bootstrap.
4. React Router DOM.
5. Axios.
6. Context API hoặc Zustand để quản lý auth/cart ở mức đơn giản.

Yêu cầu frontend:

1. Code chia component rõ ràng.
2. Có layout chung gồm Navbar, Footer.
3. Có route public, route customer và route admin.
4. Có responsive UI.
5. Giao diện lấy cảm hứng từ template Male Fashion:
   - Link tham khảo: https://themewagon.github.io/malefashion/index.html
   - Không cần giống toàn bộ tính năng.
   - Chỉ cần tương tự về bố cục, màu sắc, cách trình bày sản phẩm, banner, hình ảnh.
   - Ưu tiên phong cách nam tính, hiện đại, tối giản.
   - Màu chủ đạo: trắng, đen, xám, điểm nhấn đỏ/cam nhẹ nếu cần.

### 3.2. Backend

Sử dụng:

1. NodeJS.
2. ExpressJS.
3. PostgreSQL.
4. Prisma ORM.
5. JWT authentication.
6. bcrypt để mã hóa mật khẩu.
7. dotenv.
8. cors.
9. express-validator hoặc zod để validate dữ liệu.
10. Stripe test mode cho thanh toán online.

Nếu cấu hình Stripe phức tạp, hãy tạo luồng payment demo đơn giản nhưng vẫn có endpoint rõ ràng:

1. Tạo checkout session.
2. Xử lý success.
3. Xử lý cancel.
4. Cập nhật payment_status của đơn hàng.

### 3.3. Database

Sử dụng PostgreSQL và Prisma.

Database phải có các bảng chính:

1. users.
2. categories.
3. products.
4. product_variants.
5. cart_items.
6. orders.
7. order_items.
8. payments.

### 3.4. Docker

Cần có:

1. Dockerfile cho backend.
2. Dockerfile cho frontend.
3. docker-compose.yml để chạy local gồm:
   - PostgreSQL container.
   - Backend container.
   - Frontend container.
4. File `.env.example` cho backend.
5. File `.env.example` cho frontend.

---

## 4. Cấu trúc thư mục yêu cầu

Hãy tạo project theo cấu trúc sau:

```text
mens-fashion-shop/
│
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.js
│   │
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js
│   │   │   └── stripe.js
│   │   │
│   │   ├── controllers/
│   │   │   ├── auth.controller.js
│   │   │   ├── product.controller.js
│   │   │   ├── category.controller.js
│   │   │   ├── cart.controller.js
│   │   │   ├── order.controller.js
│   │   │   ├── payment.controller.js
│   │   │   └── admin.controller.js
│   │   │
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.js
│   │   │   ├── admin.middleware.js
│   │   │   ├── error.middleware.js
│   │   │   └── validate.middleware.js
│   │   │
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── product.routes.js
│   │   │   ├── category.routes.js
│   │   │   ├── cart.routes.js
│   │   │   ├── order.routes.js
│   │   │   ├── payment.routes.js
│   │   │   └── admin.routes.js
│   │   │
│   │   ├── utils/
│   │   │   ├── generateToken.js
│   │   │   ├── slugify.js
│   │   │   └── response.js
│   │   │
│   │   ├── app.js
│   │   └── server.js
│   │
│   ├── .env.example
│   ├── Dockerfile
│   ├── package.json
│   └── README.md
│
├── frontend/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   ├── product/
│   │   │   ├── cart/
│   │   │   └── admin/
│   │   │
│   │   ├── contexts/
│   │   │   ├── AuthContext.jsx
│   │   │   └── CartContext.jsx
│   │   │
│   │   ├── layouts/
│   │   │   ├── MainLayout.jsx
│   │   │   └── AdminLayout.jsx
│   │   │
│   │   ├── pages/
│   │   │   ├── HomePage.jsx
│   │   │   ├── ProductListPage.jsx
│   │   │   ├── ProductDetailPage.jsx
│   │   │   ├── CartPage.jsx
│   │   │   ├── CheckoutPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── ProfilePage.jsx
│   │   │   ├── OrderHistoryPage.jsx
│   │   │   ├── PaymentSuccessPage.jsx
│   │   │   ├── PaymentCancelPage.jsx
│   │   │   └── admin/
│   │   │       ├── AdminDashboardPage.jsx
│   │   │       ├── AdminProductsPage.jsx
│   │   │       ├── AdminCategoriesPage.jsx
│   │   │       ├── AdminOrdersPage.jsx
│   │   │       └── AdminUsersPage.jsx
│   │   │
│   │   ├── routes/
│   │   │   ├── AppRoutes.jsx
│   │   │   ├── PrivateRoute.jsx
│   │   │   └── AdminRoute.jsx
│   │   │
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   ├── auth.service.js
│   │   │   ├── product.service.js
│   │   │   ├── cart.service.js
│   │   │   ├── order.service.js
│   │   │   └── payment.service.js
│   │   │
│   │   ├── styles/
│   │   │   └── main.css
│   │   │
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── .env.example
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── package.json
│   └── README.md
│
├── docker-compose.yml
├── README.md
└── docs/
    ├── API.md
    ├── DATABASE.md
    └── DEPLOYMENT.md
```

---

## 5. Quy trình thực hiện tổng quát

Hãy thực hiện dự án theo đúng thứ tự sau:

1. Tạo cấu trúc project.
2. Tạo backend ExpressJS.
3. Cấu hình Prisma và PostgreSQL.
4. Tạo schema database.
5. Tạo seed data.
6. Tạo API auth.
Đã hoàn thành phần 6
7. Tạo API categories.
8. Tạo API products.
9. Tạo API cart.
10. Tạo API orders.
11. Tạo API payments.
12. Tạo API admin.
13. Tạo frontend React.
14. Tạo layout người dùng.
15. Tạo layout admin.
16. Kết nối frontend với API thật.
17. Tạo Dockerfile backend.
18. Tạo Dockerfile frontend.
19. Tạo docker-compose.
20. Viết README hướng dẫn chạy.
21. Kiểm thử các luồng chính.
22. Sửa lỗi nếu có.

Sau mỗi bước lớn, hãy đảm bảo code có thể chạy được trước khi chuyển sang bước tiếp theo.

---

## 6. Thiết kế database bằng Prisma

Hãy tạo file `backend/prisma/schema.prisma` với các model sau.

### 6.1. User

Yêu cầu field:

1. id: String, UUID, primary key.
2. name: String.
3. email: String, unique.
4. password: String.
5. phone: String optional.
6. address: String optional.
7. role: enum UserRole, gồm CUSTOMER và ADMIN.
8. isActive: Boolean, mặc định true.
9. createdAt: DateTime.
10. updatedAt: DateTime.

Quan hệ:

1. Một user có nhiều cart_items.
2. Một user có nhiều orders.

### 6.2. Category

Yêu cầu field:

1. id: String, UUID, primary key.
2. name: String.
3. slug: String, unique.
4. description: String optional.
5. createdAt: DateTime.
6. updatedAt: DateTime.

Quan hệ:

1. Một category có nhiều products.

### 6.3. Product

Yêu cầu field:

1. id: String, UUID, primary key.
2. categoryId: String.
3. name: String.
4. slug: String, unique.
5. description: String.
6. price: Decimal.
7. imageUrl: String.
8. stock: Int.
9. isActive: Boolean, mặc định true.
10. createdAt: DateTime.
11. updatedAt: DateTime.

Quan hệ:

1. Một product thuộc một category.
2. Một product có nhiều product_variants.
3. Một product có nhiều cart_items.
4. Một product có nhiều order_items.

### 6.4. ProductVariant

Yêu cầu field:

1. id: String, UUID, primary key.
2. productId: String.
3. size: String.
4. color: String.
5. stock: Int.

Quan hệ:

1. Một variant thuộc một product.
2. Một variant có thể xuất hiện trong cart_items.
3. Một variant có thể xuất hiện trong order_items.

### 6.5. CartItem

Yêu cầu field:

1. id: String, UUID, primary key.
2. userId: String.
3. productId: String.
4. variantId: String optional.
5. quantity: Int.
6. createdAt: DateTime.

Quan hệ:

1. Một cart item thuộc một user.
2. Một cart item thuộc một product.
3. Một cart item có thể thuộc một variant.

### 6.6. Order

Yêu cầu field:

1. id: String, UUID, primary key.
2. userId: String.
3. totalAmount: Decimal.
4. status: enum OrderStatus.
5. paymentStatus: enum PaymentStatus.
6. paymentMethod: String.
7. shippingName: String.
8. shippingPhone: String.
9. shippingAddress: String.
10. createdAt: DateTime.
11. updatedAt: DateTime.

Quan hệ:

1. Một order thuộc một user.
2. Một order có nhiều order_items.
3. Một order có thể có một payment.

### 6.7. OrderItem

Yêu cầu field:

1. id: String, UUID, primary key.
2. orderId: String.
3. productId: String.
4. variantId: String optional.
5. productName: String.
6. price: Decimal.
7. quantity: Int.
8. size: String optional.
9. color: String optional.

Lưu ý:

1. `productName`, `price`, `size`, `color` phải lưu lại tại thời điểm mua.
2. Không chỉ join trực tiếp từ product, vì sau này sản phẩm có thể đổi tên hoặc đổi giá.

### 6.8. Payment

Yêu cầu field:

1. id: String, UUID, primary key.
2. orderId: String, unique.
3. provider: String, ví dụ STRIPE hoặc VNPAY.
4. transactionId: String optional.
5. amount: Decimal.
6. status: enum PaymentRecordStatus.
7. createdAt: DateTime.

### 6.9. Enum

Tạo các enum:

```text
UserRole:
- CUSTOMER
- ADMIN

OrderStatus:
- PENDING
- CONFIRMED
- SHIPPING
- COMPLETED
- CANCELLED

PaymentStatus:
- UNPAID
- PENDING
- PAID
- FAILED
- REFUNDED

PaymentRecordStatus:
- PENDING
- PAID
- FAILED
- CANCELLED
```

---

## 7. Seed data

Hãy tạo file `backend/prisma/seed.js`.

Seed data cần có:

### 7.1. Tài khoản admin

```text
Email: admin@menshop.com
Password: Admin123456
Role: ADMIN
```

Mật khẩu phải được mã hóa bằng bcrypt.

### 7.2. Tài khoản khách hàng demo

```text
Email: customer@menshop.com
Password: Customer123456
Role: CUSTOMER
```

### 7.3. Danh mục demo

Tạo các danh mục:

1. Áo thun.
2. Áo sơ mi.
3. Áo khoác.
4. Quần jeans.
5. Quần tây.
6. Phụ kiện.

### 7.4. Sản phẩm demo

Tạo ít nhất 12 sản phẩm nam, ví dụ:

1. Áo thun basic cotton.
2. Áo thun oversized.
3. Áo sơ mi oxford.
4. Áo sơ mi linen.
5. Quần jeans slim fit.
6. Quần jeans straight fit.
7. Quần tây công sở.
8. Quần chinos nam.
9. Áo khoác bomber.
10. Áo khoác denim.
11. Thắt lưng da nam.
12. Ví da nam.

Mỗi sản phẩm cần có:

1. Tên.
2. Slug.
3. Mô tả.
4. Giá.
5. Ảnh đại diện.
6. Tồn kho.
7. Danh mục.
8. Biến thể size/màu.

Có thể dùng ảnh placeholder từ Unsplash hoặc link ảnh online hợp lệ.

---

## 8. Backend API cần xây dựng

Tất cả API bắt đầu bằng prefix:

```text
/api
```

Response JSON nên thống nhất theo dạng:

```json
{
  "success": true,
  "message": "Thao tác thành công",
  "data": {}
}
```

Khi lỗi:

```json
{
  "success": false,
  "message": "Mô tả lỗi"
}
```

---

## 9. API Auth

### 9.1. POST `/api/auth/register`

Chức năng:

1. Đăng ký tài khoản khách hàng.
2. Nhận name, email, password, phone.
3. Kiểm tra email không trùng.
4. Mã hóa password bằng bcrypt.
5. Role mặc định là CUSTOMER.
6. Trả về user không bao gồm password.

Body:

```json
{
  "name": "Nguyen Van A",
  "email": "a@example.com",
  "password": "12345678",
  "phone": "0901234567"
}
```

### 9.2. POST `/api/auth/login`

Chức năng:

1. Đăng nhập bằng email và password.
2. Kiểm tra tài khoản có tồn tại không.
3. Kiểm tra password.
4. Kiểm tra isActive.
5. Trả về JWT và thông tin user.

Body:

```json
{
  "email": "a@example.com",
  "password": "12345678"
}
```

### 9.3. GET `/api/auth/me`

Quyền:

1. CUSTOMER.
2. ADMIN.

Chức năng:

1. Lấy thông tin user hiện tại dựa trên JWT.

### 9.4. PUT `/api/auth/profile`

Quyền:

1. CUSTOMER.
2. ADMIN.

Chức năng:

1. Cập nhật name, phone, address.
2. Không cho đổi role ở endpoint này.

---

## 10. API Products

### 10.1. GET `/api/products`

Public.

Hỗ trợ query:

```text
search
category
minPrice
maxPrice
size
color
page
limit
sort
```

Ví dụ:

```text
/api/products?search=ao&category=ao-thun&minPrice=100000&maxPrice=500000&page=1&limit=12&sort=price_asc
```

Yêu cầu:

1. Chỉ hiển thị sản phẩm `isActive = true` cho public.
2. Có phân trang.
3. Có tổng số sản phẩm.
4. Có tổng số trang.
5. Có lọc theo danh mục.
6. Có tìm kiếm theo tên.
7. Có sắp xếp:
   - newest.
   - price_asc.
   - price_desc.

### 10.2. GET `/api/products/:id`

Public.

Chức năng:

1. Lấy chi tiết sản phẩm.
2. Include category.
3. Include variants.

### 10.3. POST `/api/products`

Admin only.

Chức năng:

1. Thêm sản phẩm.
2. Tự tạo slug từ name.
3. Cho phép thêm variants nếu có.
4. Validate price > 0, stock >= 0.

### 10.4. PUT `/api/products/:id`

Admin only.

Chức năng:

1. Cập nhật thông tin sản phẩm.
2. Cập nhật variants nếu có.
3. Không bắt buộc cập nhật toàn bộ field.

### 10.5. DELETE `/api/products/:id`

Admin only.

Chức năng:

1. Không xóa cứng.
2. Chỉ cập nhật `isActive = false`.

---

## 11. API Categories

### 11.1. GET `/api/categories`

Public.

Chức năng:

1. Lấy danh sách danh mục.
2. Include số lượng sản phẩm nếu làm được.

### 11.2. POST `/api/categories`

Admin only.

Chức năng:

1. Thêm danh mục.
2. Tự tạo slug.
3. Không cho trùng slug.

### 11.3. PUT `/api/categories/:id`

Admin only.

Chức năng:

1. Sửa tên, mô tả.
2. Cập nhật slug nếu đổi tên.

### 11.4. DELETE `/api/categories/:id`

Admin only.

Chức năng:

1. Chỉ cho xóa nếu chưa có sản phẩm liên quan.
2. Nếu có sản phẩm, trả về lỗi rõ ràng.

---

## 12. API Cart

Tất cả API cart yêu cầu đăng nhập CUSTOMER.

### 12.1. GET `/api/cart`

Chức năng:

1. Lấy giỏ hàng của user hiện tại.
2. Include product và variant.
3. Tính subtotal từng dòng.
4. Tính total toàn giỏ.

### 12.2. POST `/api/cart`

Body:

```json
{
  "productId": "uuid",
  "variantId": "uuid",
  "quantity": 2
}
```

Chức năng:

1. Thêm sản phẩm vào giỏ.
2. Nếu sản phẩm đã tồn tại trong giỏ với cùng variant thì cộng số lượng.
3. Kiểm tra tồn kho.
4. Không cho thêm sản phẩm inactive.

### 12.3. PUT `/api/cart/:id`

Body:

```json
{
  "quantity": 3
}
```

Chức năng:

1. Cập nhật số lượng.
2. Chỉ user sở hữu cart item mới được sửa.
3. Kiểm tra tồn kho.

### 12.4. DELETE `/api/cart/:id`

Chức năng:

1. Xóa một sản phẩm khỏi giỏ.
2. Chỉ user sở hữu cart item mới được xóa.

### 12.5. DELETE `/api/cart`

Chức năng:

1. Xóa toàn bộ giỏ hàng của user hiện tại.

---

## 13. API Orders

### 13.1. POST `/api/orders`

Customer only.

Body:

```json
{
  "shippingName": "Nguyen Van A",
  "shippingPhone": "0901234567",
  "shippingAddress": "TP. Ho Chi Minh",
  "paymentMethod": "STRIPE"
}
```

Chức năng:

1. Tạo đơn hàng từ giỏ hàng hiện tại.
2. Nếu giỏ hàng trống thì báo lỗi.
3. Kiểm tra tồn kho trước khi tạo đơn.
4. Tạo order với status = PENDING.
5. Tạo paymentStatus = UNPAID hoặc PENDING tùy payment method.
6. Tạo order_items từ cart_items.
7. Lưu productName, price, size, color tại thời điểm đặt.
8. Trừ tồn kho sản phẩm/variant.
9. Xóa giỏ hàng sau khi tạo đơn thành công.
10. Trả về order vừa tạo.

### 13.2. GET `/api/orders/my-orders`

Customer only.

Chức năng:

1. Lấy danh sách đơn hàng của user hiện tại.
2. Sắp xếp mới nhất trước.
3. Include order_items.

### 13.3. GET `/api/orders/:id`

Customer/Admin.

Chức năng:

1. Customer chỉ xem đơn hàng của chính mình.
2. Admin được xem mọi đơn.
3. Include order_items, payment, user cơ bản.

### 13.4. GET `/api/orders`

Admin only.

Chức năng:

1. Lấy tất cả đơn hàng.
2. Hỗ trợ lọc theo status.
3. Hỗ trợ phân trang.
4. Sắp xếp mới nhất trước.

### 13.5. PUT `/api/orders/:id/status`

Admin only.

Body:

```json
{
  "status": "CONFIRMED"
}
```

Chức năng:

1. Cập nhật trạng thái đơn hàng.
2. Chỉ cho các trạng thái:
   - PENDING.
   - CONFIRMED.
   - SHIPPING.
   - COMPLETED.
   - CANCELLED.

---

## 14. API Payments

### 14.1. POST `/api/payments/create-checkout-session`

Customer only.

Body:

```json
{
  "orderId": "uuid"
}
```

Chức năng:

1. Kiểm tra order thuộc user hiện tại.
2. Kiểm tra order chưa thanh toán.
3. Tạo Stripe checkout session ở test mode.
4. Trả về checkout URL.

Nếu chưa cấu hình Stripe thật, hãy tạo mock payment URL nội bộ hoặc endpoint demo nhưng phải ghi chú rõ trong README.

### 14.2. POST `/api/payments/webhook`

Public.

Chức năng:

1. Nhận webhook từ Stripe nếu cấu hình được.
2. Khi payment thành công:
   - Cập nhật payment_status của order thành PAID.
   - Cập nhật payment record thành PAID.
3. Khi thất bại:
   - Cập nhật FAILED.

### 14.3. GET `/api/payments/success`

Public.

Chức năng:

1. Xử lý khi thanh toán thành công.
2. Có thể redirect về frontend route `/payment-success`.

### 14.4. GET `/api/payments/cancel`

Public.

Chức năng:

1. Xử lý khi hủy thanh toán.
2. Có thể redirect về frontend route `/payment-cancel`.

---

## 15. API Admin

### 15.1. GET `/api/admin/dashboard`

Admin only.

Trả về:

1. Tổng số sản phẩm.
2. Tổng số đơn hàng.
3. Tổng doanh thu từ đơn hàng COMPLETED.
4. Tổng số người dùng.
5. Danh sách đơn hàng mới nhất.

### 15.2. GET `/api/admin/users`

Admin only.

Chức năng:

1. Lấy danh sách người dùng.
2. Không trả password.
3. Hỗ trợ tìm kiếm theo email/name.
4. Hỗ trợ phân trang.

### 15.3. PUT `/api/admin/users/:id/status`

Admin only.

Body:

```json
{
  "isActive": false
}
```

Chức năng:

1. Khóa hoặc mở khóa tài khoản.
2. Không cho admin tự khóa chính mình nếu có thể.

---

## 16. Middleware backend

Cần tạo các middleware sau.

### 16.1. auth.middleware.js

Chức năng:

1. Lấy token từ header Authorization dạng Bearer token.
2. Verify JWT.
3. Gắn user vào `req.user`.
4. Nếu token sai hoặc thiếu thì trả 401.

### 16.2. admin.middleware.js

Chức năng:

1. Kiểm tra `req.user.role === "ADMIN"`.
2. Nếu không phải admin thì trả 403.

### 16.3. error.middleware.js

Chức năng:

1. Bắt lỗi tập trung.
2. Trả JSON thống nhất.
3. Không để server crash vì lỗi thông thường.

### 16.4. validate.middleware.js

Chức năng:

1. Validate request body/query/params.
2. Trả lỗi rõ ràng nếu dữ liệu không hợp lệ.

---

## 17. Frontend routes

Tạo các route sau.

### 17.1. Public routes

```text
/
 /products
 /products/:id
 /login
 /register
 /payment-success
 /payment-cancel
```

### 17.2. Customer routes

```text
/cart
/checkout
/profile
/orders
/orders/:id
```

### 17.3. Admin routes

```text
/admin
/admin/products
/admin/categories
/admin/orders
/admin/users
```

---

## 18. Frontend layout người dùng

### 18.1. Navbar

Navbar gồm:

1. Logo hoặc tên shop: Men Fashion.
2. Link Home.
3. Link Shop.
4. Link Cart.
5. Link Orders nếu đã đăng nhập.
6. Link Login/Register nếu chưa đăng nhập.
7. Dropdown user nếu đã đăng nhập.
8. Link Admin nếu user là ADMIN.

### 18.2. Footer

Footer gồm:

1. Tên shop.
2. Mô tả ngắn.
3. Link nhanh.
4. Thông tin liên hệ demo.
5. Copyright.

### 18.3. Trang chủ

Trang chủ cần có:

1. Hero banner lớn.
2. Nút Shop Now.
3. Section danh mục nổi bật.
4. Section sản phẩm mới.
5. Section giới thiệu phong cách thời trang nam.
6. Bố cục tương tự template Male Fashion.

### 18.4. Trang danh sách sản phẩm

Cần có:

1. Grid sản phẩm.
2. Sidebar hoặc thanh lọc.
3. Tìm kiếm theo tên.
4. Lọc danh mục.
5. Lọc khoảng giá.
6. Sắp xếp.
7. Phân trang.
8. Card sản phẩm gồm ảnh, tên, giá, danh mục, nút xem chi tiết.

### 18.5. Trang chi tiết sản phẩm

Cần có:

1. Ảnh sản phẩm lớn.
2. Tên sản phẩm.
3. Giá.
4. Mô tả.
5. Danh mục.
6. Size.
7. Màu.
8. Số lượng.
9. Tồn kho.
10. Nút thêm vào giỏ hàng.

### 18.6. Trang giỏ hàng

Cần có:

1. Danh sách sản phẩm trong giỏ.
2. Ảnh sản phẩm.
3. Tên.
4. Size/màu.
5. Giá.
6. Số lượng.
7. Subtotal.
8. Nút cập nhật số lượng.
9. Nút xóa.
10. Tổng tiền.
11. Nút sang checkout.

### 18.7. Trang checkout

Cần có:

1. Form thông tin giao hàng.
2. Tên người nhận.
3. Số điện thoại.
4. Địa chỉ.
5. Phương thức thanh toán:
   - COD.
   - STRIPE test.
6. Tóm tắt đơn hàng.
7. Nút đặt hàng.

### 18.8. Trang lịch sử đơn hàng

Cần có:

1. Danh sách đơn hàng.
2. Mã đơn.
3. Ngày đặt.
4. Tổng tiền.
5. Trạng thái đơn hàng.
6. Trạng thái thanh toán.
7. Nút xem chi tiết.

---

## 19. Frontend admin

### 19.1. Admin layout

Cần có:

1. Sidebar.
2. Header.
3. Link Dashboard.
4. Link Products.
5. Link Categories.
6. Link Orders.
7. Link Users.
8. Nút quay lại website.

### 19.2. Admin dashboard

Hiển thị:

1. Tổng số sản phẩm.
2. Tổng số đơn hàng.
3. Tổng doanh thu.
4. Tổng số người dùng.
5. Bảng đơn hàng mới nhất.

### 19.3. Admin products

Cần có:

1. Bảng danh sách sản phẩm.
2. Nút thêm sản phẩm.
3. Form thêm/sửa sản phẩm.
4. Xóa hoặc ẩn sản phẩm.
5. Cập nhật giá, tồn kho, mô tả, ảnh.
6. Quản lý size/màu ở mức đơn giản.

### 19.4. Admin categories

Cần có:

1. Bảng danh mục.
2. Form thêm danh mục.
3. Form sửa danh mục.
4. Xóa danh mục nếu được backend cho phép.

### 19.5. Admin orders

Cần có:

1. Bảng đơn hàng.
2. Lọc theo trạng thái.
3. Xem chi tiết đơn hàng.
4. Cập nhật trạng thái đơn hàng.

### 19.6. Admin users

Cần có:

1. Bảng người dùng.
2. Tìm kiếm user.
3. Khóa/mở khóa tài khoản.

---

## 20. Giao diện và CSS

Hãy tạo file `frontend/src/styles/main.css`.

Yêu cầu style:

1. Bố cục sạch, hiện đại.
2. Màu chủ đạo:
   - Đen: #111111.
   - Trắng: #ffffff.
   - Xám nhạt: #f5f5f5.
   - Xám chữ: #666666.
   - Điểm nhấn: #e53637 hoặc màu đỏ/cam nhẹ.
3. Card sản phẩm có hover nhẹ.
4. Button rõ ràng.
5. Admin layout khác biệt với user layout.
6. Responsive:
   - Mobile: sản phẩm 1 cột.
   - Tablet: 2 cột.
   - Desktop: 3 hoặc 4 cột.
7. Form dễ nhìn.
8. Không dùng màu quá chói.

---

## 21. Xử lý auth frontend

Cần tạo AuthContext.

Chức năng:

1. Lưu token vào localStorage.
2. Lưu user vào state.
3. Login.
4. Register.
5. Logout.
6. Load user hiện tại bằng `/api/auth/me`.
7. Axios tự gắn token vào Authorization header.
8. Nếu token hết hạn hoặc lỗi 401 thì logout.

---

## 22. Xử lý cart frontend

Cần tạo CartContext hoặc logic tương đương.

Chức năng:

1. Lấy giỏ hàng từ API.
2. Thêm vào giỏ.
3. Cập nhật số lượng.
4. Xóa sản phẩm.
5. Xóa toàn bộ giỏ.
6. Tính tổng tiền hiển thị.
7. Cập nhật số lượng item trên Navbar.

---

## 23. Validate dữ liệu

### 23.1. Backend validate

Cần validate:

1. Register:
   - name không rỗng.
   - email đúng định dạng.
   - password tối thiểu 6 ký tự.
2. Login:
   - email đúng định dạng.
   - password không rỗng.
3. Product:
   - name không rỗng.
   - price > 0.
   - stock >= 0.
4. Cart:
   - quantity > 0.
5. Order:
   - shippingName không rỗng.
   - shippingPhone không rỗng.
   - shippingAddress không rỗng.
6. Category:
   - name không rỗng.

### 23.2. Frontend validate

Cần hiển thị lỗi dễ hiểu cho người dùng khi:

1. Form thiếu dữ liệu.
2. Login sai.
3. Register email đã tồn tại.
4. Không đủ tồn kho.
5. Giỏ hàng trống.
6. Không có quyền vào admin.

---

## 24. File môi trường

### 24.1. Backend `.env.example`

Tạo file:

```text
PORT=5000
DATABASE_URL=postgresql://mens_shop:mens_shop_password@localhost:5432/mens_shop_db
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173

PAYMENT_PROVIDER=stripe
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
STRIPE_SUCCESS_URL=http://localhost:5173/payment-success
STRIPE_CANCEL_URL=http://localhost:5173/payment-cancel
```

### 24.2. Frontend `.env.example`

Tạo file:

```text
VITE_API_URL=http://localhost:5000/api
```

---

## 25. Docker

### 25.1. Backend Dockerfile

Tạo `backend/Dockerfile`:

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npx prisma generate

EXPOSE 5000

CMD ["npm", "start"]
```

### 25.2. Frontend Dockerfile

Tạo `frontend/Dockerfile`:

```dockerfile
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### 25.3. Frontend nginx.conf

Tạo `frontend/nginx.conf`:

```nginx
server {
  listen 80;
  server_name _;

  root /usr/share/nginx/html;
  index index.html;

  location / {
    try_files $uri /index.html;
  }
}
```

### 25.4. docker-compose.yml

Tạo file ở root:

```yaml
services:
  postgres:
    image: postgres:16
    container_name: mens_shop_postgres
    environment:
      POSTGRES_USER: mens_shop
      POSTGRES_PASSWORD: mens_shop_password
      POSTGRES_DB: mens_shop_db
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backend:
    build: ./backend
    container_name: mens_shop_backend
    environment:
      PORT: 5000
      DATABASE_URL: postgresql://mens_shop:mens_shop_password@postgres:5432/mens_shop_db
      JWT_SECRET: change_me
      CLIENT_URL: http://localhost:5173
      PAYMENT_PROVIDER: stripe
      STRIPE_SECRET_KEY: your_stripe_secret_key
      STRIPE_WEBHOOK_SECRET: your_stripe_webhook_secret
      STRIPE_SUCCESS_URL: http://localhost:5173/payment-success
      STRIPE_CANCEL_URL: http://localhost:5173/payment-cancel
    ports:
      - "5000:5000"
    depends_on:
      - postgres

  frontend:
    build: ./frontend
    container_name: mens_shop_frontend
    environment:
      VITE_API_URL: http://localhost:5000/api
    ports:
      - "5173:80"
    depends_on:
      - backend

volumes:
  postgres_data:
```

---

## 26. README cần viết

Tạo file `README.md` ở root bằng tiếng Việt.

README phải có các mục:

1. Tên dự án.
2. Mô tả dự án.
3. Công nghệ sử dụng.
4. Chức năng chính.
5. Cấu trúc thư mục.
6. Hướng dẫn chạy backend local.
7. Hướng dẫn chạy frontend local.
8. Hướng dẫn chạy bằng Docker Compose.
9. Hướng dẫn migrate database.
10. Hướng dẫn seed dữ liệu.
11. Tài khoản demo.
12. API chính.
13. Cách test thanh toán.
14. Ghi chú deploy.
15. Thành viên nhóm và phân công nếu cần.

Tài khoản demo cần ghi rõ:

```text
Admin:
Email: admin@menshop.com
Password: Admin123456

Customer:
Email: customer@menshop.com
Password: Customer123456
```

---

## 27. Docs cần tạo

Trong thư mục `docs`, tạo:

### 27.1. `docs/API.md`

Ghi rõ:

1. Danh sách endpoint.
2. Method.
3. Quyền truy cập.
4. Body mẫu.
5. Response mẫu.

### 27.2. `docs/DATABASE.md`

Ghi rõ:

1. Danh sách bảng.
2. Thuộc tính chính.
3. Quan hệ giữa các bảng.
4. Enum.
5. Seed data.

### 27.3. `docs/DEPLOYMENT.md`

Ghi rõ:

1. Kiến trúc deploy.
2. Cách deploy backend Docker.
3. Cách deploy frontend Docker.
4. Cách cấu hình PostgreSQL hosted.
5. Cách cấu hình biến môi trường.
6. Cách kiểm thử sau deploy.

---

## 28. Luồng kiểm thử bắt buộc

Sau khi code xong, hãy đảm bảo các luồng sau chạy được.

### 28.1. Luồng khách vãng lai

1. Mở trang chủ.
2. Xem danh sách sản phẩm.
3. Tìm kiếm sản phẩm.
4. Lọc sản phẩm theo danh mục.
5. Xem chi tiết sản phẩm.
6. Đăng ký tài khoản.
7. Đăng nhập.

### 28.2. Luồng khách hàng

1. Đăng nhập customer.
2. Thêm sản phẩm vào giỏ.
3. Cập nhật số lượng.
4. Xóa sản phẩm khỏi giỏ.
5. Thêm lại sản phẩm.
6. Vào checkout.
7. Nhập thông tin giao hàng.
8. Tạo đơn hàng.
9. Thanh toán test hoặc COD.
10. Xem lịch sử đơn hàng.
11. Xem chi tiết đơn hàng.

### 28.3. Luồng admin

1. Đăng nhập admin.
2. Vào dashboard.
3. Xem thống kê.
4. Thêm danh mục.
5. Sửa danh mục.
6. Thêm sản phẩm.
7. Sửa sản phẩm.
8. Ẩn sản phẩm.
9. Xem đơn hàng.
10. Cập nhật trạng thái đơn hàng.
11. Xem danh sách user.
12. Khóa/mở khóa user.

### 28.4. Luồng kỹ thuật

1. Chạy backend local được.
2. Chạy frontend local được.
3. Chạy Prisma migrate được.
4. Chạy seed được.
5. Docker build backend thành công.
6. Docker build frontend thành công.
7. Docker Compose chạy được.
8. Frontend gọi backend trong Docker được.
9. API admin yêu cầu quyền ADMIN.
10. Password trong database không lưu plain text.

---

## 29. Yêu cầu bảo mật cơ bản

Cần đảm bảo:

1. Password mã hóa bằng bcrypt.
2. JWT secret lấy từ biến môi trường.
3. Không trả password trong response.
4. API admin phải có middleware kiểm tra role ADMIN.
5. Customer không được xem đơn hàng của người khác.
6. Customer không được sửa cart item của người khác.
7. Validate input trước khi ghi database.
8. CORS chỉ cho phép domain frontend từ `CLIENT_URL`.
9. Không commit file `.env` thật.
10. Có `.env.example`.

---

## 30. Phạm vi không cần làm

Không cần làm các chức năng sau:

1. Chat realtime.
2. AI recommendation.
3. Thanh toán tiền thật.
4. Quản lý kho nâng cao.
5. Mã giảm giá phức tạp.
6. Upload nhiều ảnh cho mỗi sản phẩm.
7. Đánh giá sản phẩm.
8. Wishlist.
9. Email xác thực.
10. Quên mật khẩu.
11. Phân quyền nhiều cấp phức tạp.

Nếu có thời gian, có thể làm thêm, nhưng không được ảnh hưởng đến các chức năng chính.

---

## 31. Thứ tự code chi tiết cho Codex

Hãy thực hiện theo thứ tự dưới đây.

### 31.1. Bước 1 - Khởi tạo backend

1. Tạo thư mục backend.
2. Chạy npm init.
3. Cài package:
   - express.
   - cors.
   - dotenv.
   - jsonwebtoken.
   - bcryptjs.
   - @prisma/client.
   - stripe.
   - express-validator.
4. Cài dev package:
   - prisma.
   - nodemon.
5. Tạo script:
   - dev.
   - start.
   - prisma:migrate.
   - prisma:generate.
   - prisma:seed.

### 31.2. Bước 2 - Tạo Prisma schema

1. Cấu hình datasource PostgreSQL.
2. Tạo các model.
3. Tạo enum.
4. Chạy prisma generate.
5. Tạo migration.

### 31.3. Bước 3 - Tạo seed data

1. Tạo admin.
2. Tạo customer.
3. Tạo categories.
4. Tạo products.
5. Tạo variants.

### 31.4. Bước 4 - Tạo Express app

1. Tạo app.js.
2. Cấu hình cors.
3. Cấu hình JSON body parser.
4. Mount routes.
5. Thêm error middleware.
6. Tạo server.js.

### 31.5. Bước 5 - Tạo Auth API

1. Register.
2. Login.
3. Me.
4. Update profile.
5. Test bằng Postman hoặc curl.

### 31.6. Bước 6 - Tạo Products/Categories API

1. CRUD categories.
2. CRUD products.
3. Filter/search/sort/pagination.
4. Admin middleware cho thao tác quản trị.

### 31.7. Bước 7 - Tạo Cart API

1. Get cart.
2. Add to cart.
3. Update quantity.
4. Delete cart item.
5. Clear cart.

### 31.8. Bước 8 - Tạo Orders API

1. Create order from cart.
2. My orders.
3. Order detail.
4. Admin list orders.
5. Admin update status.

### 31.9. Bước 9 - Tạo Payments API

1. Create checkout session.
2. Success.
3. Cancel.
4. Webhook hoặc mock payment.
5. Update payment status.

### 31.10. Bước 10 - Khởi tạo frontend

1. Tạo React Vite app.
2. Cài:
   - axios.
   - react-router-dom.
   - bootstrap.
   - react-bootstrap nếu cần.
3. Import Bootstrap CSS.
4. Tạo cấu trúc thư mục frontend.

### 31.11. Bước 11 - Tạo frontend services

1. api.js với Axios instance.
2. auth.service.js.
3. product.service.js.
4. cart.service.js.
5. order.service.js.
6. payment.service.js.

### 31.12. Bước 12 - Tạo contexts

1. AuthContext.
2. CartContext.
3. PrivateRoute.
4. AdminRoute.

### 31.13. Bước 13 - Tạo layout và pages người dùng

1. MainLayout.
2. HomePage.
3. ProductListPage.
4. ProductDetailPage.
5. CartPage.
6. CheckoutPage.
7. LoginPage.
8. RegisterPage.
9. ProfilePage.
10. OrderHistoryPage.
11. PaymentSuccessPage.
12. PaymentCancelPage.

### 31.14. Bước 14 - Tạo admin pages

1. AdminLayout.
2. AdminDashboardPage.
3. AdminProductsPage.
4. AdminCategoriesPage.
5. AdminOrdersPage.
6. AdminUsersPage.

### 31.15. Bước 15 - Hoàn thiện CSS

1. main.css.
2. Responsive.
3. Product card.
4. Form.
5. Admin table.
6. Button.
7. Navbar/Footer.

### 31.16. Bước 16 - Docker hóa

1. Backend Dockerfile.
2. Frontend Dockerfile.
3. nginx.conf.
4. docker-compose.yml.
5. Test chạy bằng Docker Compose.

### 31.17. Bước 17 - Viết tài liệu

1. README.md.
2. docs/API.md.
3. docs/DATABASE.md.
4. docs/DEPLOYMENT.md.

### 31.18. Bước 18 - Kiểm thử và sửa lỗi

1. Test auth.
2. Test products.
3. Test cart.
4. Test order.
5. Test payment.
6. Test admin.
7. Test Docker.
8. Sửa lỗi nếu có.

---

## 32. Tiêu chuẩn nghiệm thu cuối cùng

Dự án được xem là hoàn thành khi đạt đủ các điều kiện sau:

1. Có frontend React chạy được.
2. Có backend Express chạy được.
3. Có PostgreSQL và Prisma.
4. Có đăng ký, đăng nhập bằng JWT.
5. Password được mã hóa.
6. Có danh sách sản phẩm.
7. Có chi tiết sản phẩm.
8. Có tìm kiếm/lọc/sắp xếp sản phẩm.
9. Có giỏ hàng.
10. Có đặt hàng.
11. Có thanh toán test hoặc mock payment rõ ràng.
12. Có lịch sử đơn hàng.
13. Có admin dashboard.
14. Admin quản lý được sản phẩm.
15. Admin quản lý được danh mục.
16. Admin quản lý được đơn hàng.
17. Admin quản lý được người dùng.
18. Có Dockerfile frontend.
19. Có Dockerfile backend.
20. Có docker-compose.yml.
21. Có `.env.example`.
22. Có README tiếng Việt.
23. Có seed data.
24. Có tài khoản demo.
25. Chạy được bằng lệnh local.
26. Chạy được bằng Docker Compose.

---

## 33. Yêu cầu khi trả kết quả

Khi hoàn thành, hãy trả về:

1. Danh sách file đã tạo.
2. Hướng dẫn chạy backend.
3. Hướng dẫn chạy frontend.
4. Hướng dẫn chạy Docker Compose.
5. Hướng dẫn migrate và seed database.
6. Tài khoản demo.
7. Các API chính.
8. Ghi chú phần thanh toán test.
9. Các lỗi tiềm ẩn nếu có.
10. Việc cần làm tiếp theo nếu muốn nâng cấp.

---

## 34. Lưu ý quan trọng cho Codex

1. Không viết code giả.
2. Không bỏ trống các file quan trọng.
3. Không tạo API không dùng được.
4. Không hardcode secret trong code.
5. Không trả password về frontend.
6. Không bỏ middleware admin ở route quản trị.
7. Không để frontend gọi sai URL API.
8. Không để Docker Compose thiếu service PostgreSQL.
9. Không quên Prisma generate/migrate.
10. Không quên seed data.
11. Không làm giao diện quá sơ sài.
12. Không làm tính năng vượt phạm vi gây phức tạp.
13. Ưu tiên hoàn thiện luồng chính trước.
14. Sau mỗi nhóm file, hãy đảm bảo import/export đúng.
15. Code cần dễ đọc để sinh viên có thể giải thích khi bảo vệ.

---

## 35. Output mong muốn

Hãy tạo toàn bộ source code cho project `mens-fashion-shop` theo yêu cầu trên.

Ưu tiên hoàn thành theo thứ tự:

1. Backend chạy được.
2. Database migrate/seed được.
3. API test được.
4. Frontend hiển thị được.
5. Frontend kết nối API được.
6. Admin hoạt động được.
7. Docker chạy được.
8. README đầy đủ.

Khi có lỗi hoặc điểm chưa chắc chắn, hãy ghi chú rõ trong phần cuối thay vì bỏ qua.
