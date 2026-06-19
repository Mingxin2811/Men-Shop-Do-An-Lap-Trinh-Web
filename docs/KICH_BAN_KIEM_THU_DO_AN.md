# Kịch bản kiểm thử đồ án Men's Shop

Tài liệu này dùng để kiểm thử và demo đồ án lập trình web Men's Shop theo 3 môi trường:

- Demo local bằng Node.js + PostgreSQL.
- Demo hosting bằng frontend Vercel, backend Render và database PostgreSQL hosted.
- Demo Docker bằng Docker Compose.

## 1. Thông tin chung

### 1.1. Công nghệ cần kiểm thử

- Frontend: React, Vite, React Router, Axios.
- Backend: Node.js, Express, Prisma, JWT, bcrypt, nodemailer.
- Database: PostgreSQL.
- Deploy: Vercel, Render, PostgreSQL hosted hoặc Docker Compose.

### 1.2. Tài khoản demo

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

### 1.3. Ghi chú về OTP

Khi chạy demo/local, dự án dùng:

```env
EMAIL_DEV_MODE=true
```

Với chế độ này, OTP không cần gửi Gmail thật. Backend sẽ in nội dung email và mã OTP ra terminal/log backend. Khi test đăng ký hoặc quên mật khẩu, mở terminal đang chạy backend để lấy OTP.

## 2. Kiểm thử demo local

### 2.1. Mục tiêu

Xác minh hệ thống chạy được trên máy cá nhân, frontend gọi được backend, backend kết nối được database, các chức năng chính hoạt động đúng.

### 2.2. Chuẩn bị

Yêu cầu:

- Node.js 20 hoặc tương thích.
- npm.
- PostgreSQL đang chạy local.
- Database đã tạo theo `DATABASE_URL` trong `backend/.env`.

Chạy backend:

```powershell
cd backend
npm install
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

Kết quả mong đợi:

- Backend chạy ở `http://localhost:5000`.
- Mở được `http://localhost:5000/api/health`.
- Mở được `http://localhost:5000/api-docs`.
- Terminal backend không báo lỗi kết nối database.

Chạy frontend:

```powershell
cd frontend
npm install
npm run dev
```

Kết quả mong đợi:

- Frontend chạy ở `http://localhost:5173`.
- Trang chủ hiển thị bình thường.
- Console trình duyệt không có lỗi API nghiêm trọng.

### 2.3. Kiểm thử trang công khai

| Mã test | Chức năng | Bước thực hiện | Kết quả mong đợi |
| --- | --- | --- | --- |
| LOCAL-01 | Trang chủ | Mở `http://localhost:5173` | Trang chủ hiển thị banner, sản phẩm, điều hướng |
| LOCAL-02 | Danh sách sản phẩm | Vào trang sản phẩm | Hiển thị danh sách sản phẩm seed |
| LOCAL-03 | Tìm kiếm | Tìm `ao thun` hoặc tên sản phẩm | Danh sách lọc đúng, hỗ trợ không dấu |
| LOCAL-04 | Lọc sản phẩm | Lọc theo danh mục, giá, size, màu | Kết quả thay đổi đúng theo bộ lọc |
| LOCAL-05 | Chi tiết sản phẩm | Bấm vào một sản phẩm | Hiển thị ảnh, giá, mô tả, biến thể, tồn kho |
| LOCAL-06 | Blog | Vào trang blog/bài viết | Hiển thị danh sách và chi tiết bài viết |

### 2.4. Kiểm thử đăng ký bằng OTP dev-mode

