# Deployment Documentation

Tài liệu này mô tả cách chạy local bằng Docker Compose và hướng deploy bằng Docker cho đồ án.

## Kiến trúc

```text
Browser
  |
  v
Frontend React + Nginx
  |
  v
Backend Express API
  |
  v
PostgreSQL
```

## Docker files

Frontend:

```text
frontend/Dockerfile
frontend/nginx.conf
```

Backend:

```text
backend/Dockerfile
```

Compose local:

```text
docker-compose.yml
```

## Chạy local bằng Docker Compose

Từ thư mục root:

```powershell
docker compose up --build
```

Các service:

| Service | Port | Mô tả |
| --- | --- | --- |
| postgres | `5432` | PostgreSQL 16 |
| backend | `5000` | Express API |
| frontend | `5173` | React static build qua Nginx |

URL:

```text
Frontend: http://localhost:5173
Backend:  http://localhost:5000
API docs: http://localhost:5000/api-docs
```

Trong môi trường dev nếu các port `5173`, `5000`, `5432` đã bị app local chiếm, `docker-compose.override.yml` có thể đổi port host sang:

```text
Frontend: http://localhost:5174
Backend:  http://localhost:5001
API docs: http://localhost:5001/api-docs
```

Backend container tự chạy migration và seed:

```text
npx prisma migrate deploy
node prisma/seed.js
npm start
```

## Dừng Docker

Dừng container:

```powershell
docker compose down
```

Dừng và xóa dữ liệu database volume:

```powershell
docker compose down -v
```

## Biến môi trường backend

Local Docker Compose dùng:

```env
PORT=5000
NODE_ENV=production
DATABASE_URL=postgresql://mens_shop:mens_shop_password@postgres:5432/mens_shop_db?schema=public
JWT_SECRET=change_me_to_a_long_random_secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
PAYMENT_PROVIDER=mock
STRIPE_SECRET_KEY=sk_test_replace_me
STRIPE_WEBHOOK_SECRET=whsec_replace_me
STRIPE_SUCCESS_URL=http://localhost:5173/payment-success
STRIPE_CANCEL_URL=http://localhost:5173/payment-cancel
```

Khi deploy thật, cần thay:

- `DATABASE_URL`
- `JWT_SECRET`
- `CLIENT_URL`
- Các biến Stripe nếu dùng Stripe thật.

## Biến môi trường frontend

Frontend Vite cần `VITE_API_URL` ở thời điểm build:

```env
VITE_API_URL=https://backend-domain.example.com/api
```

Dockerfile frontend có `ARG VITE_API_URL`, vì vậy có thể truyền khi build:

```powershell
docker build ./frontend --build-arg VITE_API_URL=https://backend-domain.example.com/api
```

## Deploy backend Docker

Gợi ý nền tảng:

- Render
- Railway
- Fly.io
- VPS/free trial có Docker

Các bước:

1. Tạo PostgreSQL hosted database, ví dụ Neon/Supabase/Render/Railway.
2. Lấy connection string và đặt vào `DATABASE_URL`.
3. Tạo backend service từ GitHub repo.
4. Chọn Dockerfile trong thư mục `backend`.
5. Cấu hình biến môi trường backend.
6. Chạy migration:

```powershell
npx prisma migrate deploy
```

7. Seed demo nếu cần:

```powershell
node prisma/seed.js
```

8. Kiểm tra:

```text
https://backend-domain.example.com/api/health
```

## Deploy frontend Docker

Các bước:

1. Tạo frontend service từ GitHub repo.
2. Chọn Dockerfile trong thư mục `frontend`.
3. Truyền build arg:

```text
VITE_API_URL=https://backend-domain.example.com/api
```

4. Kiểm tra frontend domain.
5. Kiểm tra login, product list, cart, checkout.

## CORS

Backend chỉ cho phép domain frontend từ biến:

```env
CLIENT_URL=https://frontend-domain.example.com
```

Nếu deploy frontend sang domain khác, phải cập nhật `CLIENT_URL` và restart backend.

## Payment

Hiện tại dự án dùng payment mock:

- `POST /api/payments/create-checkout-session`
- `GET /api/payments/mock-gateway`
- `GET /api/payments/success`
- `GET /api/payments/cancel`

Nếu nâng cấp Stripe thật:

1. Cấu hình `STRIPE_SECRET_KEY`.
2. Cấu hình `STRIPE_WEBHOOK_SECRET`.
3. Cập nhật controller để tạo Stripe Checkout Session thật.
4. Cấu hình webhook endpoint trên Stripe Dashboard.

## Checklist sau deploy

- Mở frontend domain.
- Kiểm tra `/api/health`.
- Đăng nhập customer demo.
- Xem sản phẩm và filter.
- Thêm sản phẩm vào giỏ.
- Checkout COD.
- Checkout mock online.
- Đăng nhập admin.
- Vào dashboard.
- Thêm/sửa/ẩn/hiện sản phẩm.
- Cập nhật trạng thái đơn hàng.
- Khóa/mở khóa user.

## Ghi chú

- Vercel phù hợp cho frontend React, nhưng nếu yêu cầu đồ án bắt buộc Docker thì nên dùng nền tảng có hỗ trợ Docker container.
- Với demo local, `docker-compose.yml` là cách nhanh nhất để chạy đủ PostgreSQL, backend và frontend.
