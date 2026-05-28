import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setUserMenuOpen(false);
  }, [location]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isHome = location.pathname === '/';

  return (
    <nav className={`navbar${scrolled || !isHome ? ' navbar--solid' : ''}${menuOpen ? ' navbar--open' : ''}`}>
      <div className="navbar__inner container">
        {/* Mobile hamburger */}
        <button
          className={`navbar__hamburger${menuOpen ? ' active' : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menu"
        >
          <span /><span /><span />
        </button>

        {/* Logo */}
        <Link to="/" className="navbar__logo">
          <span className="navbar__logo-main">MEN'S</span>
          <span className="navbar__logo-sub">SHOP</span>
        </Link>

        {/* Nav links */}
        <ul className="navbar__links">
          <li><NavLink to="/products">Bộ sưu tập</NavLink></li>
          <li><NavLink to="/products?category=ao-thun">Áo</NavLink></li>
          <li><NavLink to="/products?category=quan-jeans">Quần</NavLink></li>
          <li><NavLink to="/products?category=phu-kien">Phụ kiện</NavLink></li>
        </ul>

        {/* Actions */}
        <div className="navbar__actions">
          {user ? (
            <div className="navbar__user" onClick={() => setUserMenuOpen(!userMenuOpen)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
              </svg>
              <span className="navbar__user-name">{user.name.split(' ')[0]}</span>
              {userMenuOpen && (
                <div className="navbar__dropdown">
                  <Link to="/profile">Tài khoản</Link>
                  <Link to="/orders">Đơn hàng</Link>
                  {user.role === 'ADMIN' && <Link to="/admin">Quản trị</Link>}
                  <button onClick={handleLogout}>Đăng xuất</button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="navbar__login">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
              </svg>
            </Link>
          )}

          <Link to="/cart" className="navbar__cart">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 01-8 0"/>
            </svg>
            {count > 0 && <span className="navbar__cart-badge">{count}</span>}
          </Link>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`navbar__mobile-menu${menuOpen ? ' open' : ''}`}>
        <NavLink to="/products">Bộ sưu tập</NavLink>
        <NavLink to="/products?category=ao-thun">Áo</NavLink>
        <NavLink to="/products?category=quan-jeans">Quần</NavLink>
        <NavLink to="/products?category=phu-kien">Phụ kiện</NavLink>
        <div className="navbar__mobile-divider" />
        {user ? (
          <>
            <NavLink to="/profile">Tài khoản</NavLink>
            <NavLink to="/orders">Đơn hàng</NavLink>
            {user.role === 'ADMIN' && <NavLink to="/admin">Quản trị</NavLink>}
            <button onClick={handleLogout}>Đăng xuất</button>
          </>
        ) : (
          <>
            <NavLink to="/login">Đăng nhập</NavLink>
            <NavLink to="/register">Đăng ký</NavLink>
          </>
        )}
      </div>
    </nav>
  );
}
