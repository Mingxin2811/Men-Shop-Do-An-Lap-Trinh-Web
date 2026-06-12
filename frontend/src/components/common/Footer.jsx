import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../../contexts/ToastContext';
import './Footer.css';

export default function Footer() {
  const toast = useToast();
  const [email, setEmail] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    const value = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      toast.error('Vui lòng nhập email hợp lệ');
      return;
    }
    // Lưu tạm danh sách email đăng ký phía client (chưa có API backend).
    try {
      const list = JSON.parse(localStorage.getItem('newsletter') || '[]');
      if (!list.includes(value)) {
        list.push(value);
        localStorage.setItem('newsletter', JSON.stringify(list));
      }
    } catch { /* bỏ qua lỗi localStorage */ }
    setEmail('');
    toast.success('Đăng ký nhận tin thành công!');
  };

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__top">
          <div className="footer__brand">
            <div className="footer__logo">
              <span>MEN'S</span>
              <small>SHOP</small>
            </div>
            <p>Phong cách sống của người đàn ông hiện đại.<br/>Thời trang tinh tế — Chất lượng bền vững.</p>

            <form className="footer__newsletter" onSubmit={handleSubscribe}>
              <label htmlFor="footer-news">Đăng ký nhận ưu đãi &amp; bộ sưu tập mới</label>
              <div className="footer__newsletter-row">
                <input
                  id="footer-news"
                  type="email"
                  placeholder="Email của bạn"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <button type="submit" aria-label="Đăng ký">→</button>
              </div>
            </form>
          </div>

          <div className="footer__col">
            <h6>Bộ sưu tập</h6>
            <ul>
              <li><Link to="/products?category=ao-thun">Áo thun</Link></li>
              <li><Link to="/products?category=ao-so-mi">Áo sơ mi</Link></li>
              <li><Link to="/products?category=ao-khoac">Áo khoác</Link></li>
              <li><Link to="/products?category=quan-jeans">Quần jeans</Link></li>
              <li><Link to="/products?category=quan-tay">Quần tây</Link></li>
              <li><Link to="/products?category=phu-kien">Phụ kiện</Link></li>
            </ul>
          </div>

          <div className="footer__col">
            <h6>Tài khoản</h6>
            <ul>
              <li><Link to="/login">Đăng nhập</Link></li>
              <li><Link to="/register">Đăng ký</Link></li>
              <li><Link to="/orders">Đơn hàng</Link></li>
              <li><Link to="/profile">Hồ sơ</Link></li>
            </ul>
          </div>

          <div className="footer__col">
            <h6>Liên hệ</h6>
            <ul>
              <li>info@menshop.vn</li>
              <li>0901 234 567</li>
              <li>TP. Hồ Chí Minh</li>
            </ul>
            <div className="footer__socials">
              <a href="#" aria-label="Instagram">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/>
                  <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
                </svg>
              </a>
              <a href="#" aria-label="Facebook">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>

        <div className="footer__bottom">
          <p>© {new Date().getFullYear()} Men's Shop. Tất cả quyền được bảo lưu.</p>
          <p>Đồ án môn Lập trình Web</p>
        </div>
      </div>
    </footer>
  );
}