| Mã test | Bước thực hiện | Kết quả mong đợi |
| --- | --- | --- |
| LOCAL-07 | Vào trang đăng ký | Form đăng ký hiển thị đầy đủ |
| LOCAL-08 | Nhập email mới, mật khẩu hợp lệ, bấm gửi OTP | Backend in OTP trong terminal, frontend chuyển sang bước nhập OTP |
| LOCAL-09 | Nhập sai OTP | Hệ thống báo OTP không chính xác |
| LOCAL-10 | Nhập đúng OTP từ terminal backend | Tạo tài khoản thành công, chuyển về đăng nhập |
| LOCAL-11 | Đăng nhập bằng tài khoản vừa tạo | Đăng nhập thành công, hiển thị thông tin user |

### 2.5. Kiểm thử đăng nhập và hồ sơ

| Mã test | Chức năng | Bước thực hiện | Kết quả mong đợi |
| --- | --- | --- | --- |
| LOCAL-12 | Đăng nhập customer | Đăng nhập `customer@menshop.com` | Đăng nhập thành công, có token |
| LOCAL-13 | Sai mật khẩu | Nhập sai password | Hiển thị thông báo lỗi |
| LOCAL-14 | Hồ sơ cá nhân | Cập nhật tên, số điện thoại, địa chỉ | Dữ liệu được lưu và hiển thị lại |
| LOCAL-15 | Đổi mật khẩu | Nhập mật khẩu hiện tại và mật khẩu mới hợp lệ | Đổi mật khẩu thành công |
| LOCAL-16 | Quên mật khẩu | Nhập email customer, lấy OTP ở terminal backend | Đặt lại mật khẩu thành công |

Sau test đổi/quên mật khẩu, nếu dùng tài khoản demo, nên khôi phục lại mật khẩu hoặc chạy seed lại để tiện demo tiếp.

### 2.6. Kiểm thử wishlist, giỏ hàng và checkout

| Mã test | Chức năng | Bước thực hiện | Kết quả mong đợi |
| --- | --- | --- | --- |
| LOCAL-17 | Wishlist khi chưa đăng nhập | Bấm yêu thích sản phẩm | Sản phẩm được lưu cục bộ |
| LOCAL-18 | Đồng bộ wishlist | Đăng nhập sau khi yêu thích | Wishlist đồng bộ vào tài khoản |
| LOCAL-19 | Thêm giỏ hàng | Chọn size/màu/số lượng và thêm vào giỏ | Giỏ hàng cập nhật đúng |
| LOCAL-20 | Cập nhật giỏ hàng | Tăng/giảm số lượng | Tổng tiền cập nhật đúng |
| LOCAL-21 | Xóa sản phẩm khỏi giỏ | Xóa một item | Item biến mất, tổng tiền cập nhật |
| LOCAL-22 | Áp dụng mã giảm giá | Nhập mã coupon demo | Giảm giá được áp dụng đúng điều kiện |
| LOCAL-23 | Checkout COD | Nhập thông tin giao hàng, chọn COD | Tạo đơn hàng thành công |
| LOCAL-24 | Checkout online mock | Chọn thanh toán online | Chuyển sang cổng thanh toán mock và quay về trang kết quả |

### 2.7. Kiểm thử đơn hàng và đánh giá

| Mã test | Chức năng | Bước thực hiện | Kết quả mong đợi |
| --- | --- | --- | --- |
| LOCAL-25 | Lịch sử đơn hàng | Vào trang đơn hàng của tôi | Hiển thị đơn vừa tạo |
| LOCAL-26 | Chi tiết đơn hàng | Mở chi tiết một đơn | Hiển thị sản phẩm, tổng tiền, trạng thái |
| LOCAL-27 | Hủy đơn | Hủy đơn đang ở trạng thái chờ xử lý | Đơn chuyển trạng thái hủy, tồn kho được hoàn |
| LOCAL-28 | Đánh giá sản phẩm | Với đơn đã hoàn tất, gửi đánh giá | Đánh giá hiển thị ở chi tiết sản phẩm |

### 2.8. Kiểm thử admin

Đăng nhập:

```text
admin@menshop.com
Admin123456
```

