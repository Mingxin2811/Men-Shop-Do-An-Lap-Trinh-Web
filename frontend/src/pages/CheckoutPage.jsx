import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { orderService } from '../services/order.service';
import { paymentService } from '../services/payment.service';
import { couponService } from '../services/coupon.service';
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

  // Mã giảm giá
  const [couponInput, setCouponInput] = useState('');
  const [coupon, setCoupon] = useState(null); // { code, discountAmount, finalTotal }
  const [couponError, setCouponError] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  const discount = coupon?.discountAmount || 0;
  const finalTotal = Math.max(0, total - discount);

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleApplyCoupon = async () => {
    const code = couponInput.trim();
    if (!code) return;
    setCouponError('');
    setApplyingCoupon(true);
    try {
      const res = await couponService.validate(code);
      setCoupon(res.data.data);
    } catch (e) {
      setCoupon(null);
      setCouponError(e.response?.data?.message || 'Mã giảm giá không hợp lệ.');
    } finally {
      setApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCoupon(null);
    setCouponInput('');
    setCouponError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.shippingName || !form.shippingPhone || !form.shippingAddress) {
      setError('Vui lòng điền đầy đủ thông tin giao hàng.'); return;
    }
    try {
      setLoading(true);
      const res = await orderService.createOrder({
        ...form,
        couponCode: coupon?.code,
      });
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

          {/* Mã giảm giá */}
          <div className="checkout-coupon">
            {coupon ? (
              <div className="checkout-coupon__applied">
                <span>
                  Đã áp dụng mã <strong>{coupon.code}</strong>
                </span>
                <button type="button" onClick={handleRemoveCoupon} className="checkout-coupon__remove">
                  Gỡ
                </button>
              </div>
            ) : (
              <div className="checkout-coupon__input">
                <input
                  type="text"
                  className="form-input"
                  placeholder="Nhập mã giảm giá"
                  value={couponInput}
                  onChange={e => setCouponInput(e.target.value.toUpperCase())}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleApplyCoupon(); } }}
                />
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={handleApplyCoupon}
                  disabled={applyingCoupon || !couponInput.trim()}
                >
                  {applyingCoupon ? <span className="spinner" /> : 'Áp dụng'}
                </button>
              </div>
            )}
            {couponError && <p className="checkout-coupon__error">{couponError}</p>}
          </div>

          <div className="checkout-summary__rows">
            <div className="checkout-summary__row">
              <span>Tạm tính</span>
              <span>{formatPrice(total)}</span>
            </div>
            {discount > 0 && (
              <div className="checkout-summary__row">
                <span>Giảm giá {coupon?.code ? `(${coupon.code})` : ''}</span>
                <span style={{ color: '#16a34a' }}>−{formatPrice(discount)}</span>
              </div>
            )}
            <div className="checkout-summary__row">
              <span>Vận chuyển</span>
              <span style={{ color: '#16a34a' }}>Miễn phí</span>
            </div>
          </div>

          <div className="checkout-summary__total">
            <span>Tổng cộng</span>
            <span>{formatPrice(finalTotal)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
