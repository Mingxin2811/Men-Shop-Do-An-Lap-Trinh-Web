import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';
import './Navbar.css';

const AVATAR_PRESETS = {
  cat: { emoji: '🐱', background: '#f8d9a0' },
  dog: { emoji: '🐶', background: '#d9c1a5' },
  fox: { emoji: '🦊', background: '#f4b27a' },
  panda: { emoji: '🐼', background: '#d9e2e5' },
  bear: { emoji: '🐻', background: '#d8b18a' },
  lion: { emoji: '🦁', background: '#f1ca72' },
};

function HeaderAvatar({ user }) {
  if (user.avatar?.startsWith('data:image/')) {
    return <img className="navbar__avatar-image" src={user.avatar} alt="" />;
  }

  const presetId = user.avatar?.replace('preset:', '');
  const preset = AVATAR_PRESETS[presetId];
  if (preset) {
    return (
      <span className="navbar__avatar-preset" style={{ background: preset.background }}>
        {preset.emoji}
      </span>
    );
  }

  return <span className="navbar__avatar-initial">{user.name?.[0]?.toUpperCase() || '?'}</span>;
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const { count: wishlistCount } = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
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

  const handleSuggestedSearch = (term) => {
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
          <li><NavLink to="/blog">Blogs</NavLink></li>
        </ul>

        {/* Actions */}
        <div className="navbar__actions">
          {/* Search */}
          <button
            className={`navbar__action-btn${searchOpen ? ' active' : ''}`}
            onClick={() => setSearchOpen(o => !o)}
            aria-label="Tìm kiếm sản phẩm"
            aria-expanded={searchOpen}
            data-tooltip="Tìm kiếm sản phẩm"
          >
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </button>

          {/* Wishlist */}
          <Link
            to="/wishlist"
            className="navbar__action-btn navbar__wishlist"
            aria-label="Danh sách yêu thích"
            data-tooltip={wishlistCount > 0 ? `Yêu thích: ${wishlistCount} sản phẩm` : 'Danh sách yêu thích'}
          >
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"/>
            </svg>
            {wishlistCount > 0 && <span className="navbar__badge">{wishlistCount}</span>}
          </Link>

          {user ? (
            <div className="navbar__user">
              <button
                type="button"
                className={`navbar__action-btn navbar__avatar-btn${userMenuOpen ? ' active' : ''}`}
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                aria-label={`Tài khoản của ${user.name}`}
                aria-expanded={userMenuOpen}
                data-tooltip={`Tài khoản: ${user.name}`}
              >
                <HeaderAvatar user={user} />
              </button>
              {userMenuOpen && (
                <div className="navbar__dropdown">
                  <div className="navbar__dropdown-user">
                    <div className="navbar__dropdown-avatar">
                      <HeaderAvatar user={user} />
                    </div>
                    <div className="navbar__dropdown-user-info">
                      <strong>{user.name}</strong>
                      <span>{user.email}</span>
                    </div>
                  </div>
                  <Link to="/profile">Tài khoản</Link>
                  <Link to="/orders">Đơn hàng</Link>
                  <Link to="/wishlist">Yêu thích</Link>
                  {user.role === 'ADMIN' && <Link to="/admin">Quản trị</Link>}
                  <button onClick={handleLogout}>Đăng xuất</button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="navbar__action-btn navbar__login"
              aria-label="Đăng nhập"
              data-tooltip="Đăng nhập tài khoản"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
              </svg>
            </Link>
          )}

          <Link
            to="/cart"
            className="navbar__action-btn navbar__cart"
            aria-label="Giỏ hàng"
            data-tooltip={count > 0 ? `Giỏ hàng: ${count} sản phẩm` : 'Giỏ hàng đang trống'}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 01-8 0"/>
            </svg>
            {count > 0 && <span className="navbar__cart-badge">{count}</span>}
          </Link>
        </div>
      </div>

      {/* Search panel */}
      <div className={`navbar__search${searchOpen ? ' open' : ''}`}>
        <div className="navbar__search-inner container">
          <div className="navbar__search-card">
            <div className="navbar__search-main">
              <form className="navbar__search-form" onSubmit={handleSearchSubmit}>
                <svg className="navbar__search-icon" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Bạn đang tìm sản phẩm nào?"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
                <button type="submit" className="navbar__search-submit">Tìm kiếm</button>
              </form>
              <button type="button" className="navbar__search-close" onClick={() => setSearchOpen(false)} aria-label="Đóng">×</button>
            </div>
            <div className="navbar__search-suggestions">
              <span>Gợi ý:</span>
              {['Áo sơ mi', 'Áo khoác', 'Quần jeans', 'Phụ kiện'].map(term => (
                <button key={term} type="button" onClick={() => handleSuggestedSearch(term)}>
                  {term}
                </button>
              ))}
            </div>
          </div>
        </div>
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
        <NavLink to="/blog">Blogs</NavLink>
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