| Mã test | Chức năng | Bước thực hiện | Kết quả mong đợi |
| --- | --- | --- | --- |
| LOCAL-29 | Dashboard | Vào trang admin | Hiển thị thống kê doanh thu, đơn hàng, user, sản phẩm |
| LOCAL-30 | Quản lý sản phẩm | Thêm sản phẩm mới | Sản phẩm lưu thành công và xuất hiện trong danh sách |
| LOCAL-31 | Sửa sản phẩm | Sửa tên, giá, tồn kho, biến thể | Dữ liệu cập nhật đúng |
| LOCAL-32 | Ẩn sản phẩm | Bấm ẩn/xóa sản phẩm | Sản phẩm không còn hiển thị ở trang public |
| LOCAL-33 | Quản lý danh mục | Thêm/sửa/xóa danh mục không có sản phẩm | Thao tác thành công hoặc báo lỗi hợp lý nếu đang có ràng buộc |
| LOCAL-34 | Quản lý đơn hàng | Cập nhật trạng thái đơn | Trạng thái đơn thay đổi đúng |
| LOCAL-35 | Hoàn tất đơn | Chuyển đơn sang hoàn tất | Payment status chuyển phù hợp |
| LOCAL-36 | Quản lý user | Khóa/mở khóa customer | User bị khóa không đăng nhập được, mở khóa đăng nhập lại được |
| LOCAL-37 | Quản lý blog | Thêm/sửa/ẩn bài viết | Bài viết hiển thị đúng ở trang blog |
| LOCAL-38 | Quản lý coupon | Tạo/sửa/xóa mã giảm giá | Checkout áp dụng coupon đúng |

### 2.9. Kiểm thử bảo mật cơ bản

| Mã test | Trường hợp | Kết quả mong đợi |
| --- | --- | --- |
| LOCAL-39 | Gọi API cần đăng nhập khi không có token | Trả `401` |
| LOCAL-40 | Customer truy cập route admin | Trả `403` hoặc bị chuyển hướng |
| LOCAL-41 | Token sai/hết hạn | Bị yêu cầu đăng nhập lại |
| LOCAL-42 | Mật khẩu yếu khi đăng ký | Form/API báo lỗi validate |
| LOCAL-43 | OTP hết hạn hoặc nhập sai quá nhiều lần | Hệ thống từ chối xác thực |
| LOCAL-44 | Customer xem đơn hàng của người khác | Không được phép truy cập |

## 3. Kiểm thử hosting

### 3.1. Mục tiêu

Xác minh hệ thống hoạt động trên môi trường thật:

- Frontend: Vercel hoặc hosting tương đương.
- Backend: Render/Railway/Koyeb/VPS.
- Database: Neon/Supabase/Render PostgreSQL.

### 3.2. Chuẩn bị

Backend cần có biến môi trường:

```env
NODE_ENV=production
DATABASE_URL=postgresql://...
JWT_SECRET=...
JWT_EXPIRES_IN=7d
CLIENT_URL=https://frontend-domain.example.com
API_URL=https://backend-domain.example.com
EMAIL_DEV_MODE=true
```

Frontend cần có:

```env
VITE_API_URL=https://backend-domain.example.com/api
```

Backend start command tham khảo:

```text
npx prisma migrate deploy && npm start
```

Nếu cần dữ liệu demo trên database hosting:

```powershell
cd backend
npm run prisma:seed
```

Hoặc chạy seed qua shell của nền tảng hosting.

### 3.3. Kiểm thử hạ tầng hosting

| Mã test | Hạng mục | Bước thực hiện | Kết quả mong đợi |
| --- | --- | --- | --- |
| HOST-01 | Backend health | Mở `https://backend-domain/api/health` | Trả `200`, `success: true` |
| HOST-02 | Swagger | Mở `https://backend-domain/api-docs` | Swagger UI hiển thị |
| HOST-03 | Frontend | Mở domain frontend | Trang chủ hiển thị |
| HOST-04 | API URL | Từ frontend tải danh sách sản phẩm | Không lỗi CORS, không lỗi network |
| HOST-05 | Database | Đăng nhập tài khoản seed | Backend đọc được database hosted |
| HOST-06 | CORS | Gọi API từ domain frontend production | Backend cho phép origin đúng |

