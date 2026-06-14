import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useToast } from '../../contexts/ToastContext';
import { formatProductColor } from '../../utils/productOptions';
import './CartDrawer.css';

const formatPrice = (p) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200';

export default function CartDrawer() {
  const { items, total, count, isOpen, closeCart, updateItem, removeItem } = useCart();
  const toast = useToast();

  // Đóng bằng phím ESC + khóa cuộn nền khi mở.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => { if (e.key === 'Escape') closeCart(); };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, closeCart]);

  const changeQty = async (item, delta) => {
    const next = item.quantity + delta;
    if (next < 1) return;
    try {
      await updateItem(item.id, next);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Không thể cập nhật số lượng');
    }
  };

  return (
    <>
      <div
        className={`cart-drawer__overlay${isOpen ? ' open' : ''}`}
        onClick={closeCart}
        aria-hidden={!isOpen}
      />
      <aside className={`cart-drawer${isOpen ? ' open' : ''}`} aria-label="Giỏ hàng" aria-hidden={!isOpen}>
        <div className="cart-drawer__header">
          <h3>Giỏ hàng{count > 0 ? ` (${count})` : ''}</h3>
          <button className="cart-drawer__close" onClick={closeCart} aria-label="Đóng">✕</button>
        </div>

        {items.length === 0 ? (
          <div className="cart-drawer__empty">
            <p>Giỏ hàng của bạn đang trống.</p>
            <Link to="/products" className="btn btn-primary" onClick={closeCart}>Mua sắm ngay</Link>
          </div>
        ) : (
          <>
            <div className="cart-drawer__items">
              {items.map(item => (
                <div key={item.id} className="cart-drawer__item">
                  <img
                    src={item.product?.imageUrl || FALLBACK_IMG}
                    alt={item.product?.name}
                    onError={e => { e.target.src = FALLBACK_IMG; }}
                  />
                  <div className="cart-drawer__item-info">
                    <Link to={`/products/${item.productId}`} className="cart-drawer__item-name" onClick={closeCart}>
                      {item.product?.name}
                    </Link>
                    {item.variant && (
                      <p className="cart-drawer__item-variant">
                        {item.variant.size} · {formatProductColor(item.variant.color)}
                      </p>
                    )}
                    <div className="cart-drawer__item-bottom">
                      <div className="cart-drawer__qty">
                        <button onClick={() => changeQty(item, -1)} disabled={item.quantity <= 1} aria-label="Giảm">−</button>
                        <span>{item.quantity}</span>
                        <button onClick={() => changeQty(item, 1)} aria-label="Tăng">+</button>
                      </div>
                      <span className="cart-drawer__item-price">{formatPrice(item.subtotal)}</span>
                    </div>
                  </div>
                  <button className="cart-drawer__remove" onClick={() => removeItem(item.id)} aria-label="Xóa">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m2 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>

            <div className="cart-drawer__footer">
              <div className="cart-drawer__total">
                <span>Tạm tính</span>
                <strong>{formatPrice(total)}</strong>
              </div>
              <Link to="/checkout" className="btn btn-primary w-full" onClick={closeCart}>Thanh toán</Link>
              <Link to="/cart" className="btn btn-outline w-full" onClick={closeCart}>Xem giỏ hàng</Link>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
