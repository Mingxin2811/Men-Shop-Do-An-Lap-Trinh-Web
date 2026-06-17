# Men's Shop - Website bán thời trang nam

Men's Shop là đồ án lập trình web xây dựng website thương mại điện tử cho cửa hàng thời trang nam. Dự án gồm frontend React/Vite, backend Express, cơ sở dữ liệu PostgreSQL qua Prisma ORM, xác thực JWT, giỏ hàng, wishlist, đặt hàng, thanh toán online mô phỏng, mã giảm giá, đánh giá sản phẩm, blog và trang quản trị.

## Công nghệ sử dụng

- Frontend: React 18, Vite, React Router DOM, Axios, Bootstrap, Context API, CSS thuần.
- Backend: Node.js, Express.js, Prisma ORM, JWT, bcryptjs, express-validator, nodemailer, swagger-ui-express.
- Database: PostgreSQL.
- Auth: JWT, đăng ký bằng OTP email, đăng nhập, quên mật khẩu, đổi mật khẩu.
- Payment: luồng thanh toán online mô phỏng, có trạng thái thanh toán và redirect kết quả.
- Deploy: Vercel cho frontend, Render cho backend, Neon/Supabase/Render PostgreSQL cho database.
- Docker: Docker Compose cho môi trường local hoặc deploy Docker.

## Chức năng chính

### Khách vãng lai

- Xem trang chủ, bộ sưu tập, sản phẩm mới và blog.
- Xem danh sách sản phẩm.
- Tìm kiếm nhanh trên header, có gợi ý sản phẩm tức thì.
- Tìm kiếm không dấu tiếng Việt, ví dụ `ao thun` khớp `Áo thun`.
- Lọc theo danh mục, khoảng giá, size, màu, trạng thái giảm giá/còn hàng.
- Sắp xếp và phân trang sản phẩm.
- Xem chi tiết sản phẩm, ảnh, biến thể size/màu, tồn kho và đánh giá.
- Đăng ký, đăng nhập, quên mật khẩu.
- Lưu wishlist cục bộ khi chưa đăng nhập, sau đăng nhập sẽ đồng bộ vào tài khoản.

### Khách hàng

- Cập nhật hồ sơ cá nhân, số điện thoại, địa chỉ và ảnh đại diện.
- Chọn ảnh đại diện từ ảnh cá nhân hoặc avatar preset.
- Thêm/xóa sản phẩm yêu thích.
- Thêm sản phẩm hoặc biến thể vào giỏ hàng.
- Cập nhật số lượng, xóa item, xóa toàn bộ giỏ hàng.
- Dùng cart drawer trên header.
- Áp dụng mã giảm giá khi checkout.
- Đặt hàng bằng COD hoặc thanh toán online mô phỏng.
- Theo dõi lịch sử đơn hàng, chi tiết đơn hàng và timeline trạng thái.
- Hủy đơn hàng khi đơn còn ở trạng thái chờ xử lý.
- Đánh giá sản phẩm khi đơn hàng đã hoàn tất.

### Admin

- Xem dashboard thống kê doanh thu, đơn hàng, khách hàng và sản phẩm.
- Quản lý sản phẩm, ảnh, giá, giá khuyến mãi, tồn kho và biến thể.
- Ẩn/hiện sản phẩm trên website.
- Quản lý danh mục.
- Quản lý blog.
- Quản lý mã giảm giá.
- Quản lý đơn hàng, xem chi tiết đơn, cập nhật trạng thái.
- Khi đơn hoàn tất, hệ thống tự chuyển trạng thái thanh toán sang đã thanh toán.
- Khi hủy đơn, hệ thống hoàn kho và có thể chuyển trạng thái thanh toán sang hoàn tiền.
- Quản lý người dùng, khóa/mở khóa tài khoản, xem lịch sử mua hàng.

## Cấu trúc thư mục

