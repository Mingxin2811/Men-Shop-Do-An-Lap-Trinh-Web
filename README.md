# Men's Shop - Website bán thời trang nam

Men's Shop là đồ án Lập trình Web xây dựng website thương mại điện tử cho cửa hàng thời trang nam. Dự án gồm frontend React/Vite, backend Express, PostgreSQL qua Prisma ORM, xác thực JWT, đăng nhập Google, OTP qua email, giỏ hàng, wishlist, đơn hàng, mã giảm giá, đánh giá sản phẩm, blog và trang quản trị.

## Link deploy hiện tại

```text
Frontend: https://mens-shop-rose.vercel.app
Backend:  https://mens-shop-api-1txr.onrender.com
API:      https://mens-shop-api-1txr.onrender.com/api
Swagger:  https://mens-shop-api-1txr.onrender.com/api-docs
Health:   https://mens-shop-api-1txr.onrender.com/api/health
```

Nếu đổi domain frontend/backend, cần cập nhật lại các biến môi trường liên quan ở phần Deploy.

## Công nghệ sử dụng

- Frontend: React 18, Vite, React Router DOM, Axios, Bootstrap, Context API, CSS.
- Backend: Node.js, Express.js, Prisma ORM, JWT, bcryptjs, express-validator, nodemailer, swagger-ui-express.
- Database: PostgreSQL.
- Auth: đăng ký bằng OTP email, đăng nhập email/mật khẩu, đăng nhập Google OAuth, quên mật khẩu bằng OTP, đổi mật khẩu.
- Payment: luồng thanh toán online mô phỏng, lưu trạng thái thanh toán và redirect kết quả.
- Deploy: Vercel cho frontend, Render cho backend, PostgreSQL có thể dùng Neon/Supabase/Render.
- Docker: Docker Compose cho local demo hoặc tự host bằng container.

## Chức năng chính

### Khách vãng lai

- Xem trang chủ, danh sách sản phẩm, chi tiết sản phẩm, blog.
- Tìm kiếm nhanh trên header, có gợi ý sản phẩm tức thì.
- Tìm kiếm không dấu tiếng Việt, ví dụ `ao thun` khớp `Áo thun`.
- Lọc sản phẩm theo danh mục, khoảng giá, size, màu, trạng thái giảm giá/còn hàng.
- Sắp xếp và phân trang sản phẩm.
- Đăng ký tài khoản bằng OTP email.
- Đăng nhập bằng email/mật khẩu hoặc Google.
- Quên mật khẩu bằng OTP email.
- Lưu wishlist cục bộ khi chưa đăng nhập, sau đăng nhập sẽ đồng bộ vào tài khoản.

### Khách hàng

- Cập nhật hồ sơ cá nhân, số điện thoại, địa chỉ và ảnh đại diện.
- Thêm/xóa sản phẩm yêu thích.
- Thêm sản phẩm hoặc biến thể size/màu vào giỏ hàng.
- Cập nhật số lượng, xóa item, xóa toàn bộ giỏ hàng.
- Checkout bằng COD hoặc thanh toán online mô phỏng.
- Áp dụng mã giảm giá khi checkout.
- Theo dõi lịch sử đơn hàng và chi tiết đơn hàng.
- Hủy đơn khi đơn còn ở trạng thái cho phép.
- Đánh giá sản phẩm đã mua trong đơn hàng hoàn tất.

### Admin

- Xem dashboard thống kê doanh thu, đơn hàng, khách hàng và sản phẩm.
- Quản lý sản phẩm, ảnh, giá, giá khuyến mãi, tồn kho và biến thể.
- Quản lý danh mục, blog, mã giảm giá.
- Quản lý đơn hàng và cập nhật trạng thái.
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
    .env.production
    Dockerfile
    nginx.conf
    package.json
    vercel.json

  docs/
    DATABASE.md
    GOOGLE_LOGIN.md
    KICH_BAN_KIEM_THU_DO_AN.md
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

## Biến môi trường

### Backend local

Tạo file `backend/.env` từ file mẫu:

```powershell
cd backend
Copy-Item .env.example .env
```

Ví dụ cấu hình local:

```env
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/mens_fashion_shop?schema=public
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
API_URL=http://localhost:5000

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
OTP_EXPOSE_IN_RESPONSE=false

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
```

Ghi chú:

