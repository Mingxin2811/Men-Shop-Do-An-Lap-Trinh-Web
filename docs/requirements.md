# Tài liệu yêu cầu chức năng

## 1. Mục tiêu hệ thống

Xây dựng website bán thời trang nam có đầy đủ các chức năng cơ bản của một website thương mại điện tử: hiển thị sản phẩm, giỏ hàng, đặt hàng, thanh toán online mức cơ bản và quản trị dữ liệu.

Hệ thống cần đạt mức trung bình, tập trung vào tính dùng được, giao diện rõ ràng, API có cấu trúc tốt và database hợp lý.

## 2. Tác nhân trong hệ thống

### Khách vãng lai

- Xem trang chủ
- Xem danh sách sản phẩm
- Tìm kiếm và lọc sản phẩm
- Xem chi tiết sản phẩm
- Đăng ký tài khoản
- Đăng nhập

### Khách hàng

- Sử dụng tất cả chức năng của khách vãng lai
- Thêm sản phẩm vào giỏ hàng
- Cập nhật giỏ hàng
- Đặt hàng
- Thanh toán online
- Xem lịch sử đơn hàng
- Cập nhật thông tin cá nhân

### Quản trị viên

- Đăng nhập trang quản trị
- Quản lý sản phẩm
- Quản lý danh mục
- Quản lý đơn hàng
- Quản lý người dùng
- Xem thống kê tổng quan

## 3. Chức năng người dùng

### 3.1 Đăng ký

- Người dùng nhập họ tên, email, mật khẩu, số điện thoại.
- Email không được trùng.
- Mật khẩu được mã hóa bằng bcrypt.
- Tài khoản mặc định có vai trò `CUSTOMER`.

### 3.2 Đăng nhập

- Người dùng đăng nhập bằng email và mật khẩu.
- Nếu đúng thông tin, backend trả về JWT.
- Frontend lưu token để gọi API cần xác thực.

### 3.3 Xem danh sách sản phẩm

- Hiển thị ảnh, tên, giá, danh mục, trạng thái còn hàng.
- Hỗ trợ phân trang.
- Hỗ trợ sắp xếp theo mới nhất/giá tăng/giá giảm.

### 3.4 Tìm kiếm và lọc sản phẩm

- Tìm kiếm theo tên sản phẩm.
- Lọc theo danh mục.
- Lọc theo khoảng giá.
- Lọc theo size và màu nếu có.

### 3.5 Chi tiết sản phẩm

- Hiển thị ảnh sản phẩm, mô tả, giá, size, màu, số lượng tồn.
- Cho phép chọn size, màu, số lượng.
- Có nút thêm vào giỏ hàng.

### 3.6 Giỏ hàng

- Hiển thị danh sách sản phẩm đã thêm.
- Cập nhật số lượng.
- Xóa sản phẩm khỏi giỏ.
- Tính tổng tiền tạm tính.

### 3.7 Đặt hàng

- Người dùng nhập địa chỉ giao hàng.
- Hệ thống tạo đơn hàng với trạng thái ban đầu là `PENDING`.
- Sau khi thanh toán thành công, cập nhật trạng thái thanh toán.

### 3.8 Thanh toán online

Để giữ mức đồ án vừa phải, nhóm có thể chọn một trong hai cách:

- Stripe test mode: dễ tích hợp, phù hợp demo quốc tế.
- VNPay sandbox: gần với bối cảnh Việt Nam hơn, nhưng cấu hình dài hơn.

Khuyến nghị: nếu muốn làm nhanh và chắc, dùng Stripe test mode. Nếu thầy ưu tiên cổng thanh toán Việt Nam, dùng VNPay sandbox.

### 3.9 Lịch sử đơn hàng

- Khách hàng xem danh sách đơn hàng của mình.
- Xem chi tiết từng đơn hàng.
- Hiển thị trạng thái đơn hàng và trạng thái thanh toán.

## 4. Chức năng quản trị

### 4.1 Quản lý sản phẩm

- Xem danh sách sản phẩm.
- Thêm sản phẩm.
- Sửa thông tin sản phẩm.
- Xóa hoặc ẩn sản phẩm.
- Cập nhật ảnh, giá, mô tả, số lượng tồn.

### 4.2 Quản lý danh mục

- Thêm danh mục.
- Sửa danh mục.
- Xóa danh mục nếu chưa có sản phẩm liên quan.

### 4.3 Quản lý đơn hàng

- Xem tất cả đơn hàng.
- Lọc theo trạng thái.
- Xem chi tiết đơn hàng.
- Cập nhật trạng thái: `PENDING`, `CONFIRMED`, `SHIPPING`, `COMPLETED`, `CANCELLED`.

### 4.4 Quản lý người dùng

- Xem danh sách người dùng.
- Khóa/mở khóa tài khoản ở mức đơn giản.
- Không cần làm phân quyền phức tạp.

### 4.5 Dashboard

- Tổng số sản phẩm.
- Tổng số đơn hàng.
- Tổng doanh thu đơn hàng đã hoàn thành.
- Đơn hàng mới nhất.

## 5. Yêu cầu phi chức năng

- Giao diện responsive trên desktop và mobile.
- API trả về JSON rõ ràng.
- Có validate dữ liệu đầu vào.
- Mật khẩu không lưu dạng plain text.
- API admin phải cần quyền `ADMIN`.
- Có file `.env.example`.
- Có Dockerfile và docker-compose.
- Có README hướng dẫn cài đặt, chạy local và deploy.

## 6. Phạm vi không bắt buộc

- Không cần chat realtime.
- Không cần recommendation AI.
- Không cần thanh toán thật bằng tiền thật.
- Không cần quản lý kho nâng cao.
- Không cần mã giảm giá phức tạp.
- Không cần upload nhiều ảnh cho mỗi sản phẩm trong bản đầu.
