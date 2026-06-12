import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { orderService } from '../services/order.service';
import { paymentService } from '../services/payment.service';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { formatProductColor } from '../utils/productOptions';
import './CheckoutPage.css';

const formatPrice = (p) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);

export default function CheckoutPage() {
  const { items, total, fetchCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    shippingName: user?.name || '',
    shippingPhone: user?.phone || '',
    shippingAddress: user?.address || '',
    paymentMethod: 'COD',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.shippingName || !form.shippingPhone || !form.shippingAddress) {
      setError('Vui lòng điền đầy đủ thông tin giao hàng.'); return;
    }
    try {
      setLoading(true);
      const res = await orderService.createOrder(form);
      const order = res.data.data;

      if (form.paymentMethod === 'STRIPE') {
        const payRes = await paymentService.createCheckoutSession(order.id);
        window.location.href = payRes.data.data.checkoutUrl;
      } else {
        await fetchCart();
        navigate(`/orders/${order.id}?success=true`);
      }
    } catch (e) {
      setError(e.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
    } finally { setLoading(false); }
  };

  if (items.length === 0) {
    return (
      <div className="checkout-empty container">
        <p>Giỏ hàng trống. <Link to="/products">Mua sắm ngay</Link></p>
      </div>
    );
  }

  return (
    <div className="checkout-page container">
      <h1>Thanh toán</h1>

      <div className="checkout-layout">
        {/* Form */}
        <form className="checkout-form" onSubmit={handleSubmit}>
          <div className="checkout-section">
            <h3>Thông tin giao hàng</h3>

            <div className="form-group">
              <label className="form-label">Họ và tên *</label>
              <input
                type="text"
                className="form-input"
                name="shippingName"
                value={form.shippingName}
                onChange={handleChange}
                placeholder="Nguyễn Văn A"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Số điện thoại *</label>
              <input
                type="tel"
                className="form-input"
                name="shippingPhone"
                value={form.shippingPhone}
                onChange={handleChange}
                placeholder="0901 234 567"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Địa chỉ giao hàng *</label>
              <textarea
                className="form-input"
                name="shippingAddress"
                value={form.shippingAddress}
                onChange={handleChange}
                placeholder="Số nhà, đường, phường, quận, tỉnh/thành phố"
                rows={3}
                required
              />
            </div>
          </div>

          <div className="checkout-section">
            <h3>Phương thức thanh toán</h3>
            <div className="payment-options">
              {[
                { value: 'COD', label: 'Thanh toán khi nhận hàng', desc: 'Trả tiền mặt khi nhận hàng', icon: '💵' },
                { value: 'STRIPE', label: 'Thanh toán online', desc: 'Thẻ tín dụng / Debit (Test mode)', icon: '💳' },
              ].map(opt => (
                <label key={opt.value} className={`payment-option${form.paymentMethod === opt.value ? ' active' : ''}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={opt.value}
                    checked={form.paymentMethod === opt.value}
                    onChange={handleChange}
                  />
                  <span className="payment-option__icon">{opt.icon}</span>
                  <div>
                    <div className="payment-option__label">{opt.label}</div>
                    <div className="payment-option__desc">{opt.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <button
            type="submit"
            className="btn btn-primary btn-lg w-full"
            disabled={loading}
          >
            {loading ? <span className="spinner" /> : form.paymentMethod === 'STRIPE' ? 'Thanh toán online →' : 'Đặt hàng'}
          </button>
        </form>

        {/* Order summary */}
        <div className="checkout-summary">
          <h3>Đơn hàng của bạn</h3>
          <div className="checkout-items">
            {items.map(item => (
              <div key={item.id} className="checkout-item">
                <img
                  src={item.product?.imageUrl}
                  alt={item.product?.name}
                  onError={e => e.target.src = 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=100'}
                />
                <div className="checkout-item__info">
                  <p>{item.product?.name}</p>
                  {item.variant && (
                    <p className="checkout-item__variant">
                      {item.variant.size} · {formatProductColor(item.variant.color)}
                    </p>
                  )}
                  <p className="checkout-item__qty">× {item.quantity}</p>
                </div>
                <p className="checkout-item__price">{formatPrice(item.subtotal)}</p>
              </div>
            ))}
          </div>

          <div className="checkout-summary__rows">
            <div className="checkout-summary__row">
              <span>Tạm tính</span>
              <span>{formatPrice(total)}</span>
            </div>
            <div className="checkout-summary__row">
              <span>Vận chuyển</span>
              <span style={{ color: '#16a34a' }}>Miễn phí</span>
            </div>
          </div>

          <div className="checkout-summary__total">
            <span>Tổng cộng</span>
            <span>{formatPrice(total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
