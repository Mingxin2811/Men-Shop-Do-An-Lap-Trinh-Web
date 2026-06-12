import { Link } from 'react-router-dom';
import './NotFoundPage.css';

export default function NotFoundPage() {
  return (
    <div className="notfound container">
      <p className="notfound__code">404</p>
      <h1 className="notfound__title">Không tìm thấy trang</h1>
      <p className="notfound__desc">
        Trang bạn tìm có thể đã bị xóa, đổi tên hoặc tạm thời không khả dụng.
      </p>
      <div className="notfound__actions">
        <Link to="/" className="btn btn-primary btn-lg">Về trang chủ</Link>
        <Link to="/products" className="btn btn-outline btn-lg">Xem sản phẩm</Link>
      </div>
    </div>
  );
}