- `JWT_SECRET` phải là chuỗi bí mật dài, không dùng giá trị mẫu khi deploy.
- `CLIENT_URL` là domain frontend được phép gọi API. Production có thể dùng nhiều domain, cách nhau bằng dấu phẩy.
- `API_URL` là domain backend public, dùng cho callback/redirect.
- `SMTP_USER` là Gmail dùng để gửi OTP.
- `SMTP_PASS` là Google App Password 16 ký tự, không phải mật khẩu Gmail thường.
- `EMAIL_DEV_MODE=false` để gửi OTP thật qua SMTP.
- `EMAIL_DEV_MODE=true` để không gửi email thật, OTP được in ra log backend.
- `OTP_EXPOSE_IN_RESPONSE=false` để không trả OTP về frontend.
- Không commit các file `.env` thật lên GitHub.

### Frontend local

Tạo `frontend/.env` nếu cần:

```env
VITE_API_URL=http://localhost:5000/api
```

Frontend production đã có `frontend/.env.production`:

```env
VITE_API_URL=https://mens-shop-api-1txr.onrender.com/api
```

Nếu đổi backend deploy, sửa `VITE_API_URL` trên Vercel và redeploy frontend.

## Chạy project local

### 1. Chạy PostgreSQL

Có thể dùng PostgreSQL cài trên máy, hoặc chạy riêng service Postgres bằng Docker:

```powershell
docker compose up postgres -d
```

Nếu dùng Postgres từ Docker Compose mặc định:

```env
DATABASE_URL=postgresql://mens_shop:mens_shop_password@localhost:5432/mens_shop_db?schema=public
```

### 2. Chạy backend

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
http://localhost:5000/api/health
http://localhost:5000/api-docs
```

### 3. Chạy frontend

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

## OTP qua Gmail thật

Để gửi OTP đăng ký/quên mật khẩu qua Gmail thật, backend cần:

```env
MAIL_FROM=Men's Shop
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=<gmail-gui-otp>
SMTP_PASS=<google-app-password-16-ky-tu>
EMAIL_DEV_MODE=false
OTP_EXPOSE_IN_RESPONSE=false
```

Cách lấy `SMTP_PASS`:

1. Đăng nhập Gmail muốn dùng để gửi OTP.
2. Vào Google Account.
3. Bật 2-Step Verification.
4. Vào App Passwords.
5. Tạo app password cho dự án, ví dụ `Mens Shop OTP`.
6. Copy mã 16 ký tự vào `SMTP_PASS`.

Test SMTP:

```powershell
cd backend
npm run mail:verify
```

Nếu chỉ demo local không muốn gửi Gmail thật:

```env
EMAIL_DEV_MODE=true
OTP_EXPOSE_IN_RESPONSE=false
```

Khi đó OTP nằm trong log terminal backend.

## Đăng nhập Google

Luồng Google Login:

1. Frontend mở `GET /api/auth/google`.
2. Backend redirect sang Google OAuth.
3. Google redirect về `GET /api/auth/google/callback`.
4. Backend tạo hoặc liên kết user theo `googleId`/`email`.
5. Backend tạo JWT và redirect về frontend `/auth/google/callback?token=...`.
6. Frontend lưu token, gọi `/api/auth/me`, rồi chuyển người dùng về trang phù hợp.

### Google Cloud local

Authorized JavaScript origins:

```text
http://localhost:5173
```

Authorized redirect URIs:

```text
http://localhost:5000/api/auth/google/callback
```

### Google Cloud production hiện tại

Authorized JavaScript origins:

```text
https://mens-shop-rose.vercel.app
```

Authorized redirect URIs:

```text
https://mens-shop-api-1txr.onrender.com/api/auth/google/callback
```

Các biến backend production phải khớp chính xác:

```env
CLIENT_URL=https://mens-shop-rose.vercel.app
API_URL=https://mens-shop-api-1txr.onrender.com
GOOGLE_CALLBACK_URL=https://mens-shop-api-1txr.onrender.com/api/auth/google/callback
GOOGLE_CLIENT_ID=<client-id>
GOOGLE_CLIENT_SECRET=<client-secret>
```

Nếu Google báo `redirect_uri_mismatch`, kiểm tra lại `GOOGLE_CALLBACK_URL` và Authorized redirect URI trong Google Cloud.

## Chạy bằng Docker Compose

Tại thư mục root của project:

```powershell
Copy-Item .env.docker.example .env
docker compose up -d --build
```

Repo có `docker-compose.override.yml` cho local Docker demo, tránh trùng port với local dev. Khi override được áp dụng:

```text
Frontend: http://localhost:5174
Backend:  http://localhost:5001
Health:   http://localhost:5001/api/health
Swagger:  http://localhost:5001/api-docs
```

Backend Docker mặc định chạy:

```text
npx prisma migrate deploy && npm run prisma:seed && npm start
```

Các lệnh thường dùng:

```powershell
docker compose ps
docker compose logs -f backend
docker compose restart backend
docker compose down
```

Chỉ dùng lệnh dưới khi muốn xóa sạch database Docker:

```powershell
docker compose down -v
```

Nếu deploy Docker và không muốn seed dữ liệu demo:

```powershell
docker compose -f docker-compose.yml -f docker-compose.deploy.yml up -d --build
```

File `docker-compose.deploy.yml` đổi command backend thành:

```text
npx prisma migrate deploy && npm start
```

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

Migration hiện có bao gồm:

- Khởi tạo schema chính.
- Thêm ảnh sản phẩm, wishlist, review, blog, coupon, OTP.
- Thêm tìm kiếm không dấu.
- Thêm Google Login: `googleId`, `authProvider`, cho phép `password` nullable.

Seed demo tạo:

- Tài khoản admin.
- Tài khoản customer.
- Danh mục thời trang nam.
- Sản phẩm và biến thể size/màu.
- Blog mẫu.
- Mã giảm giá demo.

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

Base URL production:

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
- `GET /api/auth/google`
- `GET /api/auth/google/callback`
- `GET /api/auth/me`
- `PUT /api/auth/profile`
- `PUT /api/auth/change-password`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`

