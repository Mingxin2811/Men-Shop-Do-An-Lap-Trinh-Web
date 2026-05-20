# Men's Shop - Website thời trang nam

## 1. Giới thiệu

Men's Shop là website thương mại điện tử bán thời trang nam, được xây dựng cho đồ án môn Lập trình Web. Website hỗ trợ người dùng xem sản phẩm, tìm kiếm, lọc theo danh mục, thêm vào giỏ hàng, đặt hàng và thanh toán online ở mức mô phỏng/tích hợp đơn giản. Hệ thống có trang quản trị để quản lý sản phẩm, danh mục, đơn hàng và người dùng.

## 2. Công nghệ sử dụng

- Frontend: ReactJS, Vite, Bootstrap, React Router, Axios
- Backend: NodeJS, ExpressJS
- Database: PostgreSQL
- ORM: Prisma
- Authentication: JWT, bcrypt
- Payment: Stripe test mode hoặc VNPay sandbox
- Deployment: Docker
- Source control: Git, GitHub

## 3. Hướng triển khai đề xuất

- Frontend: build thành static file và deploy bằng Docker trên Render/Railway/Fly.io/VPS miễn phí hoặc free trial.
- Backend: deploy bằng Docker container.
- Database: PostgreSQL hosted trên Neon/Supabase/Render/Railway.
- Local development: dùng `docker-compose.yml` để chạy backend và database.

Ghi chú: Vercel phù hợp cho React frontend và có domain miễn phí dạng `*.vercel.app`, nhưng không phù hợp nếu yêu cầu bắt buộc deploy ứng dụng bằng Docker container. Nếu thầy bắt buộc Docker, nên deploy frontend/backend trên nền tảng có hỗ trợ Docker.

## 4. Chức năng chính

Người dùng:

- Đăng ký, đăng nhập, đăng xuất
- Xem danh sách sản phẩm
- Tìm kiếm sản phẩm
- Lọc sản phẩm theo danh mục, giá, size, màu
- Xem chi tiết sản phẩm
- Thêm sản phẩm vào giỏ hàng
- Cập nhật/xóa sản phẩm trong giỏ hàng
- Đặt hàng
- Thanh toán online ở chế độ test/sandbox
- Xem lịch sử đơn hàng
- Cập nhật thông tin cá nhân

Quản trị viên:

- Đăng nhập trang quản trị
- Quản lý sản phẩm
- Quản lý danh mục
- Quản lý đơn hàng
- Cập nhật trạng thái đơn hàng
- Quản lý người dùng
- Xem thống kê cơ bản

## 5. Cấu trúc thư mục đề xuất

```text
mens-shop/
  frontend/
    src/
      assets/
      components/
      pages/
      routes/
      services/
      store/
      utils/
    package.json
    Dockerfile

  backend/
    prisma/
      schema.prisma
      seed.js
    src/
      config/
      controllers/
      middlewares/
      routes/
      services/
      utils/
      app.js
      server.js
    package.json
    Dockerfile

  docs/
    requirements.md
    database-and-api.md
    team-plan.md
    deployment.md

  docker-compose.yml
  README.md
```

## 6. Tài liệu chi tiết

- [Yêu cầu chức năng](./docs/requirements.md)
- [Thiết kế database và API](./docs/database-and-api.md)
- [Kế hoạch nhóm](./docs/team-plan.md)
- [Kế hoạch deploy Docker](./docs/deployment.md)