```text
LTW-Men's Shop/
  backend/
    prisma/
      migrations/
      schema.prisma
      seed.js
    scripts/
      verify-mail.js
    src/
      config/
      controllers/
      middlewares/
      routes/
      utils/
      app.js
      server.js
    .env.example
    Dockerfile
    package.json

  frontend/
    src/
      assets/
      components/
      contexts/
      layouts/
      pages/
      services/
      styles/
      utils/
      App.jsx
      main.jsx
    .env.example
    Dockerfile
    nginx.conf
    package.json
    vercel.json
    vite.config.js

  docs/
    API.md
    DATABASE.md
    DEPLOYMENT.md
    postman-testing-guide.md

  docker-compose.yml
  docker-compose.override.yml
  docker-compose.deploy.yml
  .env.docker.example
  README.md
```

## Yêu cầu môi trường

- Node.js 20 hoặc phiên bản tương thích.
- npm.
- PostgreSQL nếu chạy local không dùng Docker.
- Docker Desktop nếu chạy bằng Docker Compose.
- Git.

## Cấu hình biến môi trường

### Backend

Tạo file `backend/.env` từ file mẫu:

```powershell
cd backend
Copy-Item .env.example .env
```

Các biến quan trọng:

```env
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/mens_fashion_shop?schema=public
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173

PAYMENT_PROVIDER=mock
STRIPE_SECRET_KEY=sk_test_replace_me
STRIPE_WEBHOOK_SECRET=whsec_replace_me
STRIPE_SUCCESS_URL=http://localhost:5173/payment-success
STRIPE_CANCEL_URL=http://localhost:5173/payment-cancel

MAIL_FROM=Men's Shop
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
EMAIL_DEV_MODE=false
```

Ghi chú:

- `JWT_SECRET` phải là chuỗi bí mật dài, không dùng giá trị mẫu khi deploy.
- `CLIENT_URL` là domain frontend được phép gọi API. Ở production có thể dùng nhiều domain, cách nhau bằng dấu phẩy.
- `EMAIL_DEV_MODE=true` chỉ nên dùng khi demo/dev để lấy OTP dễ hơn. Production nên để `false`.
- Nếu dùng Gmail SMTP, `SMTP_PASS` là App Password 16 ký tự, không phải mật khẩu Gmail thường.
- Không commit file `.env` lên GitHub.

### Frontend

Tạo file `frontend/.env` nếu cần chạy local:

```env
VITE_API_URL=http://localhost:5000/api
```

Khi deploy Vercel, đặt:

```env
VITE_API_URL=https://mens-shop-api-1txr.onrender.com/api
```

## Chạy project local

### 1. Chạy database PostgreSQL

Có thể dùng PostgreSQL đã cài trên máy, hoặc dùng Docker:

```powershell
docker compose up postgres -d
```

Nếu dùng Docker Compose mặc định, database nội bộ có thông tin:

```text
User: mens_shop
Password: mens_shop_password
Database: mens_shop_db
Host: localhost
Port: 5432
```

URL tương ứng:

```env
DATABASE_URL=postgresql://mens_shop:mens_shop_password@localhost:5432/mens_shop_db?schema=public
```

### 2. Cài và chạy backend