### Product, cart, order

- `GET /api/products`
- `GET /api/products/:id`
- `GET /api/products/admin/all`
- `POST /api/products`
- `PUT /api/products/:id`
- `DELETE /api/products/:id`
- `GET /api/cart`
- `POST /api/cart`
- `PUT /api/cart/:id`
- `DELETE /api/cart/:id`
- `DELETE /api/cart`
- `POST /api/orders`
- `GET /api/orders/my-orders`
- `GET /api/orders/:id`
- `GET /api/orders`
- `PUT /api/orders/:id/cancel`
- `PUT /api/orders/:id/status`

### Khác

- Categories: `/api/categories`
- Wishlist: `/api/wishlist`
- Reviews: `/api/products/:id/reviews`
- Coupons: `/api/coupons`
- Payments: `/api/payments`
- Blog/posts: `/api/posts`
- Admin: `/api/admin`
- Kiểm tra SMTP admin: `GET /api/admin/mail-status?verify=true`

## Luồng thanh toán online mô phỏng

Dự án hiện dùng payment mock thay vì Stripe thật:

1. Customer checkout với phương thức online.
2. Backend tạo đơn hàng với `paymentStatus=PENDING`.
3. Frontend chuyển sang `/payment-checkout?orderId=...`.
4. Người dùng xác nhận thanh toán.
5. Backend gọi `/api/payments/confirm`, cập nhật payment và đơn hàng.
6. Frontend chuyển sang `/payment-success?orderId=...`.

Nếu hủy thanh toán, frontend gọi `/api/payments/cancel-payment` và chuyển sang `/payment-cancel?orderId=...`.

## Deploy frontend lên Vercel

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

Sau khi đổi `VITE_API_URL`, phải redeploy frontend.

## Deploy backend lên Render

Cấu hình Render Web Service:

```text
Root Directory: backend
Runtime: Node
Build Command: npm install && npx prisma generate
Start Command: npx prisma migrate deploy && npm start
```

Environment Variables production hiện tại:

```env
NODE_ENV=production
DATABASE_URL=postgresql://...
JWT_SECRET=<chuoi-bi-mat-dai>
JWT_EXPIRES_IN=7d

CLIENT_URL=https://mens-shop-rose.vercel.app
API_URL=https://mens-shop-api-1txr.onrender.com

GOOGLE_CLIENT_ID=<client-id>
GOOGLE_CLIENT_SECRET=<client-secret>
GOOGLE_CALLBACK_URL=https://mens-shop-api-1txr.onrender.com/api/auth/google/callback

MAIL_FROM=Men's Shop
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=<gmail-gui-otp>
SMTP_PASS=<google-app-password>
EMAIL_DEV_MODE=false
OTP_EXPOSE_IN_RESPONSE=false

PAYMENT_PROVIDER=mock
STRIPE_SECRET_KEY=sk_test_replace_me
STRIPE_WEBHOOK_SECRET=whsec_replace_me
STRIPE_SUCCESS_URL=https://mens-shop-rose.vercel.app/payment-success
STRIPE_CANCEL_URL=https://mens-shop-rose.vercel.app/payment-cancel
```

