# Kế hoạch deploy bằng Docker

## 1. Kết luận về Vercel

Vercel có thể dùng tốt cho frontend React và có domain miễn phí dạng `*.vercel.app`. Tuy nhiên, nếu yêu cầu của thầy là deploy bằng Docker container, Vercel không phải lựa chọn phù hợp cho phần deploy Docker.

Để đúng với yêu cầu đồ án, nhóm nên chọn một nền tảng có hỗ trợ Docker:

- Render
- Railway
- Fly.io
- VPS/free trial nếu có

Database PostgreSQL nên dùng dịch vụ hosted:

- Neon
- Supabase
- Render PostgreSQL
- Railway PostgreSQL

## 2. Kiến trúc deploy đề xuất

```text
User
  |
  v
Frontend React container
  |
  v
Backend NodeJS/Express container
  |
  v
PostgreSQL hosted database
```

## 3. Docker local development

Local nên có:

- PostgreSQL container
- Backend container
- Frontend có thể chạy local bằng npm hoặc container

File `docker-compose.yml` đề xuất:

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
      DATABASE_URL: postgresql://mens_shop:mens_shop_password@postgres:5432/mens_shop_db
      JWT_SECRET: change_me
      CLIENT_URL: http://localhost:5173
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

## 4. Backend Dockerfile đề xuất

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

## 5. Frontend Dockerfile đề xuất

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

## 6. Frontend nginx.conf đề xuất

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

## 7. Biến môi trường backend

File `.env.example`:

```text
PORT=5000
DATABASE_URL=postgresql://user:password@host:5432/database
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173

PAYMENT_PROVIDER=stripe
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
```

## 8. Biến môi trường frontend

File `.env.example`:

```text
VITE_API_URL=http://localhost:5000/api
```

## 9. Các bước deploy đề xuất

### Bước 1: Tạo database PostgreSQL hosted

- Tạo database trên Neon/Supabase/Render/Railway.
- Lấy connection string.
- Lưu vào biến môi trường `DATABASE_URL`.

### Bước 2: Deploy backend bằng Docker

- Tạo service mới trên Render/Railway/Fly.io.
- Chọn deploy từ GitHub repository.
- Chọn Dockerfile trong thư mục `backend`.
- Cấu hình các biến môi trường.
- Chạy migration Prisma.

### Bước 3: Deploy frontend bằng Docker

- Tạo service frontend.
- Chọn Dockerfile trong thư mục `frontend`.
- Cấu hình `VITE_API_URL` trỏ đến backend deployed URL.

### Bước 4: Cấu hình CORS

Backend cần cho phép frontend domain:

```text
CLIENT_URL=https://frontend-domain.example.com
```

### Bước 5: Kiểm thử

- Mở frontend domain.
- Đăng ký tài khoản.
- Đăng nhập.
- Xem sản phẩm.
- Thêm vào giỏ.
- Đặt hàng.
- Thanh toán test.
- Admin cập nhật đơn hàng.

## 10. Tên miền miễn phí

Lựa chọn đơn giản:

- Dùng domain miễn phí do nền tảng deploy cấp, ví dụ Render/Railway/Fly.io URL.
- Nếu frontend dùng Vercel thì có `*.vercel.app`, nhưng trường hợp này không thỏa mãn hoàn toàn yêu cầu deploy bằng Docker.

Lựa chọn nâng cao:

- Đăng ký free subdomain từ `is-a.dev` hoặc `eu.org`.
- Trỏ DNS về service frontend.

Khuyến nghị cho đồ án: dùng domain/subdomain miễn phí của nền tảng deploy Docker, sau đó giải thích rõ trong báo cáo.
