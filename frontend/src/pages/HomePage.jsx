import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productService, categoryService } from '../services/product.service';
import ProductCard from '../components/product/ProductCard';
import './HomePage.css';

const formatPrice = (p) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);

export default function HomePage() {
  const [newProducts, setNewProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      productService.getProducts({ limit: 8, sort: 'newest' }),
      categoryService.getCategories(),
    ]).then(([prodRes, catRes]) => {
      setNewProducts(prodRes.data.data.products || []);
      setCategories(catRes.data.data || []);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div className="home">
      {/* Hero */}
      <section className="hero">
        <div className="hero__bg">
          <img
            src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1800&auto=format"
            alt="Hero"
          />
          <div className="hero__overlay" />
        </div>
        <div className="hero__content container">
          <div className="hero__text animate-fadeUp">
            <p className="hero__eyebrow">Bộ sưu tập 2025</p>
            <h1 className="hero__title">
              Định nghĩa<br />phong cách<br />của bạn
            </h1>
            <p className="hero__sub">Thời trang nam tinh tế — Chất lượng cao cấp</p>
            <div className="hero__actions">
              <Link to="/products" className="btn btn-primary btn-lg">
                Khám phá ngay
              </Link>
              <Link to="/products?sort=newest" className="btn btn-outline btn-lg hero__btn-outline">
                Hàng mới về
              </Link>
            </div>
          </div>
          <div className="hero__scroll">
            <span>Cuộn xuống</span>
            <div className="hero__scroll-line" />
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="section container">
        <div className="section__header">
          <p className="section__label">Danh mục</p>
          <h2 className="section__title">Tìm kiếm theo phong cách</h2>
        </div>
        <div className="category-grid">
          {categories.slice(0, 6).map((cat, i) => (
            <Link key={cat.id} to={`/products?category=${cat.slug}`} className="category-card">
              <div className="category-card__image">
                <img
                  src={getCategoryImage(cat.slug, i)}
                  alt={cat.name}
                  loading="lazy"
                />
                <div className="category-card__overlay" />
              </div>
              <div className="category-card__info">
                <h3>{cat.name}</h3>
                {cat._count && <span>{cat._count.products} sản phẩm</span>}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Feature Banner */}
      <section className="feature-banner">
        <div className="feature-banner__left">
          <img
            src="https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=900&auto=format"
            alt="Feature"
          />
        </div>
        <div className="feature-banner__right">
          <div className="feature-banner__content">
            <p className="section__label">Phong cách công sở</p>
            <h2>Ăn mặc đẳng<br />cấp mỗi ngày</h2>
            <p>Bộ sưu tập sơ mi và quần tây cao cấp dành cho người đàn ông hiện đại, tự tin trong mọi hoàn cảnh.</p>
            <Link to="/products?category=ao-so-mi" className="btn btn-primary mt-lg">
              Xem bộ sưu tập
            </Link>
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="section container">
        <div className="section__header">
          <p className="section__label">Hàng mới về</p>
          <h2 className="section__title">Sản phẩm mới nhất</h2>
          <Link to="/products?sort=newest" className="section__link">
            Xem tất cả →
          </Link>
        </div>
        {loading ? (
          <div className="loading-center"><div className="spinner spinner-lg" /></div>
        ) : (
          <div className="product-grid">
            {newProducts.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </section>

      {/* Brand values */}
      <section className="values-section container">
        <div className="values-grid">
          {[
            { icon: '✦', title: 'Chất lượng cao cấp', desc: 'Được tuyển chọn từ những nhà sản xuất uy tín nhất' },
            { icon: '◎', title: 'Thiết kế tinh tế', desc: 'Kết hợp giữa phong cách hiện đại và cổ điển' },
            { icon: '→', title: 'Giao hàng nhanh', desc: 'Giao hàng toàn quốc trong vòng 2-5 ngày làm việc' },
            { icon: '↺', title: 'Đổi trả dễ dàng', desc: 'Hỗ trợ đổi trả trong vòng 30 ngày' },
          ].map(v => (
            <div key={v.title} className="value-item">
              <div className="value-item__icon">{v.icon}</div>
              <h4 className="value-item__title">{v.title}</h4>
              <p className="value-item__desc">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom banner */}
      <section className="bottom-banner">
        <img
          src="https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=1600&auto=format"
          alt="Men fashion"
        />
        <div className="bottom-banner__content">
          <p className="section__label" style={{ color: 'rgba(255,255,255,0.6)' }}>Phụ kiện</p>
          <h2>Hoàn thiện phong<br />cách của bạn</h2>
          <Link to="/products?category=phu-kien" className="btn btn-outline btn-lg" style={{ borderColor: '#fff', color: '#fff' }}>
            Khám phá ngay
          </Link>
        </div>
      </section>
    </div>
  );
}

function getCategoryImage(slug, i) {
  const imgs = [
    'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600',
    'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600',
    'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600',
    'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600',
    'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600',
    'https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=600',
  ];
  return imgs[i % imgs.length];
}
