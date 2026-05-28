import { Link, useSearchParams } from 'react-router-dom';

export function PaymentSuccessPage() {
  const [params] = useSearchParams();
  const orderId = params.get('orderId');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '16px', textAlign: 'center', padding: '40px' }}>
      <div style={{ fontSize: '4rem' }}>✓</div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 400 }}>
        Thanh toán thành công!
      </h1>
      <p style={{ color: 'var(--text-secondary)', maxWidth: '400px' }}>
        Đơn hàng của bạn đã được xác nhận. Chúng tôi sẽ xử lý và giao hàng sớm nhất có thể.
      </p>
      {orderId && (
        <Link to={`/orders/${orderId}`} className="btn btn-outline mt-md">
          Xem chi tiết đơn hàng
        </Link>
      )}
      <Link to="/products" className="btn btn-primary">
        Tiếp tục mua sắm
      </Link>
    </div>
  );
}

export function PaymentCancelPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '16px', textAlign: 'center', padding: '40px' }}>
      <div style={{ fontSize: '4rem' }}>✕</div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 400 }}>
        Thanh toán bị hủy
      </h1>
      <p style={{ color: 'var(--text-secondary)', maxWidth: '400px' }}>
        Giao dịch đã bị hủy. Đơn hàng của bạn vẫn được lưu, bạn có thể thử thanh toán lại.
      </p>
      <Link to="/orders" className="btn btn-outline mt-md">
        Xem đơn hàng
      </Link>
      <Link to="/cart" className="btn btn-primary">
        Về giỏ hàng
      </Link>
    </div>
  );
}
