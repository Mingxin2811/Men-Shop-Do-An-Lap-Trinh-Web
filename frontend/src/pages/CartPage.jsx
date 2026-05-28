import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import './CartPage.css';

const formatPrice = (p) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);

export default function CartPage() {
  const { items, total, loading, updateItem, removeItem, clearCart } = useCart();
  const navigate = useNavigate();

  if (loading) return <div className="loading-center"><div className="spinner spinner-lg" /></div>;

  if (items.length === 0) {
    return (
      <div className="cart-empty container">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
          <line x1="3" y1="6" x2="21" y2="6"/>
          <path d="M16 10a4 4 0 01-8 0"/>
        </svg>
        <h2>Giỏ hàng trống</h2>
        <p>Hãy khám phá bộ sưu tập và thêm sản phẩm bạn yêu thích.</p>
        <Link to="/products" className="btn btn-primary btn-lg mt-lg">
          Mua sắm ngay
        </Link>
      </div>
    );
  }

  return (
    <div className="cart-page container">
      <div className="cart-header">
        <h1>Giỏ hàng</h1>
        <span>{items.reduce((s, i) => s + i.quantity, 0)} sản phẩm</span>
      </div>

      <div className="cart-layout">
        {/* Items */}
        <div className="cart-items">
          <div className="cart-items__header">
            <span>Sản phẩm</span>
            <span>Số lượng</span>
            <span>Tổng</span>
          </div>

          {items.map(item => (
            <div key={item.id} className="cart-item">
              <div className="cart-item__product">
                <Link to={`/products/${item.productId}`}>
                  <img
                    src={item.product?.imageUrl}
                    alt={item.product?.name}
                    onError={e => e.target.src = 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200'}
                  />
                </Link>
                <div className="cart-item__info">
                  <p className="cart-item__category">{item.product?.category?.name}</p>
                  <Link to={`/products/${item.productId}`} className="cart-item__name">
                    {item.product?.name}
                  </Link>
                  {item.variant && (
                    <p className="cart-item__variant">
                      {item.variant.size} · {item.variant.color}
                    </p>
                  )}
                  <p className="cart-item__price">{formatPrice(item.product?.price)}</p>
                </div>
              </div>

              <div className="cart-item__qty">
                <div className="pdp-quantity">
                  <button
                    className="pdp-qty-btn"
                    onClick={() => item.quantity > 1 ? updateItem(item.id, item.quantity - 1) : removeItem(item.id)}
                  >−</button>
                  <span className="pdp-qty-value">{item.quantity}</span>
                  <button
                    className="pdp-qty-btn"
                    onClick={() => updateItem(item.id, item.quantity + 1)}
                  >+</button>
                </div>
                <button className="cart-item__remove" onClick={() => removeItem(item.id)}>
                  Xóa
                </button>
              </div>

              <div className="cart-item__subtotal">
                {formatPrice(item.subtotal)}
              </div>
            </div>
          ))}

          <div className="cart-actions">
            <Link to="/products" className="btn btn-ghost">← Tiếp tục mua sắm</Link>
            <button className="btn btn-ghost" onClick={clearCart}>Xóa giỏ hàng</button>
          </div>
        </div>

        {/* Summary */}
        <div className="cart-summary">
          <h3>Tóm tắt đơn hàng</h3>

          <div className="cart-summary__rows">
            <div className="cart-summary__row">
              <span>Tạm tính</span>
              <span>{formatPrice(total)}</span>
            </div>
            <div className="cart-summary__row">
              <span>Phí vận chuyển</span>
              <span className="cart-summary__free">Miễn phí</span>
            </div>
          </div>

          <div className="cart-summary__total">
            <span>Tổng cộng</span>
            <span>{formatPrice(total)}</span>
          </div>

          <button
            className="btn btn-primary w-full btn-lg mt-lg"
            onClick={() => navigate('/checkout')}
          >
            Tiến hành thanh toán
          </button>

          <p className="cart-summary__note">
            Miễn phí vận chuyển toàn quốc.<br />
            Đổi trả trong vòng 30 ngày.
          </p>
        </div>
      </div>
    </div>
  );
}
