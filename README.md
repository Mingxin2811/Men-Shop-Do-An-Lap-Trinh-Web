# Men's Shop - Website bán thời trang nam

Men's Shop là website thương mại điện tử bán thời trang nam ở mức đồ án sinh viên. Dự án gồm frontend React, backend Express, PostgreSQL/Prisma, JWT authentication, giỏ hàng, đặt hàng, thanh toán mock/test, trang quản trị và Docker để chạy local/deploy.

## Công nghệ sử dụng

- Frontend: ReactJS, Vite, Bootstrap, React Router DOM, Axios, Context API.
- Backend: NodeJS, ExpressJS, Prisma ORM, JWT, bcryptjs, express-validator.
- Database: PostgreSQL.
- Payment: mock Stripe/test flow qua các endpoint payment.
- Deployment: Docker, Docker Compose, Nginx cho frontend.

## Chức năng chính

Khách vãng lai:

- Xem trang chủ.
- Xem danh sách sản phẩm.
- Tìm kiếm, lọc theo danh mục, giá, size, màu.
- Sắp xếp và phân trang sản phẩm.
- Xem chi tiết sản phẩm.
- Đăng ký và đăng nhập.

Khách hàng:

- Cập nhật hồ sơ cá nhân.
- Thêm sản phẩm/biến thể vào giỏ hàng.
- Cập nhật, xóa item và xóa toàn bộ giỏ hàng.
- Checkout với COD hoặc thanh toán online mock.
- Xem lịch sử và chi tiết đơn hàng.

Admin:

- Xem dashboard thống kê.
- Quản lý sản phẩm, biến thể size/màu và trạng thái ẩn/hiện.
- Quản lý danh mục.
- Quản lý đơn hàng và cập nhật trạng thái.
- Quản lý khách hàng, khóa/mở khóa tài khoản.

## Cấu trúc thư mục

```text
LTW-Men's Shop/
  backend/
    prisma/
      schema.prisma
      seed.js
      migrations/
    src/
      config/
      controllers/
      middlewares/
      routes/
      utils/
      app.js
      server.js
    Dockerfile
    package.json

  frontend/
    src/
      components/
      contexts/
      layouts/
      pages/
      routes/
      services/
      styles/
    Dockerfile
    nginx.conf
    package.json

  docs/
    API.md
    DATABASE.md
    DEPLOYMENT.md
    postman-testing-guide.md

  docker-compose.yml
  README.md
```

## Chạy backend local

Yêu cầu:

- NodeJS 20 hoặc tương thích.
- PostgreSQL đang chạy.
- Database URL đúng trong `backend/.env`.

Các bước:

```powershell
cd backend
Copy-Item .env.example .env
npm install
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

Backend chạy tại:

```text
http://localhost:5000
```

Health check:

```text
http://localhost:5000/api/health
```

Swagger docs:

```text
http://localhost:5000/api-docs
```

## Chạy frontend local

```powershell
cd frontend
Copy-Item .env.example .env
npm install
npm run dev
```

Frontend chạy tại:

```text
http://localhost:5173
```

File `frontend/.env` mặc định:

```env
VITE_API_URL=http://localhost:5000/api
```

## Chạy bằng Docker Compose

Từ thư mục root:

```powershell
docker compose up --build
```

Docker Compose sẽ chạy:

- PostgreSQL trong mạng nội bộ Docker.
- Backend mặc định tại `http://localhost:5000`.
- Frontend mặc định tại `http://localhost:5173`.

Repo hiện có `docker-compose.override.yml` để tránh đụng các server local đang chạy trên máy dev. Khi file override này tồn tại, URL Docker sẽ là:

```text
Frontend: http://localhost:5174
Backend:  http://localhost:5001
```

Backend container tự chạy:

```text
npx prisma migrate deploy
node prisma/seed.js
npm start
```

Dừng container:

```powershell
docker compose down
```

Xóa cả volume database:

```powershell
docker compose down -v
```

## Migrate và seed database

Local development:

```powershell
cd backend
npm run prisma:migrate
npm run prisma:seed
```

Production/Docker:

```powershell
cd backend
npx prisma migrate deploy
node prisma/seed.js
```

Seed data tạo:

- 1 tài khoản admin.
- 1 tài khoản customer demo.
- 6 danh mục.
- 20 sản phẩm demo, phân bố đều theo danh mục.
- Biến thể size/màu cho sản phẩm.

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

## API chính

Auth:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `PUT /api/auth/profile`

Products/Categories:

- `GET /api/products`
- `GET /api/products/:id`
- `GET /api/products/admin/all`
- `POST /api/products`
- `PUT /api/products/:id`
- `DELETE /api/products/:id`
- `GET /api/categories`
- `POST /api/categories`
- `PUT /api/categories/:id`
- `DELETE /api/categories/:id`

Cart/Orders:

- `GET /api/cart`
- `POST /api/cart`
- `PUT /api/cart/:id`
- `DELETE /api/cart/:id`
- `DELETE /api/cart`
- `POST /api/orders`
- `GET /api/orders/my-orders`
- `GET /api/orders/:id`
- `GET /api/orders`
- `PUT /api/orders/:id/status`

Payments/Admin:

- `POST /api/payments/create-checkout-session`
- `GET /api/payments/mock-gateway`
- `GET /api/payments/success`
- `GET /api/payments/cancel`
- `POST /api/payments/webhook`
- `GET /api/admin/dashboard`
- `GET /api/admin/users`
- `PUT /api/admin/users/:id/status`

## Cách test thanh toán

Dự án đang dùng luồng thanh toán mock/test thay vì Stripe thật.

1. Đăng nhập customer.
2. Thêm sản phẩm vào giỏ.
3. Checkout với phương thức `STRIPE`.
4. Backend trả về `checkoutUrl` dạng:

```text
http://localhost:5000/api/payments/mock-gateway?orderId=...
```

5. Mock gateway tự chuyển sang success, cập nhật `paymentStatus = PAID`, rồi redirect về:

```text
http://localhost:5173/payment-success?orderId=...
```

Để test hủy thanh toán:

```text
GET /api/payments/mock-gateway?orderId=<ORDER_ID>&action=cancel
```

## Ghi chú deploy

- Nếu yêu cầu bắt buộc Docker, nên deploy frontend/backend trên Render, Railway, Fly.io hoặc VPS/free trial có hỗ trợ Docker.
- Database nên dùng PostgreSQL hosted như Neon, Supabase, Render PostgreSQL hoặc Railway PostgreSQL.
- Sau khi deploy backend, cập nhật:

```env
CLIENT_URL=https://frontend-domain.example.com
DATABASE_URL=postgresql://...
JWT_SECRET=...
```

- Khi build frontend, đặt:

```env
VITE_API_URL=https://backend-domain.example.com/api
```

## Tài liệu liên quan

- [API](./docs/API.md)
- [Database](./docs/DATABASE.md)
- [Deployment](./docs/DEPLOYMENT.md)
- [Postman testing guide](./docs/postman-testing-guide.md)

## Ghi chú còn có thể nâng cấp

- Tích hợp Stripe checkout thật thay cho mock gateway.
- Upload ảnh sản phẩm thay vì dùng URL ảnh.
- Thêm đánh giá sản phẩm, wishlist, mã giảm giá.
- Bổ sung test tự động cho backend và frontend.
