# Google Login - Cấu hình, test và deploy

Tài liệu này mô tả tính năng đăng nhập bằng Google vừa được thêm vào dự án Men's Shop.

## 1. Luồng hoạt động

1. Frontend bấm nút `Đăng nhập với Google`.
2. Browser chuyển đến backend:

```text
GET /api/auth/google
```

3. Backend redirect sang màn hình đăng nhập Google.
4. Google redirect về backend:

```text
GET /api/auth/google/callback
```

5. Backend đổi `code` lấy thông tin Google profile.
6. Backend tìm user theo `googleId` hoặc `email`.
7. Nếu user chưa tồn tại, backend tạo user mới role `CUSTOMER`.
8. Backend tạo JWT và redirect về frontend:

```text
/auth/google/callback?token=<jwt>
```

9. Frontend lưu token, gọi `/api/auth/me`, sau đó chuyển về trang chủ hoặc admin.

## 2. Database bị ảnh hưởng

Tính năng này có migration mới:

```text
backend/prisma/migrations/20260620090000_add_google_login_fields/migration.sql
```

Các thay đổi trong bảng `users`:

| Cột | Ý nghĩa |
| --- | --- |
| `password` nullable | User đăng nhập Google có thể chưa có mật khẩu local |
| `googleId` unique nullable | ID tài khoản Google |
| `authProvider` | `LOCAL`, `GOOGLE`, hoặc `LOCAL_GOOGLE` |

Sau khi pull code hoặc deploy, cần chạy:

```powershell
cd backend
npx prisma generate
npx prisma migrate deploy
```

Nếu đang phát triển local bằng Prisma dev:

```powershell
cd backend
npm run prisma:generate
npm run prisma:migrate
```

## 3. Biến môi trường cần thêm

Backend cần:

```env
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
```

Các biến cũ vẫn cần:

```env
CLIENT_URL=http://localhost:5173
API_URL=http://localhost:5000
JWT_SECRET=replace_with_a_long_random_secret
EMAIL_DEV_MODE=true
OTP_EXPOSE_IN_RESPONSE=false
```

Nếu muốn gửi OTP qua Resend khi deploy, đổi sang:

```env
EMAIL_PROVIDER=resend
RESEND_API_KEY=<resend-api-key>
RESEND_FROM=Men's Shop <otp@your-verified-domain.com>
MAIL_TIMEOUT_MS=15000
EMAIL_DEV_MODE=false
OTP_EXPOSE_IN_RESPONSE=false
```

Khi test nhanh có thể dùng `onboarding@resend.dev`, nhưng để gửi thật cho nhiều người nhận nên verify domain trong Resend.

## 4. Cấu hình Google Cloud Console

Tạo OAuth Client:

1. Vào Google Cloud Console.
2. Tạo hoặc chọn project.
3. Vào `APIs & Services` > `Credentials`.
4. Tạo `OAuth client ID`.
5. Chọn application type: `Web application`.
6. Thêm Authorized JavaScript origins và Authorized redirect URIs.

Local Node/Vite:

```text
Authorized JavaScript origins:
http://localhost:5173

Authorized redirect URIs:
http://localhost:5000/api/auth/google/callback
```

Docker Compose với `docker-compose.override.yml`:

```text
Authorized JavaScript origins:
http://localhost:5174

Authorized redirect URIs:
http://localhost:5001/api/auth/google/callback
```

Hosting:

```text
Authorized JavaScript origins:
https://your-frontend-domain.vercel.app
https://mens-shop-rose.vercel.app

Authorized redirect URIs:
https://your-backend-domain.onrender.com/api/auth/google/callback
https://mens-shop-api-1txr.onrender.com/api/auth/google/callback
```

Lỗi thường gặp nhất là `redirect_uri_mismatch`, nghĩa là callback URL trong Google Cloud không khớp chính xác với `GOOGLE_CALLBACK_URL`.

## 5. Chạy local

Trong `backend/.env`, điền:

```env
GOOGLE_CLIENT_ID=<client-id-cua-ban>
GOOGLE_CLIENT_SECRET=<client-secret-cua-ban>
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
CLIENT_URL=http://localhost:5173
API_URL=http://localhost:5000
```

Chạy backend:

```powershell
cd backend
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

Chạy frontend:

```powershell
cd frontend
npm run dev
```

Test:

1. Mở `http://localhost:5173/login`.
2. Bấm `Đăng nhập với Google`.
3. Chọn tài khoản Google.
4. Sau khi callback, frontend tự đăng nhập và chuyển về trang chủ.

## 6. Chạy bằng Docker

Nếu dùng Docker Compose có override hiện tại, port thường là:

```text
Frontend: http://localhost:5174
Backend: http://localhost:5001
Callback: http://localhost:5001/api/auth/google/callback
```

