import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';
import { productService } from '../../services/product.service';
import './Navbar.css';

const formatPrice = (p) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);
const effectivePrice = (p) =>
  Number(p.salePrice) > 0 && Number(p.salePrice) < Number(p.price) ? p.salePrice : p.price;

export default function Navbar() {
  const { user, logout } = useAuth();
  const { count, openCart } = useCart();
  const { count: wishlistCount } = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [sugLoading, setSugLoading] = useState(false);
  const searchInputRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setUserMenuOpen(false);
    setSearchOpen(false);
  }, [location]);

  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  // Gợi ý tìm kiếm tức thì (debounce 300ms, từ 2 ký tự).
  useEffect(() => {
    const term = searchTerm.trim();
    if (!searchOpen || term.length < 2) { setSuggestions([]); setSugLoading(false); return; }
    setSugLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await productService.getProducts({ search: term, limit: 5 });
        setSuggestions(res.data.data.products || []);
      } catch { setSuggestions([]); }
      finally { setSugLoading(false); }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, searchOpen]);

  const handleSelectSuggestion = () => {
    setSearchOpen(false);
    setSearchTerm('');
    setSuggestions([]);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const term = searchTerm.trim();
    if (!term) return;
    setSearchOpen(false);
    setSearchTerm('');
    navigate(`/products?search=${encodeURIComponent(term)}`);
  };

  const isHome = location.pathname === '/';

  return (
    <nav className={`navbar${scrolled || !isHome || searchOpen ? ' navbar--solid' : ''}${menuOpen ? ' navbar--open' : ''}`}>
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
          <li><NavLink to="/blog">Blog</NavLink></li>
        </ul>

        {/* Actions */}
        <div className="navbar__actions">
          {/* Search */}
          <button
            className="navbar__icon-btn"
            onClick={() => setSearchOpen(o => !o)}
            aria-label="Tìm kiếm"
            aria-expanded={searchOpen}
          >
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </button>

          {/* Wishlist */}
          <Link to="/wishlist" className="navbar__icon-btn navbar__wishlist" aria-label="Danh sách yêu thích">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"/>
            </svg>
            {wishlistCount > 0 && <span className="navbar__badge">{wishlistCount}</span>}
          </Link>

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
                  <Link to="/wishlist">Yêu thích</Link>
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

          <button
            type="button"
            className="navbar__cart navbar__icon-btn"
            onClick={() => (user ? openCart() : navigate('/login'))}
            aria-label="Giỏ hàng"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 01-8 0"/>
            </svg>
            {count > 0 && <span className="navbar__cart-badge">{count}</span>}
          </button>
        </div>
      </div>

      {/* Search panel */}
      <div className={`navbar__search${searchOpen ? ' open' : ''}`}>
        <form className="navbar__search-form container" onSubmit={handleSearchSubmit}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Bạn đang tìm gì? (áo sơ mi, quần jeans...)"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <button type="submit" className="btn btn-primary btn-sm">Tìm kiếm</button>
          <button type="button" className="navbar__search-close" onClick={() => setSearchOpen(false)} aria-label="Đóng">✕</button>
        </form>

        {/* Gợi ý tức thì */}
        {searchOpen && searchTerm.trim().length >= 2 && (
          <div className="navbar__search-results">
            <div className="container">
              {sugLoading && suggestions.length === 0 ? (
                <div className="navbar__suggestion-empty">Đang tìm…</div>
              ) : suggestions.length === 0 ? (
                <div className="navbar__suggestion-empty">Không tìm thấy sản phẩm phù hợp</div>
              ) : (
                <>
                  {suggestions.map(p => (
                    <Link
                      key={p.id}
                      to={`/products/${p.id}`}
                      className="navbar__suggestion"
                      onClick={handleSelectSuggestion}
                    >
                      <img
                        src={p.imageUrl}
                        alt={p.name}
                        onError={e => { e.target.src = 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=120'; }}
                      />
                      <div className="navbar__suggestion-info">
                        <span className="navbar__suggestion-name">{p.name}</span>
                        <span className="navbar__suggestion-cat">{p.category?.name}</span>
                      </div>
                      <span className="navbar__suggestion-price">{formatPrice(effectivePrice(p))}</span>
                    </Link>
                  ))}
                  <button type="button" className="navbar__suggestion-all" onClick={handleSearchSubmit}>
                    Xem tất cả kết quả cho “{searchTerm.trim()}”
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Mobile Menu */}
      <div className={`navbar__mobile-menu${menuOpen ? ' open' : ''}`}>
        <form className="navbar__mobile-search" onSubmit={handleSearchSubmit}>
          <input
            type="text"
            placeholder="Tìm sản phẩm..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <button type="submit" aria-label="Tìm kiếm">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </button>
        </form>
        <NavLink to="/products">Bộ sưu tập</NavLink>
        <NavLink to="/products?category=ao-thun">Áo</NavLink>
        <NavLink to="/products?category=quan-jeans">Quần</NavLink>
        <NavLink to="/products?category=phu-kien">Phụ kiện</NavLink>
        <NavLink to="/blog">Blog</NavLink>
        <NavLink to="/wishlist">Yêu thích{wishlistCount > 0 ? ` (${wishlistCount})` : ''}</NavLink>
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