### 3.4. Kiểm thử chức năng trên hosting

Thực hiện lại các nhóm test chính:

- Public: `LOCAL-01` đến `LOCAL-06`.
- Auth: `LOCAL-12`, `LOCAL-13`, `LOCAL-16`.
- Cart/checkout: `LOCAL-19` đến `LOCAL-24`.
- Đơn hàng: `LOCAL-25` đến `LOCAL-28`.
- Admin: `LOCAL-29` đến `LOCAL-38`.
- Bảo mật: `LOCAL-39` đến `LOCAL-44`.

Ghi chú:

- Nếu Render free sleep, request đầu tiên có thể chậm. Đợi backend khởi động rồi test lại.
- Nếu frontend báo lỗi CORS, kiểm tra `CLIENT_URL` trên backend có đúng domain Vercel không.
- Nếu frontend gọi sai API, kiểm tra `VITE_API_URL` trên Vercel rồi redeploy frontend.
- Nếu database trống, chạy migration và seed.

### 3.5. Checklist nghiệm thu hosting

| Tiêu chí | Đạt/Không đạt | Ghi chú |
| --- | --- | --- |
| Frontend domain mở được |  |  |
| Backend `/api/health` trả `200` |  |  |
| Swagger mở được |  |  |
| Sản phẩm hiển thị từ database hosting |  |  |
| Đăng nhập customer thành công |  |  |
| Đăng nhập admin thành công |  |  |
| Checkout COD thành công |  |  |
| Checkout mock online thành công |  |  |
| Admin cập nhật đơn hàng thành công |  |  |
| Không có lỗi CORS |  |  |

## 4. Kiểm thử Docker

### 4.1. Mục tiêu

Xác minh dự án chạy được đầy đủ bằng Docker Compose gồm:

- PostgreSQL container.
- Backend container.
- Frontend Nginx container.

### 4.2. Chạy Docker demo

Từ thư mục root:

```powershell
docker compose up -d --build
```

Nếu có `docker-compose.override.yml`, port có thể là:

```text
Frontend: http://localhost:5174
Backend:  http://localhost:5001
API docs: http://localhost:5001/api-docs
```

Nếu không dùng override, port thường là:

```text
Frontend: http://localhost:5173
Backend:  http://localhost:5000
API docs: http://localhost:5000/api-docs
```

Kiểm tra container:

```powershell
docker compose ps
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f postgres
```

Kết quả mong đợi:

- PostgreSQL healthy.
- Backend healthy.
- Frontend healthy.
- Backend chạy migration và seed thành công.

### 4.3. Kiểm thử Docker health và network

| Mã test | Hạng mục | Bước thực hiện | Kết quả mong đợi |
| --- | --- | --- | --- |
| DOCKER-01 | Container status | Chạy `docker compose ps` | 3 service đang `running` hoặc `healthy` |
| DOCKER-02 | Backend health | Mở backend `/api/health` | Trả `200`, `success: true` |
| DOCKER-03 | Swagger | Mở backend `/api-docs` | Swagger hiển thị |
| DOCKER-04 | Frontend | Mở frontend Docker | Trang chủ hiển thị |
| DOCKER-05 | Frontend gọi backend | Vào danh sách sản phẩm | Sản phẩm tải được từ API container |
| DOCKER-06 | Database volume | Restart container | Dữ liệu vẫn còn nếu không xóa volume |

### 4.4. Kiểm thử chức năng trên Docker

Thực hiện lại kịch bản:

- Public: `LOCAL-01` đến `LOCAL-06`.
- Auth dev OTP: `LOCAL-07` đến `LOCAL-11`.
- Customer: `LOCAL-17` đến `LOCAL-28`.
- Admin: `LOCAL-29` đến `LOCAL-38`.

