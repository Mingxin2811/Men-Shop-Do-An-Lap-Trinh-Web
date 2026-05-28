import { useState, useEffect } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { orderService } from '../services/order.service';
import './OrderPages.css';

const formatPrice = (p) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);

const formatDate = (d) =>
  new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(d));

const STATUS_LABELS = {
  PENDING: { label: 'Chờ xử lý', color: '#d97706' },
  CONFIRMED: { label: 'Đã xác nhận', color: '#2563eb' },
  SHIPPING: { label: 'Đang giao', color: '#7c3aed' },
  COMPLETED: { label: 'Hoàn thành', color: '#16a34a' },
  CANCELLED: { label: 'Đã hủy', color: '#dc2626' },
};

const PAYMENT_LABELS = {
  UNPAID: { label: 'Chưa thanh toán', color: '#d97706' },
  PENDING: { label: 'Đang xử lý', color: '#2563eb' },
  PAID: { label: 'Đã thanh toán', color: '#16a34a' },
  FAILED: { label: 'Thất bại', color: '#dc2626' },
  REFUNDED: { label: 'Hoàn tiền', color: '#6b7280' },
};

export function OrderHistoryPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderService.getMyOrders()
      .then(res => setOrders(res.data.data || []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-center"><div className="spinner spinner-lg" /></div>;

  return (
    <div className="order-history container">
      <div className="page-header">
        <h1>Lịch sử đơn hàng</h1>
      </div>

      {orders.length === 0 ? (
        <div className="order-empty">
          <p>Bạn chưa có đơn hàng nào.</p>
          <Link to="/products" className="btn btn-primary mt-lg">Mua sắm ngay</Link>
        </div>
      ) : (
        <div className="order-list">
          {orders.map(order => (
            <Link key={order.id} to={`/orders/${order.id}`} className="order-card">
              <div className="order-card__header">
                <div>
                  <p className="order-card__id">#{order.id.slice(-8).toUpperCase()}</p>
                  <p className="order-card__date">{formatDate(order.createdAt)}</p>
                </div>
                <div className="order-card__badges">
                  <StatusBadge status={order.status} map={STATUS_LABELS} />
                  <StatusBadge status={order.paymentStatus} map={PAYMENT_LABELS} />
                </div>
              </div>
              <div className="order-card__items">
                {order.items?.slice(0, 3).map(item => (
                  <span key={item.id} className="order-card__item">{item.productName} ×{item.quantity}</span>
                ))}
                {order.items?.length > 3 && <span className="order-card__item">+{order.items.length - 3} sản phẩm</span>}
              </div>
              <div className="order-card__footer">
                <span>{order.paymentMethod}</span>
                <span className="order-card__total">{formatPrice(order.totalAmount)}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export function OrderDetailPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const isSuccess = searchParams.get('success') === 'true';
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderService.getOrder(id)
      .then(res => setOrder(res.data.data))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="loading-center"><div className="spinner spinner-lg" /></div>;
  if (!order) return <div className="container"><p>Không tìm thấy đơn hàng.</p></div>;

  return (
    <div className="order-detail container">
      {isSuccess && (
        <div className="alert alert-success" style={{ marginBottom: '24px', fontSize: '1rem' }}>
          🎉 Đặt hàng thành công! Cảm ơn bạn đã tin tưởng Men's Shop.
        </div>
      )}

      <div className="page-header">
        <h1>Chi tiết đơn hàng</h1>
        <Link to="/orders" className="btn btn-ghost">← Quay lại</Link>
      </div>

      <div className="order-detail__layout">
        <div>
          {/* Info */}
          <div className="card mb-lg">
            <div className="order-info-grid">
              <div>
                <p className="info-label">Mã đơn hàng</p>
                <p className="info-value">#{order.id.slice(-8).toUpperCase()}</p>
              </div>
              <div>
                <p className="info-label">Ngày đặt</p>
                <p className="info-value">{formatDate(order.createdAt)}</p>
              </div>
              <div>
                <p className="info-label">Phương thức TT</p>
                <p className="info-value">{order.paymentMethod}</p>
              </div>
              <div>
                <p className="info-label">Trạng thái</p>
                <StatusBadge status={order.status} map={STATUS_LABELS} />
              </div>
              <div>
                <p className="info-label">Thanh toán</p>
                <StatusBadge status={order.paymentStatus} map={PAYMENT_LABELS} />
              </div>
            </div>
          </div>

          {/* Shipping */}
          <div className="card mb-lg">
            <h4 style={{ marginBottom: '16px' }}>Thông tin giao hàng</h4>
            <p><strong>{order.shippingName}</strong></p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{order.shippingPhone}</p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{order.shippingAddress}</p>
          </div>

          {/* Items */}
          <div className="card">
            <h4 style={{ marginBottom: '16px' }}>Sản phẩm đã đặt</h4>
            {order.items?.map(item => (
              <div key={item.id} className="order-item">
                <div>
                  <p className="order-item__name">{item.productName}</p>
                  {item.size && <p className="order-item__variant">{item.size} · {item.color}</p>}
                </div>
                <div className="order-item__right">
                  <span>×{item.quantity}</span>
                  <span>{formatPrice(item.price * item.quantity)}</span>
                </div>
              </div>
            ))}
            <div className="order-total">
              <span>Tổng cộng</span>
              <span>{formatPrice(order.totalAmount)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status, map }) {
  const s = map[status] || { label: status, color: '#6b7280' };
  return (
    <span className="status-badge" style={{ color: s.color, borderColor: s.color }}>
      {s.label}
    </span>
  );
}
