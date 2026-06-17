import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';
import { productService } from '../../services/product.service';
import './Navbar.css';

const AVATAR_PRESETS = {
  cat: { emoji: '🐱', background: '#f8d9a0' },
  dog: { emoji: '🐶', background: '#d9c1a5' },
  fox: { emoji: '🦊', background: '#f4b27a' },
  panda: { emoji: '🐼', background: '#d9e2e5' },
  bear: { emoji: '🐻', background: '#d8b18a' },
  lion: { emoji: '🦁', background: '#f1ca72' },
};

const formatPrice = (price) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

const effectivePrice = (product) =>
  Number(product.salePrice) > 0 && Number(product.salePrice) < Number(product.price)
    ? product.salePrice
    : product.price;

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

  useEffect(() => {
    const term = searchTerm.trim();
    if (!searchOpen || term.length < 2) {
      setSuggestions([]);
      setSugLoading(false);
      return undefined;
    }

    setSugLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await productService.getProducts({ search: term, limit: 5 });
        setSuggestions(res.data.data.products || []);
      } catch {
        setSuggestions([]);
      } finally {
        setSugLoading(false);
      }
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

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    const term = searchTerm.trim();
    if (!term) return;
    setSearchOpen(false);
    setSearchTerm('');
    setSuggestions([]);
    navigate(`/products?search=${encodeURIComponent(term)}`);
  };

  const handleSuggestedSearch = (term) => {
    setSearchOpen(false);
    setSearchTerm('');
    setSuggestions([]);
    navigate(`/products?search=${encodeURIComponent(term)}`);
  };

  const handleCartClick = () => {
    if (user) openCart();
    else navigate('/login');
  };

  return (
    <nav className={`navbar navbar--solid${scrolled ? ' navbar--scrolled' : ''}${searchOpen ? ' navbar--searching' : ''}${menuOpen ? ' navbar--open' : ''}`}>
      <div className="navbar__inner container">
        <button
          className={`navbar__hamburger${menuOpen ? ' active' : ''}`}
          onClick={() => {
            setMenuOpen((open) => !open);
            setSearchOpen(false);
          }}
          aria-label="Menu"
        >
          <span /><span /><span />
        </button>

        <Link to="/" className="navbar__logo">
          <span className="navbar__logo-main">MEN'S</span>
          <span className="navbar__logo-sub">SHOP</span>
        </Link>

        <ul className="navbar__links">
          <li><NavLink to="/products">Bộ sưu tập</NavLink></li>
          <li><NavLink to="/products?category=ao-thun">Áo</NavLink></li>
          <li><NavLink to="/products?category=quan-jeans">Quần</NavLink></li>
          <li><NavLink to="/products?category=phu-kien">Phụ kiện</NavLink></li>
          <li><NavLink to="/blog">Blogs</NavLink></li>
        </ul>

        <div className="navbar__actions">
          <button
            className={`navbar__action-btn${searchOpen ? ' active' : ''}`}
            onClick={() => {
              setSearchOpen((open) => !open);
              setMenuOpen(false);
            }}
            aria-label="Tìm kiếm sản phẩm"
            aria-expanded={searchOpen}
            data-tooltip="Tìm kiếm sản phẩm"
          >
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </button>

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

          <button
            type="button"
            className="navbar__action-btn navbar__cart"
            onClick={handleCartClick}
            aria-label="Giỏ hàng"
            data-tooltip={count > 0 ? `Giỏ hàng: ${count} sản phẩm` : 'Giỏ hàng đang trống'}
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
                  onChange={(event) => setSearchTerm(event.target.value)}
                />
                <button type="submit" className="navbar__search-submit">Tìm kiếm</button>
              </form>
              <button type="button" className="navbar__search-close" onClick={() => setSearchOpen(false)} aria-label="Đóng">×</button>
            </div>

            {searchTerm.trim().length < 2 ? (
              <div className="navbar__search-suggestions">
                <span>Gợi ý:</span>
                {['Áo sơ mi', 'Áo khoác', 'Quần jeans', 'Phụ kiện'].map((term) => (
                  <button key={term} type="button" onClick={() => handleSuggestedSearch(term)}>
                    {term}
                  </button>
                ))}
              </div>
            ) : (
              <div className="navbar__search-results">
                {sugLoading && suggestions.length === 0 ? (
                  <div className="navbar__suggestion-empty">Đang tìm...</div>
                ) : suggestions.length === 0 ? (
                  <div className="navbar__suggestion-empty">Không tìm thấy sản phẩm phù hợp</div>
                ) : (
                  <>
                    {suggestions.map((product) => (
                      <Link
                        key={product.id}
                        to={`/products/${product.id}`}
                        className="navbar__suggestion"
                        onClick={handleSelectSuggestion}
                      >
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          onError={(event) => {
                            event.target.src = 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=120';
                          }}
                        />
                        <div className="navbar__suggestion-info">
                          <span className="navbar__suggestion-name">{product.name}</span>
                          <span className="navbar__suggestion-cat">{product.category?.name}</span>
                        </div>
                        <span className="navbar__suggestion-price">{formatPrice(effectivePrice(product))}</span>
                      </Link>
                    ))}
                    <button type="button" className="navbar__suggestion-all" onClick={handleSearchSubmit}>
                      Xem tất cả kết quả cho "{searchTerm.trim()}"
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className={`navbar__mobile-menu${menuOpen ? ' open' : ''}`}>
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