```powershell
cd backend
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

Kiểm tra:

```text
http://localhost:5000/api/health
http://localhost:5000/api-docs
```

### 3. Cài và chạy frontend

Mở terminal khác:

```powershell
cd frontend
npm install
npm run dev
```

Frontend chạy tại:

```text
http://localhost:5173
```

## Chạy bằng Docker Compose

Mở PowerShell tại thư mục root của project, tức thư mục có `docker-compose.yml`, `docker-compose.override.yml`, `docker-compose.deploy.yml` và `README.md`:

```powershell
cd "c:\Mingxin's documents\School\Web\Đồ án web\LTW-Men's Shop"
```

Chạy bản Docker demo:

```powershell
docker compose up -d --build
```

File `docker-compose.yml` chạy:

- PostgreSQL.
- Backend Express.
- Frontend build qua Nginx.
- Healthcheck cho PostgreSQL, backend và frontend.

Nếu muốn đổi port, database, domain frontend/backend hoặc khóa JWT khi chạy Docker, có thể copy file mẫu:

```powershell
Copy-Item .env.docker.example .env
```

Sau đó chỉnh các biến cần thiết trong `.env`.

Repo hiện có `docker-compose.override.yml` để tránh trùng port với local dev. Khi override tồn tại, URL Docker là:

```text
Frontend: http://localhost:5174
Backend:  http://localhost:5001
Health:   http://localhost:5001/api/health
API docs: http://localhost:5001/api-docs
```

Backend Docker mặc định chạy:

```text
npx prisma migrate deploy && npm run prisma:seed && npm start
```

Kiểm tra container đang chạy:

```powershell
docker compose ps
```

Xem log tất cả service:

```powershell
docker compose logs -f
```

Xem log từng service:

```powershell
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f postgres
```

Khởi động lại riêng một service:

```powershell
docker compose restart backend
docker compose restart frontend
docker compose restart postgres
```

Dừng container nhưng giữ dữ liệu database trong volume:

```powershell
docker compose down
```

Dừng và xóa volume database:

```powershell
docker compose down -v
```

Chỉ dùng `docker compose down -v` khi muốn reset sạch database Docker.

Nếu deploy Docker nhưng không muốn seed dữ liệu demo, dùng:

```powershell
docker compose -f docker-compose.yml -f docker-compose.deploy.yml up -d --build
```

Khi chạy theo file deploy, `docker-compose.override.yml` không tự áp dụng, URL là:

```text
Frontend: http://localhost:5173
Backend:  http://localhost:5000
Health:   http://localhost:5000/api/health
API docs: http://localhost:5000/api-docs
```

Tắt chế độ deploy:

```powershell
docker compose -f docker-compose.yml -f docker-compose.deploy.yml down
```

Khi deploy bằng lệnh trên, hãy đặt lại tối thiểu các biến `DATABASE_URL`, `JWT_SECRET`, `CLIENT_URL`, `API_URL`, `VITE_API_URL`, `STRIPE_SUCCESS_URL` và `STRIPE_CANCEL_URL` trong `.env` hoặc môi trường của máy chủ.

### Docker Hub và chi phí hosting

Docker Hub là nơi lưu image, không phải nơi chạy website. Push image public lên Docker Hub thường đủ dùng miễn phí cho đồ án cá nhân, nhưng các giới hạn private repository, pull rate, team hoặc tính năng nâng cao phụ thuộc gói Docker Hub.

Để website chạy thật trên Internet, cần một nơi chạy container. Nếu bắt buộc chạy đủ frontend, backend và PostgreSQL bằng Docker Compose trên Internet thì thường cần VPS hoặc nền tảng container, đa số có thể phát sinh phí. Hướng miễn phí/dễ demo hơn là deploy frontend lên Vercel, backend lên Render/Railway/Koyeb nếu còn free tier, và database lên Neon/Supabase free tier.

## Database, migration và seed

Local development:

```powershell
cd backend
npm run prisma:migrate
npm run prisma:seed
```

Production:

```powershell
cd backend
npx prisma generate
npx prisma migrate deploy
```

Seed demo tạo:

- Tài khoản admin.
- Tài khoản customer demo.
- 6 danh mục thời trang nam.
- Nhiều sản phẩm nam kèm size, màu, tồn kho.
- Blog mẫu.
- Mã giảm giá demo:
  - `WELCOME10`
  - `GIAM50K`

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

Base URL local:

```text
http://localhost:5000/api
```

Base URL production đang dùng:

```text
https://mens-shop-api-1txr.onrender.com/api
```

### Health và Swagger

- `GET /api/health`
- `GET /api-docs`

### Auth

- `POST /api/auth/register/request-otp`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `PUT /api/auth/profile`
- `PUT /api/auth/change-password`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`

### Products và reviews

- `GET /api/products`
- `GET /api/products/:id`
- `GET /api/products/admin/all`
- `POST /api/products`
- `PUT /api/products/:id`
- `DELETE /api/products/:id`
- `GET /api/products/:id/reviews`
- `GET /api/products/:id/reviews/eligibility`
- `POST /api/products/:id/reviews`
- `DELETE /api/products/:id/reviews`

### Categories

