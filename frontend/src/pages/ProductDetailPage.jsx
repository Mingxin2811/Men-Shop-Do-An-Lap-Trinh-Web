import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { productService } from '../services/product.service';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useRecentlyViewed } from '../contexts/RecentlyViewedContext';
import { formatProductColor, normalizeProductColor } from '../utils/productOptions';
import { getSaleInfo } from '../utils/price';
import WishlistButton from '../components/product/WishlistButton';
import SizeGuideModal from '../components/product/SizeGuideModal';
import RecentlyViewedSection from '../components/product/RecentlyViewedSection';
import './ProductDetailPage.css';

const formatPrice = (p) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);

export default function ProductDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const toast = useToast();
  const { track } = useRecentlyViewed();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [activeImage, setActiveImage] = useState('');

  useEffect(() => {
    setLoading(true);
    productService.getProduct(id)
      .then(res => {
        const source = res.data.data;
        const p = {
          ...source,
          variants: source.variants?.map(variant => ({
            ...variant,
            color: normalizeProductColor(variant.color),
          })) || [],
        };
        setProduct(p);
        setActiveImage(p.imageUrl);
        track(p.id);
        setSelectedSize('');
        setSelectedColor('');
        setSelectedVariant(null);
        setQuantity(1);
        // get related
        productService.getProducts({ category: p.category?.slug, limit: 4 })
          .then(r => setRelatedProducts(r.data.data.products.filter(x => x.id !== id)));
      })
      .catch(() => navigate('/products'))
      .finally(() => setLoading(false));
  }, [id, navigate, track]);

  useEffect(() => {
    if (!product) return;
    if (selectedSize && selectedColor) {
      const v = product.variants?.find(
        v => v.size === selectedSize && v.color === selectedColor
      );
      setSelectedVariant(v || null);
    } else {
      setSelectedVariant(null);
    }
  }, [selectedSize, selectedColor, product]);

  const sizes = [...new Set(product?.variants?.map(v => v.size) || [])];
  const colors = [...new Set(product?.variants?.filter(v => !selectedSize || v.size === selectedSize).map(v => v.color) || [])];
  const gallery = product
    ? [...new Set([product.imageUrl, ...(product.images?.map(img => img.url) || [])].filter(Boolean))]
    : [];
  const mainImage = activeImage || product?.imageUrl;

  const availableStock = selectedVariant
    ? selectedVariant.stock
    : product?.stock || 0;

  const handleAddToCart = async () => {
    if (!user) { navigate('/login'); return; }
    if (product.variants?.length > 0 && !selectedVariant) {
      setError('Vui lòng chọn size và màu sắc.'); return;
    }
    try {
      setAdding(true);
      setError('');
      await addToCart(product.id, quantity, selectedVariant?.id || null);
      setSuccess('Đã thêm vào giỏ hàng!');
      toast.success('Đã thêm vào giỏ hàng');
      setTimeout(() => setSuccess(''), 3000);
    } catch (e) {
      const msg = e.response?.data?.message || 'Có lỗi xảy ra.';
      setError(msg);
      toast.error(msg);
    } finally { setAdding(false); }
  };

  if (loading) return <div className="loading-center"><div className="spinner spinner-lg" /></div>;
  if (!product) return null;

  return (
    <div className="pdp">
      {/* Breadcrumb */}
      <div className="pdp-breadcrumb container">
        <Link to="/">Trang chủ</Link>
        <span>→</span>
        <Link to="/products">Sản phẩm</Link>
        <span>→</span>
        <Link to={`/products?category=${product.category?.slug}`}>{product.category?.name}</Link>
        <span>→</span>
        <span>{product.name}</span>
      </div>

      <div className="pdp-body container">
        {/* Image gallery */}
        <div className="pdp-gallery">
          <div className="pdp-gallery__main">
            <img
              src={mainImage}
              alt={product.name}
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800';
              }}
            />
          </div>
          {gallery.length > 1 && (
            <div className="pdp-gallery__thumbs">
              {gallery.map((url) => (
                <button
                  key={url}
                  type="button"
                  className={`pdp-thumb${mainImage === url ? ' active' : ''}`}
                  onClick={() => setActiveImage(url)}
                  aria-label="Xem ảnh"
                >
                  <img
                    src={url}
                    alt=""
                    loading="lazy"
                    onError={(e) => { e.currentTarget.parentElement.style.display = 'none'; }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="pdp-info">
          <p className="pdp-category">{product.category?.name}</p>
          <h1 className="pdp-title">{product.name}</h1>
          {(() => {
            const sale = getSaleInfo(product);
            return sale.onSale ? (
              <div className="pdp-price-row">
                <span className="pdp-price pdp-price--sale">{formatPrice(sale.effectivePrice)}</span>
                <span className="pdp-price-old">{formatPrice(sale.originalPrice)}</span>
                <span className="pdp-discount-badge">-{sale.discountPercent}%</span>
              </div>
            ) : (
              <p className="pdp-price">{formatPrice(sale.effectivePrice)}</p>
            );
          })()}

          <div className="pdp-divider" />

          {/* Variants */}
          {sizes.length > 0 && (
            <div className="pdp-option">
              <div className="pdp-option__header">
                <span>Size{selectedSize && <span className="pdp-option__selected"> — {selectedSize}</span>}</span>
                <button type="button" className="pdp-size-guide" onClick={() => setSizeGuideOpen(true)}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M3 7h18M3 12h18M3 17h18" /><path d="M7 5v4M12 5v6M17 5v4" />
                  </svg>
                  Hướng dẫn chọn size
                </button>
              </div>
              <div className="pdp-size-grid">
                {sizes.map(s => (
                  <button
                    key={s}
                    className={`pdp-size-btn${selectedSize === s ? ' active' : ''}`}
                    onClick={() => { setSelectedSize(s); setSelectedColor(''); setSelectedVariant(null); }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {colors.length > 0 && (
            <div className="pdp-option">
              <div className="pdp-option__header">
                <span>Màu sắc</span>
                {selectedColor && <span className="pdp-option__selected">{selectedColor}</span>}
              </div>
              <div className="pdp-color-grid">
                {colors.map(c => (
                  <button
                    key={c}
                    className={`pdp-color-btn${selectedColor === c ? ' active' : ''}`}
                    onClick={() => setSelectedColor(c)}
                  >
                    {formatProductColor(c)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="pdp-option">
            <div className="pdp-option__header">
              <span>Số lượng</span>
              <span className="pdp-stock">
                {availableStock > 0
                  ? `Còn ${availableStock} sản phẩm`
                  : <span style={{ color: 'var(--red)' }}>Hết hàng</span>
                }
              </span>
            </div>
            <div className="pdp-quantity">
              <button
                className="pdp-qty-btn"
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                disabled={quantity <= 1}
              >−</button>
              <span className="pdp-qty-value">{quantity}</span>
              <button
                className="pdp-qty-btn"
                onClick={() => setQuantity(q => Math.min(availableStock, q + 1))}
                disabled={quantity >= availableStock}
              >+</button>
            </div>
          </div>

          {/* Messages */}
          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          {/* Actions */}
          <div className="pdp-actions">
            <button
              className="btn btn-primary btn-lg"
              style={{ flex: 1 }}
              onClick={handleAddToCart}
              disabled={adding || availableStock === 0}
            >
              {adding ? <span className="spinner" /> : availableStock === 0 ? 'Hết hàng' : 'Thêm vào giỏ hàng'}
            </button>
            <WishlistButton productId={product.id} className="wishlist-btn--outline" size={22} />
            <Link to="/cart" className="btn btn-outline btn-lg">Giỏ hàng</Link>
          </div>

          {/* Description */}
          <div className="pdp-divider" />
          <div className="pdp-description">
            <h6>Mô tả sản phẩm</h6>
            <p>{product.description}</p>
          </div>
        </div>
      </div>

      {/* Related */}
      {relatedProducts.length > 0 && (
        <section className="pdp-related container">
          <h2 className="pdp-related__title">Sản phẩm liên quan</h2>
          <div className="product-grid">
            {relatedProducts.slice(0, 4).map(p => (
              <Link key={p.id} to={`/products/${p.id}`} className="product-card" onClick={() => window.scrollTo(0, 0)}>
                <div className="product-card__image-wrap">
                  <img src={p.imageUrl} alt={p.name} className="product-card__image"
                    onError={e => e.target.src = 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600'} />
                </div>
                <div className="product-card__info">
                  <p className="product-card__category">{p.category?.name}</p>
                  <h3 className="product-card__name">{p.name}</h3>
                  <p className="product-card__price">{formatPrice(p.price)}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Sản phẩm vừa xem */}
      <RecentlyViewedSection excludeId={product.id} />

      {/* Modal bảng size */}
      <SizeGuideModal open={sizeGuideOpen} onClose={() => setSizeGuideOpen(false)} />
    </div>
  );
}
