import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { orderService } from '../services/order.service';
import { paymentService } from '../services/payment.service';
import './PaymentPages.css';

const formatPrice = (value) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0);

const formatCardNumber = (value) =>
  value.replace(/\D/g, '').slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 ');

export function PaymentCheckoutPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const orderId = params.get('orderId');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [card, setCard] = useState({
    number: '4242 4242 4242 4242',
    name: '',
    expiry: '12/30',
    cvc: '123',
  });

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }
    orderService.getOrder(orderId)
      .then((res) => {
        const currentOrder = res.data.data;
        setOrder(currentOrder);
        setCard((current) => ({ ...current, name: currentOrder.shippingName || '' }));
      })
      .catch(() => setError('Không thể tải thông tin giao dịch.'))
      .finally(() => setLoading(false));
  }, [orderId]);

  const handlePay = async (event) => {
    event.preventDefault();
    setError('');
    const digits = card.number.replace(/\D/g, '');
    if (digits.length !== 16) {
      setError('Số thẻ phải gồm 16 chữ số.');
      return;
    }
    if (!card.name.trim() || !/^\d{2}\/\d{2}$/.test(card.expiry) || !/^\d{3,4}$/.test(card.cvc)) {
      setError('Vui lòng kiểm tra tên chủ thẻ, ngày hết hạn và mã bảo mật.');
      return;
    }

    try {
      setProcessing(true);
      await new Promise(resolve => setTimeout(resolve, 900));
      await paymentService.confirmPayment(orderId);
      navigate(`/payment-success?orderId=${orderId}`, { replace: true });
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Giao dịch chưa thể hoàn tất. Vui lòng thử lại.');
    } finally {
      setProcessing(false);
    }
  };

  const handleCancel = async () => {
    try {
      setProcessing(true);
      await paymentService.cancelPayment(orderId);
    } catch {
      // Trang hủy vẫn là điểm đến an toàn nếu phiên thanh toán đã thay đổi trạng thái.
    } finally {
      navigate(`/payment-cancel?orderId=${orderId}`, { replace: true });
    }
  };

  if (loading) return <div className="loading-center"><div className="spinner spinner-lg" /></div>;
  if (!orderId || !order) {
    return (
      <div className="payment-result container">
        <h1>Không tìm thấy giao dịch</h1>
        <Link to="/orders" className="btn btn-primary">Xem đơn hàng</Link>
      </div>
    );
  }

  return (
    <div className="payment-gateway">
      <div className="payment-gateway__shell">
        <header className="payment-gateway__header">
          <div>
            <span className="payment-gateway__eyebrow">Cổng thanh toán bảo mật</span>
            <strong>MEN&apos;S SHOP PAY</strong>
          </div>
          <div className="payment-gateway__secure">
            <span>●</span> SSL Secure
          </div>
        </header>

        <div className="payment-gateway__layout">
          <aside className="payment-gateway__summary">
            <p>Thanh toán cho</p>
            <h2>MEN&apos;S SHOP</h2>
            <div className="payment-gateway__amount">{formatPrice(order.totalAmount)}</div>
            <dl>
              <div><dt>Mã đơn</dt><dd>#{order.id.slice(-8).toUpperCase()}</dd></div>
              <div><dt>Người nhận</dt><dd>{order.shippingName}</dd></div>
              <div><dt>Sản phẩm</dt><dd>{order.items?.length || 0}</dd></div>
            </dl>
            <div className="payment-gateway__notice">
              Đây là môi trường mô phỏng. Không nhập thông tin thẻ thật.
            </div>
          </aside>

          <form className="payment-card-form" onSubmit={handlePay}>
            <div className="payment-card-form__title">
              <div>
                <h1>Thông tin thanh toán</h1>
                <p>Thanh toán bằng thẻ tín dụng hoặc thẻ ghi nợ</p>
              </div>
              <div className="payment-card-form__brands"><span>VISA</span><span>MC</span></div>
            </div>

            <label>
              <span>Số thẻ</span>
              <div className="payment-card-input">
                <input
                  inputMode="numeric"
                  value={card.number}
                  onChange={(event) => setCard(current => ({ ...current, number: formatCardNumber(event.target.value) }))}
                  placeholder="0000 0000 0000 0000"
                  autoComplete="cc-number"
                />
                <span>▣</span>
              </div>
            </label>

            <label>
              <span>Tên in trên thẻ</span>
              <input
                value={card.name}
                onChange={(event) => setCard(current => ({ ...current, name: event.target.value.toUpperCase() }))}
                placeholder="NGUYEN VAN A"
                autoComplete="cc-name"
              />
            </label>

            <div className="payment-card-form__row">
              <label>
                <span>Ngày hết hạn</span>
                <input
                  value={card.expiry}
                  onChange={(event) => setCard(current => ({ ...current, expiry: event.target.value.replace(/[^\d/]/g, '').slice(0, 5) }))}
                  placeholder="MM/YY"
                  autoComplete="cc-exp"
                />
              </label>
              <label>
                <span>CVC/CVV</span>
                <input
                  inputMode="numeric"
                  type="password"
                  value={card.cvc}
                  onChange={(event) => setCard(current => ({ ...current, cvc: event.target.value.replace(/\D/g, '').slice(0, 4) }))}
                  placeholder="123"
                  autoComplete="cc-csc"
                />
              </label>
            </div>

            <label className="payment-card-form__save">
              <input type="checkbox" />
              <span>Ghi nhớ thông tin thanh toán trên thiết bị này</span>
            </label>

            {error && <div className="alert alert-error">{error}</div>}

            <button type="submit" className="payment-card-form__pay" disabled={processing}>
              {processing ? <><span className="spinner" /> Đang xác thực giao dịch...</> : `Thanh toán ${formatPrice(order.totalAmount)}`}
            </button>
            <button type="button" className="payment-card-form__cancel" onClick={handleCancel} disabled={processing}>
              Hủy và quay lại đơn hàng
            </button>
            <p className="payment-card-form__test">Thẻ test: 4242 4242 4242 4242 · 12/30 · 123</p>
          </form>
        </div>
      </div>
    </div>
  );
}

function PaymentResult({ success }) {
  const [params] = useSearchParams();
  const orderId = params.get('orderId');

  return (
    <div className="payment-result container">
      <div className={`payment-result__icon ${success ? 'success' : 'cancel'}`}>{success ? '✓' : '×'}</div>
      <span className="payment-result__label">{success ? 'Giao dịch thành công' : 'Giao dịch chưa hoàn tất'}</span>
      <h1>{success ? 'Thanh toán thành công!' : 'Thanh toán đã hủy'}</h1>
      <p>
        {success
          ? 'Khoản thanh toán đã được ghi nhận. Đơn hàng sẽ được xử lý và giao đến bạn trong thời gian sớm nhất.'
          : 'Đơn hàng vẫn được lưu trong tài khoản. Bạn có thể kiểm tra trạng thái hoặc lựa chọn phương thức khác.'}
      </p>
      <div className="payment-result__actions">
        {orderId && <Link to={`/orders/${orderId}`} className="btn btn-outline">Xem chi tiết đơn hàng</Link>}
        <Link to={success ? '/products' : '/orders'} className="btn btn-primary">
          {success ? 'Tiếp tục mua sắm' : 'Xem đơn hàng'}
        </Link>
      </div>
    </div>
  );
}

export function PaymentSuccessPage() {
  return <PaymentResult success />;
}

export function PaymentCancelPage() {
  return <PaymentResult success={false} />;
}