Render tự cấp biến `PORT`, không cần đặt thủ công.

Sau khi deploy backend, kiểm tra:

```text
https://mens-shop-api-1txr.onrender.com/api/health
https://mens-shop-api-1txr.onrender.com/api-docs
```

## Checklist trước và sau deploy

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
- Frontend Vercel mở trang chủ được.
- Frontend gọi API production, không gọi `localhost`.
- Đăng nhập email/mật khẩu được.
- Đăng nhập Google quay về `https://mens-shop-rose.vercel.app`, không quay về local.
- OTP đăng ký/quên mật khẩu gửi Gmail thật nếu `EMAIL_DEV_MODE=false`.
- Giỏ hàng, checkout COD và payment mock hoạt động.
- Admin vào dashboard được.

## Lỗi thường gặp

### Frontend deploy gọi về localhost

Kiểm tra Vercel có biến:

```env
VITE_API_URL=https://mens-shop-api-1txr.onrender.com/api
```

Sau khi sửa phải redeploy frontend.

### Google Login quay về local hoặc lỗi redirect_uri_mismatch

Kiểm tra Render:

```env
CLIENT_URL=https://mens-shop-rose.vercel.app
API_URL=https://mens-shop-api-1txr.onrender.com
GOOGLE_CALLBACK_URL=https://mens-shop-api-1txr.onrender.com/api/auth/google/callback
```

Kiểm tra Google Cloud Authorized redirect URI phải giống hệt `GOOGLE_CALLBACK_URL`.

### CORS

`CLIENT_URL` trên backend phải chứa đúng domain frontend. Nếu có nhiều domain:

```env
CLIENT_URL=https://mens-shop-rose.vercel.app,https://preview-domain.vercel.app
```

### OTP không gửi email thật

- Nếu `EMAIL_DEV_MODE=true`, backend chỉ log OTP.
- Nếu muốn gửi Gmail thật, đặt `EMAIL_DEV_MODE=false`.
- Gmail phải dùng App Password, không dùng mật khẩu Gmail thường.
- Test bằng `npm run mail:verify`.
- Trên deploy, admin có thể gọi `GET /api/admin/mail-status?verify=true` kèm Bearer token admin để kiểm tra SMTP ngay trên server hosting.
- Nếu `passwordHadWhitespace=true`, backend đã tự bỏ khoảng trắng trong `SMTP_PASS`, nhưng vẫn nên lưu App Password trên hosting ở dạng liền 16 ký tự.

### API mới bị 404 sau deploy

Thường do Vercel và Render đang deploy khác branch hoặc Render chưa deploy commit mới. Kiểm tra branch/commit trên hai nền tảng.

### Render free chậm lần đầu

Render free có thể sleep khi không dùng. Lần truy cập đầu có thể mất khoảng một phút để backend khởi động lại.

## Lệnh Git deploy thường dùng

```powershell
git status
git add .
git commit -m "cap nhat website"
git push origin main
```

Nếu Vercel/Render đang theo dõi `main`, sau khi push hệ thống sẽ tự deploy.

## Tài liệu liên quan

- [Database](./docs/DATABASE.md)
- [Google Login](./docs/GOOGLE_LOGIN.md)
- [Kịch bản kiểm thử đồ án](./docs/KICH_BAN_KIEM_THU_DO_AN.md)
- [Postman testing guide](./docs/postman-testing-guide.md)

## Ghi chú phát triển tiếp

- Có thể tích hợp Stripe thật thay cho payment mock.
- Có thể chuyển upload ảnh sang Cloudinary/S3 thay vì lưu base64 hoặc URL ảnh.
- Có thể bổ sung test tự động cho backend và frontend.
- Có thể chuẩn hóa toàn bộ thông báo backend sang UTF-8 tiếng Việt có dấu nếu cần hiển thị trực tiếp cho người dùng.