Tạo file `.env` ở root từ `.env.docker.example`, sau đó điền:

```env
GOOGLE_CLIENT_ID=<client-id-cua-ban>
GOOGLE_CLIENT_SECRET=<client-secret-cua-ban>
GOOGLE_CALLBACK_URL=http://localhost:5001/api/auth/google/callback
CLIENT_URL=http://localhost:5174
API_URL=http://localhost:5001
VITE_API_URL=http://localhost:5001/api
```

Chạy:

```powershell
docker compose up -d --build
```

Kiểm tra log:

```powershell
docker compose logs -f backend
```

## 7. Deploy hosting

### 7.1. Backend

Trên Render/Railway/Koyeb, thêm env:

```env
GOOGLE_CLIENT_ID=<client-id-production>
GOOGLE_CLIENT_SECRET=<client-secret-production>
GOOGLE_CALLBACK_URL=https://your-backend-domain.onrender.com/api/auth/google/callback
CLIENT_URL=https://your-frontend-domain.vercel.app
API_URL=https://your-backend-domain.onrender.com
```

Với link deploy hiện tại của đồ án:

```env
GOOGLE_CALLBACK_URL=https://mens-shop-api-1txr.onrender.com/api/auth/google/callback
CLIENT_URL=https://mens-shop-rose.vercel.app
API_URL=https://mens-shop-api-1txr.onrender.com
```

Start command nên có migration:

```text
npx prisma migrate deploy && npm start
```

### 7.2. Frontend

Nếu backend URL không đổi thì không cần sửa thêm. Nếu đổi backend domain, đặt lại:

```env
VITE_API_URL=https://your-backend-domain.onrender.com/api
```

Với link deploy hiện tại:

```env
VITE_API_URL=https://mens-shop-api-1txr.onrender.com/api
```

Sau đó redeploy frontend.

### 7.3. Database

Cần chạy migration mới. Nếu start command backend đã có `npx prisma migrate deploy`, deployment sẽ tự chạy migration.

Không cần xóa database. Không chạy `down -v` hoặc reset database nếu muốn giữ dữ liệu.

## 8. Checklist test

| Mã test | Bước test | Kết quả mong đợi |
| --- | --- | --- |
| GGL-01 | Mở `/login`, bấm Google | Chuyển sang trang chọn tài khoản Google |
| GGL-02 | Chọn tài khoản Google mới | Tạo user mới trong database |
| GGL-03 | Google callback thành công | Frontend lưu token và chuyển về trang chủ |
| GGL-04 | Đăng xuất rồi đăng nhập lại bằng Google | Vào lại đúng user cũ |
| GGL-05 | Email Google trùng user local | User local được liên kết thêm `googleId` |
| GGL-06 | User bị khóa trong admin | Google callback trả về lỗi blocked |
| GGL-07 | Customer Google truy cập admin | Bị chặn như customer bình thường |
| GGL-08 | User Google dùng quên mật khẩu | Có thể tạo mật khẩu local qua OTP dev-mode |

## 9. Các phần cần làm lại khi deploy

Sau khi thêm tính năng Google Login, cần làm lại các phần sau:

1. Redeploy backend.
2. Chạy database migration.
3. Cập nhật env backend với `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL`.
4. Cấu hình Authorized redirect URI trong Google Cloud.
5. Redeploy frontend nếu `VITE_API_URL` hoặc domain frontend thay đổi.
6. Nếu chạy Docker, rebuild container backend/frontend.

## 10. Ghi chú OTP khi deploy

Nếu dùng Resend khi deploy backend, cấu hình thêm các biến sau trên Render/Railway/Koyeb:

```env
EMAIL_PROVIDER=resend
RESEND_API_KEY=<resend-api-key>
RESEND_FROM=Men's Shop <otp@your-verified-domain.com>
MAIL_TIMEOUT_MS=15000
EMAIL_DEV_MODE=false
OTP_EXPOSE_IN_RESPONSE=false
```

Sau đó redeploy backend. Frontend và database không cần redeploy chỉ vì đổi provider gửi mail, trừ khi bạn cũng đổi `VITE_API_URL`, domain hoặc có migration mới.

Nên kiểm tra cấu hình email trước/sau deploy bằng:

```powershell
cd backend
npm run mail:verify
```

Nếu không dùng Gmail thật, giữ:

```env
EMAIL_DEV_MODE=true
OTP_EXPOSE_IN_RESPONSE=false
```

Khi đó mã OTP đăng ký/quên mật khẩu sẽ được in trong log backend, không trả về frontend. Cách này an toàn hơn khi deploy public.

Nếu chỉ demo kín và muốn frontend hiện mã OTP như local, đặt:

```env
OTP_EXPOSE_IN_RESPONSE=true
```