Ghi chú OTP Docker:

- Khi `EMAIL_DEV_MODE=true`, OTP nằm trong log backend.
- Xem OTP bằng:

```powershell
docker compose logs -f backend
```

### 4.5. Kiểm thử Docker deploy không seed

Chạy:

```powershell
docker compose -f docker-compose.yml -f docker-compose.deploy.yml up -d --build
```

Kết quả mong đợi:

- Backend chỉ chạy migration và start.
- Không tự seed dữ liệu demo.
- Nếu database trống, frontend vẫn mở được nhưng có thể chưa có sản phẩm/tài khoản demo.

Trường hợp cần seed thủ công:

```powershell
docker compose exec backend npm run prisma:seed
```

### 4.6. Dọn môi trường Docker

Dừng container nhưng giữ database volume:

```powershell
docker compose down
```

Dừng container và xóa sạch database volume:

```powershell
docker compose down -v
```

Chỉ dùng `down -v` khi muốn reset sạch dữ liệu.

## 5. Kịch bản demo đề xuất khi thuyết trình

Thứ tự demo ngắn gọn trong 10-15 phút:

1. Mở frontend, giới thiệu trang chủ và danh mục sản phẩm.
2. Tìm kiếm/lọc sản phẩm và mở chi tiết sản phẩm.
3. Đăng nhập customer demo.
4. Thêm sản phẩm vào wishlist và giỏ hàng.
5. Checkout COD hoặc thanh toán mock online.
6. Mở lịch sử đơn hàng và chi tiết đơn.
7. Đăng xuất customer, đăng nhập admin.
8. Mở dashboard admin.
9. Cập nhật trạng thái đơn hàng vừa tạo.
10. Thêm/sửa/ẩn một sản phẩm.
11. Khóa/mở khóa một user thử nghiệm.
12. Mở backend `/api/health` và Swagger để chứng minh API hoạt động.
13. Nếu demo Docker, mở `docker compose ps` để chứng minh đủ 3 service.

## 6. Mẫu biên bản kết quả kiểm thử

| Ngày test | Môi trường | Người test | Kết quả chung | Ghi chú |
| --- | --- | --- | --- | --- |
|  | Local |  | Đạt/Không đạt |  |
|  | Hosting |  | Đạt/Không đạt |  |
|  | Docker |  | Đạt/Không đạt |  |

| Mã test | Kết quả | Lỗi phát hiện | Cách xử lý |
| --- | --- | --- | --- |
| LOCAL-01 |  |  |  |
| HOST-01 |  |  |  |
| DOCKER-01 |  |  |  |

## 7. Các lỗi thường gặp khi kiểm thử

| Hiện tượng | Nguyên nhân thường gặp | Cách xử lý |
| --- | --- | --- |
| Frontend không gọi được API | Sai `VITE_API_URL` | Sửa env frontend và build/redeploy |
| Lỗi CORS trên hosting | Sai `CLIENT_URL` backend | Cập nhật domain frontend trong backend env |
| Không đăng nhập được tài khoản demo | Chưa seed database hoặc đổi mật khẩu khi test | Chạy lại seed hoặc tạo lại tài khoản |
| Không có sản phẩm | Database trống hoặc seed lỗi | Kiểm tra migration/seed/log backend |
| OTP không gửi mail | Đang dùng `EMAIL_DEV_MODE=true` | Lấy OTP trong terminal/log backend |
| Docker frontend không tải sản phẩm | Sai port hoặc sai `VITE_API_URL` build arg | Kiểm tra compose override và rebuild frontend |
| Backend không start | Database chưa healthy hoặc `DATABASE_URL` sai | Xem log backend/postgres |
| Render request đầu tiên chậm | Service free bị sleep | Đợi service wake up rồi thử lại |