- `GET /api/categories`
- `POST /api/categories`
- `PUT /api/categories/:id`
- `DELETE /api/categories/:id`

### Cart

- `GET /api/cart`
- `POST /api/cart`
- `PUT /api/cart/:id`
- `DELETE /api/cart/:id`
- `DELETE /api/cart`

### Wishlist

- `GET /api/wishlist`
- `POST /api/wishlist`
- `DELETE /api/wishlist/:productId`
- `DELETE /api/wishlist`

### Orders

- `POST /api/orders`
- `GET /api/orders/my-orders`
- `GET /api/orders/:id`
- `GET /api/orders`
- `PUT /api/orders/:id/cancel`
- `PUT /api/orders/:id/status`

### Coupons

- `POST /api/coupons/validate`
- `GET /api/coupons`
- `POST /api/coupons`
- `PUT /api/coupons/:id`
- `DELETE /api/coupons/:id`

### Payments

- `POST /api/payments/create-checkout-session`
- `POST /api/payments/confirm`
- `POST /api/payments/cancel-payment`
- `GET /api/payments/mock-gateway`
- `GET /api/payments/success`
- `GET /api/payments/cancel`
- `POST /api/payments/webhook`

### Blog/posts

- `GET /api/posts`
- `GET /api/posts/:slug`
- `GET /api/posts/admin/all`
- `POST /api/posts`
- `PUT /api/posts/:id`
- `DELETE /api/posts/:id`

### Admin

- `GET /api/admin/dashboard`
- `GET /api/admin/users`
- `PUT /api/admin/users/:id/status`
- `GET /api/admin/users/:id/orders`

## Luồng thanh toán online mô phỏng

Dự án hiện dùng luồng thanh toán online mô phỏng thay vì Stripe thật.

1. Customer đăng nhập.
2. Thêm sản phẩm vào giỏ hàng.
3. Checkout với phương thức online (`STRIPE`).
4. Backend tạo đơn hàng với `paymentStatus=PENDING`.
5. Frontend chuyển sang trang `/payment-checkout?orderId=...`.
6. Người dùng xác nhận thanh toán.
7. Backend gọi `/api/payments/confirm`, tạo/cập nhật payment và chuyển `paymentStatus=PAID`.
8. Frontend chuyển sang `/payment-success?orderId=...`.

Nếu hủy thanh toán:

- Frontend gọi `/api/payments/cancel-payment`.
- Đơn chuyển sang trạng thái thanh toán thất bại hoặc bị xử lý theo controller hiện tại.
- Frontend chuyển sang `/payment-cancel?orderId=...`.

## Luồng đánh giá sản phẩm

- Chỉ user đã đăng nhập mới có thể đánh giá.
- User chỉ được đánh giá sản phẩm nếu từng mua sản phẩm đó trong đơn hàng `COMPLETED`.
- Mỗi user có thể tạo/cập nhật đánh giá của mình cho một sản phẩm.
- User có thể xóa đánh giá của chính mình.
- Trang chi tiết sản phẩm hiển thị điểm trung bình, số lượng đánh giá và phân bố sao.

## Deploy frontend lên Vercel

Project frontend đã có `frontend/vercel.json`:

```json
{
  "framework": "vite",
  "installCommand": "npm install",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

Cấu hình Vercel:

```text
Root Directory: frontend
Framework Preset: Vite
Install Command: npm install
Build Command: npm run build
Output Directory: dist
```

Environment Variable:

```env
VITE_API_URL=https://mens-shop-api-1txr.onrender.com/api
```

Sau khi push lên GitHub, Vercel sẽ tự deploy branch được cấu hình.

## Deploy backend lên Render

Cấu hình Render Web Service:

```text
Root Directory: backend
Runtime: Node
Build Command: npm install && npx prisma generate
Start Command: npx prisma migrate deploy && npm start
```

Environment Variables cần đặt trên Render:

```env
NODE_ENV=production
DATABASE_URL=postgresql://...
JWT_SECRET=<chuoi-bi-mat-dai>
JWT_EXPIRES_IN=7d
CLIENT_URL=https://ten-frontend-vercel-cua-ban.vercel.app
PAYMENT_PROVIDER=mock
STRIPE_SECRET_KEY=sk_test_replace_me
STRIPE_WEBHOOK_SECRET=whsec_replace_me
STRIPE_SUCCESS_URL=https://ten-frontend-vercel-cua-ban.vercel.app/payment-success
STRIPE_CANCEL_URL=https://ten-frontend-vercel-cua-ban.vercel.app/payment-cancel
MAIL_FROM=Men's Shop
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=<gmail-gui-mail>
SMTP_PASS=<gmail-app-password>
EMAIL_DEV_MODE=false
```

Render tự cấp biến `PORT`, không cần tự đặt nếu không cần.

Sau khi deploy backend, kiểm tra:

```text
https://mens-shop-api-1txr.onrender.com/api/health
https://mens-shop-api-1txr.onrender.com/api-docs
```

Nếu frontend và backend khác branch, có thể lỗi API. Nên để Vercel và Render cùng deploy từ `main`, hoặc cùng deploy từ một branch feature.

## Checklist deploy

Trước khi deploy:

```powershell
cd backend
npm install
npx prisma validate
node -e "require('./src/app.js'); console.log('backend app loaded OK')"

cd ../frontend
npm install
npm run build
```

Sau khi deploy:

- Backend `/api/health` trả `200`.
- Swagger `/api-docs` mở được.
- Vercel frontend mở được trang chủ.
- Đăng nhập demo được.
- Gọi API từ frontend không bị CORS.
- Thêm sản phẩm vào giỏ hàng được.
- Checkout COD được.
- Checkout online mô phỏng được.
- Admin vào được dashboard.
- Nếu dùng coupon, `/api/coupons` không được trả `404`. Nếu chưa đăng nhập admin có thể trả `401`, như vậy route đã tồn tại.

## Một số lỗi thường gặp

### Vercel báo vulnerabilities sau npm install

Dòng `npm audit` chỉ là cảnh báo bảo mật dependency, không nhất thiết làm build fail. Cần xem các dòng lỗi phía sau. Nếu `npm run build` thành công thì frontend vẫn build được.

### Vercel trắng trang khi refresh route con

Đảm bảo `frontend/vercel.json` có rewrite về `/index.html`.

### Frontend gọi API bị CORS

Kiểm tra biến `CLIENT_URL` trên Render phải đúng domain Vercel. Nếu có nhiều domain, dùng dấu phẩy:

```env
CLIENT_URL=https://shop.vercel.app,https://shop-git-main.vercel.app
```

### API mới bị 404 sau deploy

Thường do frontend và backend đang deploy khác branch hoặc Render chưa deploy commit mới. Kiểm tra branch và commit trên Vercel/Render.

### Render free chậm lần đầu

Gói free có thể sleep khi không dùng. Lần truy cập đầu có thể mất khoảng một phút để backend khởi động lại.

### OTP không gửi email thật

- Nếu `EMAIL_DEV_MODE=true`, OTP phục vụ dev/demo, không nên dùng production.
- Nếu muốn gửi thật, đặt `EMAIL_DEV_MODE=false` và cấu hình SMTP hợp lệ.
- Gmail cần App Password.

## Lệnh Git deploy thường dùng

```powershell
git status
git add .
git commit -m "cap nhat website"
git push origin main
```

Nếu Vercel/Render đang theo dõi `main`, sau khi push hệ thống sẽ tự deploy.

## Tài liệu liên quan

- [API](./docs/API.md)
- [Database](./docs/DATABASE.md)
- [Deployment](./docs/DEPLOYMENT.md)
- [Postman testing guide](./docs/postman-testing-guide.md)

## Ghi chú phát triển tiếp

- Có thể tích hợp Stripe thật thay cho payment mock.
- Có thể chuyển upload ảnh sang Cloudinary/S3 thay vì lưu base64 hoặc URL ảnh.
- Có thể bổ sung test tự động cho backend và frontend.
- Có thể chuẩn hóa lại toàn bộ thông báo backend sang UTF-8 tiếng Việt có dấu nếu cần hiển thị trực tiếp cho người dùng.
