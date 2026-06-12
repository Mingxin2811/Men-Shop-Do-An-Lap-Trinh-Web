import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { useNavigate } from 'react-router-dom';
import WishlistButton from './WishlistButton';
import StarRating from './StarRating';
import { formatPrice, getSaleInfo } from '../../utils/price';
import './ProductCard.css';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const sale = getSaleInfo(product);

  const handleQuickAdd = async (e) => {
    e.preventDefault();
    if (!user) { navigate('/login'); return; }
    if (product.variants?.length > 0) {
      navigate(`/products/${product.id}`);
      return;
    }
    try {
      setAdding(true);
      await addToCart(product.id, 1, null);
      setAdded(true);
      toast.success('Đã thêm vào giỏ hàng');
      setTimeout(() => setAdded(false), 2000);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không thể thêm vào giỏ hàng');
    }
    finally { setAdding(false); }
  };

  return (
    <Link to={`/products/${product.id}`} className="product-card">
      <div className="product-card__image-wrap">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="product-card__image"
          loading="lazy"
          onError={(e) => {
            e.target.src = `https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&auto=format`;
          }}
        />
        <WishlistButton productId={product.id} className="wishlist-btn--floating" size={18} />
        <div className="product-card__overlay">
          <button
            className={`product-card__quick-add${added ? ' added' : ''}`}
            onClick={handleQuickAdd}
            disabled={adding}
          >
            {product.variants?.length > 0
              ? 'Chọn size và màu'
              : adding ? '...' : added ? 'Đã thêm ✓' : 'Thêm vào giỏ'}
          </button>
        </div>
        <div className="product-card__tags">
          {sale.onSale && (
            <span className="product-card__tag product-card__tag--sale">-{sale.discountPercent}%</span>
          )}
          {product.stock < 5 && product.stock > 0 && (
            <span className="product-card__tag">Sắp hết</span>
          )}
          {product.stock === 0 && (
            <span className="product-card__tag product-card__tag--sold">Hết hàng</span>
          )}
        </div>
      </div>

      <div className="product-card__info">
        <p className="product-card__category">{product.category?.name}</p>
        <h3 className="product-card__name">{product.name}</h3>
        {product.reviewCount > 0 && (
          <div className="product-card__rating">
            <StarRating value={product.averageRating} size={13} />
            <span>({product.reviewCount})</span>
          </div>
        )}
        {sale.onSale ? (
          <p className="product-card__price">
            <span className="product-card__price-sale">{formatPrice(sale.effectivePrice)}</span>
            <span className="product-card__price-old">{formatPrice(sale.originalPrice)}</span>
          </p>
        ) : (
          <p className="product-card__price">{formatPrice(sale.effectivePrice)}</p>
        )}
      </div>
    </Link>
  );
}
