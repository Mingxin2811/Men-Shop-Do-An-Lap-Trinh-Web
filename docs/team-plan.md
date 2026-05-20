# Kế hoạch nhóm và tiến độ

## 1. Quy mô nhóm

Nhóm gồm 3 thành viên, quản lý source code bằng Git và GitHub. Nên dùng GitHub Projects hoặc Issues để chia việc, theo dõi tiến độ và lưu lịch sử trao đổi.

## 2. Phân công vai trò

### Thành viên 1 - Frontend chính

Phụ trách:

- Cấu hình ReactJS, Vite, Bootstrap
- Layout chung, navbar, footer
- Trang chủ
- Trang danh sách sản phẩm
- Trang chi tiết sản phẩm
- Trang giỏ hàng
- Trang đặt hàng
- Responsive UI

### Thành viên 2 - Backend và database chính

Phụ trách:

- Cấu hình NodeJS, ExpressJS
- Cấu hình PostgreSQL và Prisma
- Thiết kế database schema
- API auth, products, categories
- API cart, orders, payments
- Middleware JWT và phân quyền admin

### Thành viên 3 - Admin, payment, deploy và tài liệu

Phụ trách:

- Trang admin dashboard
- Quản lý sản phẩm, danh mục, đơn hàng
- Tích hợp thanh toán online test/sandbox
- Dockerfile, docker-compose
- Deploy bằng Docker
- README, báo cáo, slide

Ghi chú: vai trò có thể linh hoạt, nhưng mỗi task trên GitHub nên có người chịu trách nhiệm chính.

## 3. Git workflow đề xuất

Nhánh chính:

- `main`: code ổn định, dùng để nộp/deploy
- `develop`: nhánh tổng hợp tính năng

Nhánh tính năng:

- `feature/auth`
- `feature/products`
- `feature/cart-order`
- `feature/admin`
- `feature/payment`
- `feature/docker-deploy`

Quy trình:

1. Tạo issue cho từng chức năng.
2. Tạo branch từ `develop`.
3. Code và commit theo task nhỏ.
4. Tạo Pull Request vào `develop`.
5. Thành viên khác review.
6. Merge vào `develop`.
7. Khi ổn định, merge `develop` vào `main`.

## 4. Quy tắc commit

Dùng commit message ngắn gọn:

```text
feat: add product list page
feat: implement login api
fix: correct cart total calculation
style: update product card layout
docs: add deployment guide
chore: configure docker compose
```

## 5. Timeline 6 tuần

### Tuần 1 - Phân tích và khởi tạo

- Chốt phạm vi chức năng.
- Tạo GitHub repository.
- Tạo cấu trúc frontend/backend.
- Thiết kế database ban đầu.
- Tạo UI wireframe cơ bản.
- Viết README ban đầu.

Kết quả:

- Repo có cấu trúc rõ ràng.
- Có tài liệu yêu cầu và database.
- Chạy được frontend/backend mẫu.

### Tuần 2 - Backend nền tảng

- Cấu hình ExpressJS.
- Cấu hình Prisma và PostgreSQL.
- Tạo models/tables.
- Làm auth: register, login, me.
- Làm middleware JWT và role admin.
- Seed dữ liệu danh mục/sản phẩm demo.

Kết quả:

- Backend kết nối database.
- Đăng ký/đăng nhập hoạt động.
- Có data demo.

### Tuần 3 - Sản phẩm và frontend người dùng

- Làm API products/categories.
- Làm trang chủ.
- Làm trang danh sách sản phẩm.
- Làm trang chi tiết sản phẩm.
- Tìm kiếm, lọc, phân trang cơ bản.

Kết quả:

- Người dùng xem và tìm sản phẩm được.
- Frontend gọi API thật.

### Tuần 4 - Giỏ hàng, đơn hàng và thanh toán

- Làm API cart.
- Làm API order.
- Làm trang giỏ hàng.
- Làm trang đặt hàng.
- Tích hợp thanh toán test/sandbox.
- Xử lý payment success/cancel.

Kết quả:

- Tạo đơn hàng được.
- Có luồng thanh toán online để demo.

### Tuần 5 - Admin

- Làm admin layout.
- Quản lý sản phẩm.
- Quản lý danh mục.
- Quản lý đơn hàng.
- Cập nhật trạng thái đơn hàng.
- Dashboard thống kê cơ bản.

Kết quả:

- Admin quản lý được dữ liệu chính.
- Hoàn thành phần quản trị.

### Tuần 6 - Docker, deploy, kiểm thử và báo cáo

- Viết Dockerfile cho frontend/backend.
- Viết docker-compose cho local.
- Deploy database.
- Deploy frontend/backend bằng Docker.
- Kiểm thử các luồng chính.
- Hoàn thiện README, báo cáo, slide.

Kết quả:

- Có link demo.
- Có hướng dẫn cài đặt.
- Có tài liệu nộp đồ án.

## 6. Checklist nghiệm thu

Người dùng:

- Đăng ký tài khoản mới.
- Đăng nhập thành công.
- Xem danh sách sản phẩm.
- Lọc/tìm kiếm sản phẩm.
- Xem chi tiết sản phẩm.
- Thêm vào giỏ hàng.
- Cập nhật giỏ hàng.
- Đặt hàng.
- Thanh toán test/sandbox.
- Xem lịch sử đơn hàng.

Admin:

- Đăng nhập admin.
- Thêm sản phẩm mới.
- Sửa sản phẩm.
- Xóa/ẩn sản phẩm.
- Thêm/sửa danh mục.
- Xem đơn hàng.
- Cập nhật trạng thái đơn hàng.
- Xem dashboard.

Kỹ thuật:

- Backend dùng PostgreSQL.
- Mật khẩu được mã hóa.
- API admin có bảo vệ quyền.
- Docker build thành công.
- Docker compose chạy local được.
- Deploy bằng Docker có link truy cập.
